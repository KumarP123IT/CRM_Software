import * as Sentry from "@sentry/node";
import type { ErrorEvent, EventHint } from "@sentry/node";
import { config } from "../config.js";

/**
 * Error reporting, gated by SENTRY_DSN. Disabled (no-op) when unset, so dev,
 * tests and self-hosted installs without a DSN are unaffected.
 *
 * Customer messages, phone numbers, emails and tokens are personal data —
 * scrubEvent strips them from events before they leave the process, mirroring
 * the pino redaction paths in lib/logger.ts.
 */

const STRONG_WORDS = new Set([
  "password", "passwd", "secret", "token", "credential", "credentials",
  "session", "jwt", "apikey", "authorization", "cookie", "email", "e-mail",
  "mail", "phone", "phonenumber", "msisdn", "telephone", "ssn",
]);
const WEAK_LAST_WORDS = new Set([
  "key", "body", "text", "note", "notes", "address", "signature",
]);

function keyWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .flatMap((w) => (w.length > 3 && w.endsWith("s") ? [w, w.slice(0, -1)] : [w]));
}

function isSensitiveKey(key: string): boolean {
  const words = keyWords(key);
  if (words.some((w) => STRONG_WORDS.has(w))) return true;
  const last = words[words.length - 1];
  return last !== undefined && WEAK_LAST_WORDS.has(last);
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const JWT_RE = /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;
const BEARER_RE = /bearer\s+[A-Za-z0-9._~+/=-]{8,}/gi;
// Digit runs with phone-style separators; only redact when they look like a
// real number (>=9 digits, or an explicit + prefix) so dates/ids survive.
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;

function scrubString(value: string): string {
  return value
    .replace(EMAIL_RE, "[email]")
    .replace(JWT_RE, "[token]")
    .replace(BEARER_RE, "Bearer [token]")
    .replace(PHONE_RE, (m) => {
      const digits = m.replace(/\D/g, "").length;
      return m.startsWith("+") || digits >= 9 ? "[phone]" : m;
    });
}

const MAX_DEPTH = 10;

function scrubValue(value: unknown, key: string | undefined, depth: number): unknown {
  if (value === null || value === undefined || depth > MAX_DEPTH) return value;
  if (typeof value === "string") {
    return key !== undefined && isSensitiveKey(key) ? "[redacted]" : scrubString(value);
  }
  if (Array.isArray(value)) {
    // Items inherit the parent key — "emails": [...] stays redacted.
    return value.map((v) => scrubValue(v, key, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = scrubValue(v, k, depth + 1);
    }
    return out;
  }
  return value;
}

function scrubEvent<T>(event: T): T {
  return scrubValue(event, undefined, 0) as T;
}

let enabled = false;

export function initSentry(): void {
  if (!config.SENTRY_DSN) return;
  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    // Never attach user info, cookies, bodies or query strings automatically —
    // customer messages and tokens are personal data. The scrubber below is
    // the second line of defence for anything that slips through.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: ["authorization", "cookie", "x-api-key", "x-konvo-signature", "set-cookie"] },
        response: { deny: ["set-cookie"] },
      },
      httpBodies: [],
      urlQueryParams: {
        deny: [
          "token", "visitorToken", "visitorId", "widgetToken", "key", "secret",
          "signature", "email", "phone", "code",
        ],
      },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
    },
    beforeSend: (event: ErrorEvent, _hint: EventHint) => scrubEvent(event),
    beforeBreadcrumb: (breadcrumb) => scrubEvent(breadcrumb),
  });
  enabled = true;
}

export function captureException(error: unknown): void {
  if (enabled) Sentry.captureException(error);
}

export async function closeSentry(): Promise<void> {
  if (enabled) await Sentry.close(2000);
}
