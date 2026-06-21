import "server-only";
import puppeteer, { type Browser } from "puppeteer-core";

// Common locations for a system Chrome/Chromium during local development.
const LOCAL_CANDIDATES = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
];

function isServerless(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_REGION,
  );
}

async function resolveLocalExecutable(): Promise<string | undefined> {
  const explicit =
    process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  if (explicit) return explicit;

  const { existsSync } = await import("node:fs");
  return LOCAL_CANDIDATES.find((p) => existsSync(p));
}

/**
 * Launch a headless browser that works both locally (system Chrome) and on
 * Vercel / AWS Lambda (@sparticuz/chromium). Callers must `close()` it.
 */
export async function launchBrowser(): Promise<Browser> {
  if (!isServerless()) {
    const executablePath = await resolveLocalExecutable();
    if (executablePath) {
      return puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
    // Fall through to the bundled chromium if no system browser was found.
  }

  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}
