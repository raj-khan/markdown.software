import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display: a soft, old-style serif with print-shop warmth - used with restraint.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

// UI: a warm, legible grotesque for the chrome.
const hanken = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

// The editor itself: an editorial monospace you'd want to write in for an hour.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = "https://www.markdowntopdf.sh";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "markdowntopdf.sh - Markdown to PDF, free & open source",
  description:
    "A typesetting bench for plain text. Write Markdown, watch it set on the page, and export a polished PDF. Free, open source, no sign-up.",
  keywords: [
    "markdown to pdf",
    "md to pdf",
    "markdown editor",
    "open source",
    "pdf export",
  ],
  openGraph: {
    title: "Markdown to PDF - free & open source",
    description:
      "Write Markdown with a live preview and download a polished PDF.",
    url: siteUrl,
    siteName: "markdowntopdf.sh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
