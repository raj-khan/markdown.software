/**
 * Canonical site URL, shared by metadata, OG images, robots, and the sitemap.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL - set this once the final domain is live.
 *   2. VERCEL_PROJECT_PRODUCTION_URL - the stable production host on Vercel, so
 *      social-share images resolve correctly on preview/prod before a custom
 *      domain is attached.
 *   3. Local fallback.
 *
 * Keeping it absolute matters: Open Graph and Twitter image URLs must be
 * absolute, or crawlers (Slack, X, Facebook) silently drop the preview.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "https://www.markdowntopdf.sh";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "markdowntopdf.sh";
