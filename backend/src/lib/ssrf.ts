import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { badRequest } from "./errors.js";

/**
 * SSRF guard for user-supplied URLs (outbound webhooks).
 *
 * assertPublicUrl resolves the hostname and rejects anything that maps to a
 * non-public address: loopback, private, link-local (incl. cloud metadata
 * 169.254.169.254), CGNAT, multicast and reserved ranges — for both IPv4 and
 * IPv6 (including IPv4-mapped IPv6). Call it at registration time AND again
 * right before connecting, since DNS answers can change.
 */

function isPrivateV4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true; // unparseable — treat as unsafe
  }
  const a = parts[0]!;
  const b = parts[1]!;
  return (
    a === 0 || // 0.0.0.0/8 "this network"
    a === 10 || // 10/8
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // CGNAT 100.64/10
    (a === 169 && b === 254) || // link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) || // 172.16/12
    (a === 192 && b === 168) || // 192.168/16
    (a === 198 && (b === 18 || b === 19)) || // benchmarking 198.18/15
    a >= 224 // multicast 224/4 + reserved 240/4
  );
}

function isPrivateV6(ip: string): boolean {
  const lower = ip.toLowerCase();
  // IPv4-mapped IPv6 (::ffff:a.b.c.d) — check the embedded v4 address.
  const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]!);
  if (lower === "::" || lower === "::1") return true;
  const first = parseInt(lower.split(":")[0] || "0", 16);
  return (
    (first & 0xfe00) === 0xfc00 || // fc00::/7 unique-local
    (first & 0xffc0) === 0xfe80 || // fe80::/10 link-local
    (first & 0xff00) === 0xff00 // ff00::/8 multicast
  );
}

export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateV4(ip);
  if (version === 6) return isPrivateV6(ip);
  return true; // not an IP literal — unsafe
}

/**
 * Validate that a URL is https and resolves only to public addresses.
 * Throws AppError(400, "url_not_allowed") otherwise. Returns the parsed URL.
 */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw badRequest("invalid_url", "Invalid URL");
  }
  if (url.protocol !== "https:") {
    throw badRequest("url_not_allowed", "Webhook URL must use https");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  let addresses: string[];
  if (isIP(host)) {
    addresses = [host];
  } else {
    try {
      const records = await lookup(host, { all: true, verbatim: true });
      addresses = records.map((r) => r.address);
    } catch {
      throw badRequest("url_not_allowed", "Webhook host could not be resolved");
    }
  }
  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw badRequest(
      "url_not_allowed",
      "Webhook URL resolves to a private or reserved address",
    );
  }
  return url;
}
