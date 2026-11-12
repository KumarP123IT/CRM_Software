import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent, type Dispatcher } from "undici";
import { badRequest } from "./errors.js";

/**
 * SSRF guard for user-supplied URLs (outbound webhooks).
 *
 * resolvePublicTarget resolves the hostname once, rejects anything that maps
 * to a non-public address (loopback, private, link-local incl. cloud metadata
 * 169.254.169.254, CGNAT, multicast, reserved — IPv4 and IPv6 incl.
 * IPv4-mapped), and restricts the URL to https on the default port.
 *
 * pinnedDispatcher returns an undici Agent whose connect.lookup is pinned to
 * exactly the addresses that were validated, so the socket cannot be rebound
 * to a private IP by a second DNS answer (DNS-rebinding gap). Redirects are
 * not followed by callers (redirect: "manual"), so no second host is ever
 * contacted.
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

export interface PublicUrlTarget {
  url: URL;
  /** Validated addresses the hostname resolved to — pin the socket to these. */
  addresses: { address: string; family: number }[];
}

/**
 * Validate that a URL is https on the default port and resolves only to
 * public addresses. Returns the parsed URL plus the validated addresses for
 * pinning. Throws AppError(400, "url_not_allowed") otherwise.
 */
export async function resolvePublicTarget(raw: string): Promise<PublicUrlTarget> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw badRequest("invalid_url", "Invalid URL");
  }
  if (url.protocol !== "https:") {
    throw badRequest("url_not_allowed", "Webhook URL must use https");
  }
  // Only the default https port — no exfiltration to odd ports / internal
  // services listening on non-standard ports.
  if (url.port !== "" && url.port !== "443") {
    throw badRequest("url_not_allowed", "Webhook URL must use port 443");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  let addresses: { address: string; family: number }[];
  if (isIP(host)) {
    addresses = [{ address: host, family: isIP(host) }];
  } else {
    try {
      const records = await lookup(host, { all: true, verbatim: true });
      addresses = records.map((r) => ({ address: r.address, family: r.family }));
    } catch {
      throw badRequest("url_not_allowed", "Webhook host could not be resolved");
    }
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) {
    throw badRequest(
      "url_not_allowed",
      "Webhook URL resolves to a private or reserved address",
    );
  }
  return { url, addresses };
}

/**
 * Registration-time check — validates the URL but does not pin (the socket
 * is not opened here). Delivery must use resolvePublicTarget + pinnedDispatcher.
 */
export async function assertPublicUrl(raw: string): Promise<URL> {
  return (await resolvePublicTarget(raw)).url;
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | { address: string; family: number }[],
  family?: number,
) => void;

/**
 * undici Agent that always connects to the pre-validated addresses for the
 * webhook host, ignoring any fresh DNS answer. This closes the DNS-rebinding
 * window between assert-time resolution and connect-time resolution.
 */
export function pinnedDispatcher(target: PublicUrlTarget): Dispatcher {
  const { addresses } = target;
  const pinnedLookup = (
    _hostname: string,
    options: unknown,
    callback: LookupCallback,
  ) => {
    const wantsAll =
      typeof options === "object" && options !== null &&
      (options as { all?: boolean }).all === true;
    if (wantsAll) {
      callback(null, addresses);
    } else {
      callback(null, addresses[0]!.address, addresses[0]!.family);
    }
  };
  return new Agent({
    connect: { lookup: pinnedLookup as never },
  });
}
