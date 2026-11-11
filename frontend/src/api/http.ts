import type { ApiError } from "./types";

export const BASE_URL: string = import.meta.env["VITE_API_BASE_URL"] ?? "/api";

let tokenGetter: () => string | null = () => null;
/** Auth store registers how to read the current token. */
export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}
/** Current auth token — used by transports that can't set headers (SSE). */
export function getAuthToken(): string | null {
  return tokenGetter();
}

export class HttpError extends Error implements ApiError {
  status: number;
  code: string;
  constructor(e: ApiError) {
    super(e.message);
    this.status = e.status;
    this.code = e.code;
  }
}

function normalize(status: number, body: unknown): HttpError {
  if (body && typeof body === "object") {
    const b = body as { code?: unknown; message?: unknown; error?: unknown };
    const message =
      typeof b.message === "string"
        ? b.message
        : typeof b.error === "string"
          ? b.error
          : "Something went wrong";
    return new HttpError({
      status,
      code: typeof b.code === "string" ? b.code : `http_${status}`,
      message,
    });
  }
  if (status === 0)
    return new HttpError({
      status,
      code: "network",
      message: "You seem to be offline.",
    });
  return new HttpError({
    status,
    code: `http_${status}`,
    message: "Something went wrong",
  });
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  retries?: number;
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function http<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal } = opts;
  // Only idempotent requests retry by default.
  const retries = opts.retries ?? (method === "GET" ? 2 : 0);
  const url = new URL(
    BASE_URL + path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (query)
    for (const [k, v] of Object.entries(query))
      if (v !== undefined) url.searchParams.set(k, String(v));

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = tokenGetter();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        ...(signal ? { signal } : {}),
      });
      const text = await res.text();
      const data: unknown = text ? JSON.parse(text) : undefined;
      if (!res.ok) {
        const err = normalize(res.status, data);
        if (res.status >= 500 && attempt < retries) {
          await sleep(300 * 2 ** attempt);
          continue;
        }
        throw err;
      }
      return data as T;
    } catch (e) {
      if (e instanceof HttpError) throw e;
      if (attempt < retries) {
        await sleep(300 * 2 ** attempt);
        continue;
      }
      throw normalize(0, undefined);
    }
  }
}

/** GET that returns raw text (e.g. CSV exports). */
export async function httpText(path: string, query?: RequestOptions["query"]): Promise<string> {
  const url = new URL(
    BASE_URL + path,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (query)
    for (const [k, v] of Object.entries(query))
      if (v !== undefined) url.searchParams.set(k, String(v));
  const token = tokenGetter();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = undefined;
    }
    throw normalize(res.status, body);
  }
  return res.text();
}
