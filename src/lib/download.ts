import type { PdfOptions } from "./pdf-options";

/**
 * POST the current document to the PDF API and trigger a browser download.
 * Runs only in the browser (uses fetch + DOM).
 */
export async function downloadPdf({
  markdown,
  filename,
  options,
}: {
  markdown: string;
  filename: string;
  options: PdfOptions;
}): Promise<void> {
  const response = await fetch("/api/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown, filename, options }),
  });

  if (!response.ok) {
    let message = "Failed to generate PDF.";
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // Ignore - use the default message.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const safeName = filename.toLowerCase().endsWith(".pdf")
    ? filename
    : `${filename}.pdf`;

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = safeName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  // Mobile browsers read the blob asynchronously after the click. Revoking
  // the object URL (or removing the anchor) immediately races that and shows
  // "Download failed", so we defer cleanup.
  setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 30_000);
}
