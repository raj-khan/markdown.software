import "server-only";
import net from "node:net";
import { lookup } from "node:dns/promises";

/**
 * Returns true if an IP literal is in a private, loopback, link-local, or
 * otherwise reserved range that must never be reachable from the PDF renderer.
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true; // this-host, private, loopback
    if (a === 169 && b === 254) return true; // link-local (incl. cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::" || lower === "::1") return true; // unspecified, loopback
    if (lower.startsWith("fe80")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
    const mapped = lower.match(/::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (mapped) return isPrivateIp(mapped[1]); // IPv4-mapped
    return false;
  }
  return true; // not a valid IP literal -> treat as unsafe
}

/**
 * Validates a URL the headless browser is about to fetch while rendering a PDF.
 * Only public http(s) destinations are allowed; everything that could reach the
 * loopback interface, private networks, cloud metadata, or local files is
 * rejected. Hostnames are resolved so DNS entries that point at private IPs are
 * caught too.
 */
export async function isSafePublicUrl(raw: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return false;
  }

  if (net.isIP(host)) return !isPrivateIp(host);

  try {
    const records = await lookup(host, { all: true });
    if (records.length === 0) return false;
    return records.every((r) => !isPrivateIp(r.address));
  } catch {
    return false;
  }
}
