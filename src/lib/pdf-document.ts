import type { PdfOptions } from "./pdf-options";

/**
 * Wrap rendered Markdown body HTML in a complete, self-contained HTML
 * document with inlined CSS, ready to hand to a headless browser for
 * printing. Keeping this separate from the route makes it easy to unit
 * test and to reuse the exact same styling on the client if needed.
 */
export function buildPdfHtml({
  bodyHtml,
  markdownCss,
  highlightCss,
  options,
}: {
  bodyHtml: string;
  markdownCss: string;
  highlightCss: string;
  options: PdfOptions;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
${markdownCss}
${highlightCss}
    </style>
    <style>
      /* Page size & margins are applied by the headless browser's PDF
         options (see the API route): ${options.pageSize} / ${options.margin}.
         We intentionally do NOT set an @page margin here, otherwise it would
         override the browser's print margins and zero them out. */
      html, body {
        background: #ffffff;
        margin: 0;
        padding: 0;
      }
      .markdown-body {
        box-sizing: border-box;
        max-width: 100%;
        margin: 0 auto;
        padding: 0;
        font-size: 12pt;
      }
      /* Avoid awkward page breaks. */
      .markdown-body h1,
      .markdown-body h2,
      .markdown-body h3 {
        break-after: avoid;
      }
      .markdown-body pre,
      .markdown-body table,
      .markdown-body img {
        break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <article class="markdown-body">
${bodyHtml}
    </article>
  </body>
</html>`;
}
