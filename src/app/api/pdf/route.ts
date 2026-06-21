import { NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/markdown";
import { buildPdfHtml } from "@/lib/pdf-document";
import { MARKDOWN_CSS, HIGHLIGHT_CSS } from "@/lib/pdf-styles";
import {
  DEFAULT_PDF_OPTIONS,
  PAGE_SIZES,
  type PdfOptions,
} from "@/lib/pdf-options";
import { launchBrowser } from "@/lib/browser";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MARKDOWN_BYTES = 1_000_000; // ~1MB of source text.

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

export async function POST(request: Request) {
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
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: pdfOptions.pageSize,
      printBackground: pdfOptions.printBackground,
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
