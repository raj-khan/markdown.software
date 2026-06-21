import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app has its own lockfile; pin the workspace root so Turbopack and
  // output file tracing don't pick up a parent directory.
  turbopack: {
    root: import.meta.dirname,
  },
  // Keep the headless-browser packages out of the bundle so their native
  // binaries resolve correctly in serverless functions.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
