import { NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/markdown";
import { buildPdfHtml } from "@/lib/pdf-document";
import { MARKDOWN_CSS, HIGHLIGHT_CSS } from "@/lib/pdf-styles";
import {
  DEFAULT_PDF_OPTIONS,
  PAGE_SIZES,
  type PdfOptions,
} from "@/lib/pdf-options";
import type { HTTPRequest } from "puppeteer-core";
import { launchBrowser } from "@/lib/browser";
import { isSafePublicUrl } from "@/lib/ssrf";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MARKDOWN_BYTES = 1_000_000; // ~1MB of source text.
const RENDER_TIMEOUT_MS = 20_000;

function sanitizeFilename(input: unknown): string {
  const base =
    typeof input === "string" && input.trim() ? input.trim() : "document";
  const cleaned = base
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9-_ ]/gi, "")
    .trim()
    .slice(0, 100);
  return `${cleaned || "document"}.pdf`;
}

function parseOptions(input: unknown): PdfOptions {
  const o = (input ?? {}) as Partial<PdfOptions>;
  const pageSize = PAGE_SIZES.includes(o.pageSize as PdfOptions["pageSize"])
    ? (o.pageSize as PdfOptions["pageSize"])
    : DEFAULT_PDF_OPTIONS.pageSize;
  const margin =
    typeof o.margin === "string" && /^[\d.]+(mm|cm|in|px)$/.test(o.margin.trim())
      ? o.margin.trim()
      : DEFAULT_PDF_OPTIONS.margin;
  return {
    pageSize,
    margin,
    printBackground: o.printBackground !== false,
  };
}

// Decides, per resource the headless browser tries to fetch while rendering,
// whether to allow it. Only images to public http(s) or data URLs are allowed.
async function guardRequest(req: HTTPRequest): Promise<void> {
  const allow = () => req.continue().catch(() => {});
  const block = () => req.abort().catch(() => {});
  try {
    const url = req.url();
    const type = req.resourceType();
    if (type === "document" || url === "about:blank") return void allow();
    if (url.startsWith("data:")) return void (type === "image" ? allow() : block());
    if (type === "image" && (await isSafePublicUrl(url))) return void allow();
    return void block();
  } catch {
    return void block();
  }
}

export async function POST(request: Request) {
  // Rate limit the expensive render endpoint per client IP.
  const limit = rateLimit(`pdf:${clientIp(request)}`, { max: 20, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { markdown, filename, options } = (body ?? {}) as {
    markdown?: unknown;
    filename?: unknown;
    options?: unknown;
  };

  if (typeof markdown !== "string" || markdown.length === 0) {
    return NextResponse.json(
      { error: "A non-empty `markdown` string is required." },
      { status: 400 },
    );
  }
  if (Buffer.byteLength(markdown, "utf8") > MAX_MARKDOWN_BYTES) {
    return NextResponse.json(
      { error: "Markdown document is too large." },
      { status: 413 },
    );
  }

  const pdfOptions = parseOptions(options);
  const bodyHtml = renderMarkdown(markdown);
  const html = buildPdfHtml({
    bodyHtml,
    markdownCss: MARKDOWN_CSS,
    highlightCss: HIGHLIGHT_CSS,
    options: pdfOptions,
  });

  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // The rendered HTML is fully static, so JavaScript is never needed.
    await page.setJavaScriptEnabled(false);

    // SSRF guard: only allow image resources to public http(s)/data URLs.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      void guardRequest(req);
    });

    await page.setContent(html, {
      waitUntil: "load",
      timeout: RENDER_TIMEOUT_MS,
    });
    const pdf = await page.pdf({
      format: pdfOptions.pageSize,
      printBackground: pdfOptions.printBackground,
      timeout: RENDER_TIMEOUT_MS,
      margin: {
        top: pdfOptions.margin,
        bottom: pdfOptions.margin,
        left: pdfOptions.margin,
        right: pdfOptions.margin,
      },
    });

    return new NextResponse(pdf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(filename)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 },
    );
  } finally {
    await browser?.close();
  }
}
