import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { config } from "../config.js";
import { randomToken } from "./crypto.js";

/**
 * Signed visitor tokens for the web chat widget.
 *
 * Format: base64url(payload).base64url(hmac-sha256). The payload carries a
 * server-generated 192-bit visitor id, the channel account it belongs to, and
 * an expiry. Tokens are bearer credentials — anyone holding one can read that
 * visitor's thread, which is why they are only issued by the public token
 * endpoint and verified on every widget call.
 */

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function signingKey(): Buffer {
  // Domain-separated key so widget tokens can't be forged from other HMAC uses.
  return createHash("sha256").update(`widget-visitor|${config.JWT_SECRET}`).digest();
}

interface VisitorPayload {
  /** channel account id */
  aid: string;
  /** visitor id — 192 bits of randomness */
  vid: string;
  /** expiry, epoch ms */
  exp: number;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(data: string): string {
  return createHmac("sha256", signingKey()).update(data).digest("base64url");
}

/**
 * Issue a signed visitor token for a channel account. When visitorId is given
 * (e.g. migrating a legacy client-supplied id) it is preserved inside the
 * token so the visitor keeps their thread; otherwise a 192-bit id is generated.
 */
export function issueVisitorToken(
  accountId: string,
  visitorId?: string,
  ttlMs = TOKEN_TTL_MS,
): string {
  const payload: VisitorPayload = {
    aid: accountId,
    vid: visitorId ?? randomToken(24),
    exp: Date.now() + ttlMs,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/**
 * Verify a visitor token for the given account.
 * Returns the visitor id, or null when the token is malformed, forged,
 * expired, or issued for a different account.
 */
export function verifyVisitorToken(token: string, accountId: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as VisitorPayload;
    if (payload.aid !== accountId) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (typeof payload.vid !== "string" || payload.vid.length < 1 || payload.vid.length > 200) {
      return null;
    }
    return payload.vid;
  } catch {
    return null;
  }
}

/** Token expiry timestamp (ms) for API responses. */
export function visitorTokenExpiresAt(): number {
  return Date.now() + TOKEN_TTL_MS;
}
