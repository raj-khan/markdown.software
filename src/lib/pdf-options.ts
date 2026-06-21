// Shared between the client (to send options) and the server (to apply them).
export type PageSize = "A4" | "Letter" | "Legal" | "A3";

export type PdfOptions = {
  pageSize: PageSize;
  /** CSS margin shorthand, e.g. "20mm". */
  margin: string;
  /** Print background colors / code-block shading. */
  printBackground: boolean;
};

export const DEFAULT_PDF_OPTIONS: PdfOptions = {
  pageSize: "A4",
  margin: "20mm",
  printBackground: true,
};

export const PAGE_SIZES: PageSize[] = ["A4", "Letter", "Legal", "A3"];
