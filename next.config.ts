import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy. Scripts/styles use 'unsafe-inline' because the
// framework injects inline bootstrap without per-request nonces (a nonce-based
// strict CSP is a tracked follow-up in SECURITY.md). 'unsafe-eval' is dev-only
// (HMR). Images allow https/data/blob so user-provided images and the PDF blob
// preview work.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "connect-src 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // This app has its own lockfile; pin the workspace root so Turbopack and
  // output file tracing don't pick up a parent directory.
  turbopack: {
    root: import.meta.dirname,
  },
  // Keep the headless-browser packages out of the bundle so their native
  // binaries resolve correctly in serverless functions.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  // @sparticuz/chromium loads its Brotli-packed binary from `bin/` via the
  // filesystem (not `require`), so Vercel's tracer won't pick it up on its own.
  // Force it into the PDF function's bundle or Chromium can't launch.
  outputFileTracingIncludes: {
    "/api/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
