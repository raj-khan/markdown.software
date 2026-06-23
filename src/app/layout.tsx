import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { SITE_URL, SITE_NAME } from "@/lib/site";
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

const title = "markdowntopdf.sh - Markdown to PDF, free & open source";
const description =
  "A typesetting bench for plain text. Write Markdown, watch it set on the page, and export a polished PDF. Free, open source, no sign-up.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s - markdowntopdf.sh",
  },
  description,
  applicationName: SITE_NAME,
  keywords: [
    "markdown to pdf",
    "md to pdf",
    "markdown to pdf converter",
    "markdown editor",
    "convert markdown to pdf",
    "export pdf",
    "free markdown to pdf",
    "open source",
  ],
  authors: [{ name: "Meher Ullah Khan Raj", url: "https://github.com/raj-khan" }],
  creator: "Meher Ullah Khan Raj",
  category: "productivity",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title,
    description:
      "Write Markdown with a live preview and download a polished, vector-quality PDF. Free, open source, no sign-up.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description:
      "Write Markdown with a live preview and download a polished, vector-quality PDF. Free, open source, no sign-up.",
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
