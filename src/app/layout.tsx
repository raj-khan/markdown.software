import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.markdowntopdf.sh";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Markdown to PDF — free & open source",
  description:
    "Write Markdown with a live preview and download a polished PDF. Free, open source, no sign-up.",
  keywords: [
    "markdown to pdf",
    "md to pdf",
    "markdown editor",
    "open source",
    "pdf export",
  ],
  openGraph: {
    title: "Markdown to PDF — free & open source",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
