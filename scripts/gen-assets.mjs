// Generates the branded social/share + icon assets from the "Shell & Paper"
// identity, rendered through a local Chrome via puppeteer-core. Re-run after a
// brand change:  node scripts/gen-assets.mjs
//
// Outputs (all under src/app/, picked up by Next's file-based metadata):
//   opengraph-image.png / twitter-image.png  - 1200x630 social card
//   apple-icon.png                            - 180x180 touch icon
//   favicon.ico                               - 16/32/48 multi-size icon
import puppeteer from "puppeteer-core";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const APP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

const CHROME = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].find((p) => existsSync(p));

const SHELL = "#1a1a21";
const RUST = "#b5552f";

// The registration mark (circle + crosshair) on a dark rounded tile - our logo.
const markTile = (s) => `
  <div style="width:${s}px;height:${s}px;border-radius:${s * 0.22}px;background:${SHELL};
       display:flex;align-items:center;justify-content:center">
    <svg width="${s * 0.66}" height="${s * 0.66}" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="7" stroke="${RUST}" stroke-width="2.5" />
      <line x1="16" y1="3" x2="16" y2="29" stroke="${RUST}" stroke-width="2.5" stroke-linecap="round" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="${RUST}" stroke-width="2.5" stroke-linecap="round" />
    </svg>
  </div>`;

const fonts = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const ogHtml = `<!doctype html><html><head><meta charset="utf-8">${fonts}
<style>*{margin:0;box-sizing:border-box}</style></head>
<body style="width:1200px;height:630px;display:flex;font-family:'Hanken Grotesk',sans-serif;
  background:${SHELL};
  background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.04) 1px, transparent 0);
  background-size:26px 26px;overflow:hidden">

  <!-- left: the shell / wordmark -->
  <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:64px 56px">
    <div style="display:flex;align-items:center;gap:16px">
      ${markTile(54)}
      <span style="font-family:'IBM Plex Mono',monospace;font-size:15px;letter-spacing:.28em;
        color:#9b99a4;text-transform:uppercase">Markdown &nbsp;&rarr;&nbsp; PDF</span>
    </div>

    <div>
      <h1 style="font-family:'Fraunces',serif;font-weight:500;font-size:72px;line-height:1.0;
        letter-spacing:-.02em;color:#e9e7e0">markdowntopdf<span style="color:${RUST}">.sh</span></h1>
      <p style="font-family:'Fraunces',serif;font-size:27px;color:#c9c7c0;margin-top:18px">
        A typesetting bench for plain text.</p>
      <p style="font-size:20px;line-height:1.5;color:#9b99a4;margin-top:14px;max-width:440px">
        Write Markdown, watch it set on the page, and export a polished PDF.</p>
    </div>

    <div style="display:flex;gap:10px">
      ${["Free", "Open source", "No sign-up"]
        .map(
          (t) => `<span style="display:flex;align-items:center;gap:8px;font-size:16px;color:#c9c7c0;
            border:1px solid #32323d;border-radius:999px;padding:8px 16px;background:#22222b">
            <span style="width:7px;height:7px;border-radius:99px;background:${RUST}"></span>${t}</span>`,
        )
        .join("")}
    </div>
  </div>

  <!-- right: the paper it makes -->
  <div style="width:440px;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#201f27,#16151b)">
    <div style="position:relative;transform:rotate(2.5deg)">
      <!-- crop-mark corners -->
      <div style="position:absolute;top:-9px;left:-9px;width:18px;height:18px;border-top:2px solid ${RUST};border-left:2px solid ${RUST}"></div>
      <div style="position:absolute;top:-9px;right:-9px;width:18px;height:18px;border-top:2px solid ${RUST};border-right:2px solid ${RUST}"></div>
      <div style="position:absolute;bottom:-9px;left:-9px;width:18px;height:18px;border-bottom:2px solid ${RUST};border-left:2px solid ${RUST}"></div>
      <div style="position:absolute;bottom:-9px;right:-9px;width:18px;height:18px;border-bottom:2px solid ${RUST};border-right:2px solid ${RUST}"></div>

      <div style="width:300px;height:392px;background:#fff;border-radius:3px;
        box-shadow:0 30px 60px -20px rgba(0,0,0,.6);padding:34px 30px;overflow:hidden">
        <div style="font-family:'Fraunces',serif;font-size:24px;font-weight:600;color:#1a1a21">Project README</div>
        <div style="width:46px;height:3px;background:${RUST};border-radius:2px;margin:12px 0 20px"></div>
        ${[100, 92, 78]
          .map(
            (w) =>
              `<div style="height:9px;border-radius:3px;background:#e3ded3;width:${w}%;margin-bottom:11px"></div>`,
          )
          .join("")}
        <div style="background:#1a1a21;border-radius:6px;padding:14px;margin:18px 0">
          ${[70, 88, 55]
            .map(
              (w, i) =>
                `<div style="height:7px;border-radius:3px;background:${i === 1 ? RUST : "#4a4a55"};width:${w}%;margin-bottom:9px"></div>`,
            )
            .join("")}
        </div>
        ${[96, 84]
          .map(
            (w) =>
              `<div style="height:9px;border-radius:3px;background:#e3ded3;width:${w}%;margin-bottom:11px"></div>`,
          )
          .join("")}
      </div>
    </div>
  </div>
</body></html>`;

const iconHtml = (size) => `<!doctype html><html><head><meta charset="utf-8">
<style>*{margin:0}html,body{width:${size}px;height:${size}px}</style></head>
<body>${markTile(size)}</body></html>`;

// --- minimal ICO encoder: wraps PNG frames into a single .ico ---
function buildIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);
  const dir = Buffer.alloc(16 * frames.length);
  let offset = 6 + dir.length;
  frames.forEach((f, i) => {
    const e = i * 16;
    dir.writeUInt8(f.size >= 256 ? 0 : f.size, e + 0);
    dir.writeUInt8(f.size >= 256 ? 0 : f.size, e + 1);
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // planes
    dir.writeUInt16LE(32, e + 6); // bpp
    dir.writeUInt32LE(f.png.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += f.png.length;
  });
  return Buffer.concat([header, dir, ...frames.map((f) => f.png)]);
}

async function shoot(page, html, w, h, scale, omitBackground = false) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 250));
  return page.screenshot({
    type: "png",
    omitBackground, // transparent bg -> RGBA PNG (required for ICO frames)
    clip: { x: 0, y: 0, width: w, height: h },
  });
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--force-color-profile=srgb"],
});
const page = await browser.newPage();

// Social card (shared by OG + Twitter), rendered at 2x for retina feeds.
const og = await shoot(page, ogHtml, 1200, 630, 2);
await writeFile(path.join(APP, "opengraph-image.png"), og);
await writeFile(path.join(APP, "twitter-image.png"), og);
console.log("wrote opengraph-image.png + twitter-image.png");

// Apple touch icon.
const apple = await shoot(page, iconHtml(180), 180, 180, 1);
await writeFile(path.join(APP, "apple-icon.png"), apple);
console.log("wrote apple-icon.png");

// favicon.ico with 16/32/48 frames.
const frames = [];
for (const size of [16, 32, 48]) {
  const png = await shoot(page, iconHtml(size), size, size, 1, true);
  frames.push({ size, png });
}
await writeFile(path.join(APP, "favicon.ico"), buildIco(frames));
console.log("wrote favicon.ico (16/32/48)");

await browser.close();
