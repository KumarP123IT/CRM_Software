import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import type { InjectOptions } from "light-my-request";

// Scale limits down so a handful of requests trips them.
// widget: Math.round(60 * 0.05) = 3, provider: Math.round(1000 * 0.05) = 50,
// whatsapp verify: Math.round(30 * 0.05) = 2, shared widget IP ceiling = 6.
vi.stubEnv("RATE_LIMIT_SCALE", "0.05");

const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");
const { closeQueues } = await import("../src/lib/jobs.js");

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp({ logger: false });
});

afterAll(async () => {
  await app.close();
  await closeQueues();
  await prisma.$disconnect();
});

// Each test gets its own client IP so the shared per-IP widget ceiling
// (which spans all widget routes) doesn't couple the tests together.
function inj(ip: string) {
  return (opts: InjectOptions) => app.inject({ ...opts, remoteAddress: ip });
}

describe("webhook route rate limits", () => {
  it("limits the widget thread poll per visitor+IP", async () => {
    const request = inj("10.0.0.1");
    const url = "/api/webhooks/web/fake-account/thread";
    for (let i = 0; i < 3; i++) {
      const res = await request({ method: "GET", url: `${url}?visitorId=v1` });
      expect(res.statusCode).toBe(404);
    }
    const blocked = await request({ method: "GET", url: `${url}?visitorId=v1` });
    expect(blocked.statusCode).toBe(429);

    // A different visitor gets a fresh bucket.
    const other = await request({ method: "GET", url: `${url}?visitorId=v2` });
    expect(other.statusCode).toBe(404);
  });

  it("limits widget posts per visitor+IP", async () => {
    const request = inj("10.0.0.2");
    const url = "/api/webhooks/web/fake-account";
    const body = { visitorId: "v-post", text: "hi" };
    for (let i = 0; i < 3; i++) {
      const res = await request({ method: "POST", url, payload: body });
      expect(res.statusCode).toBe(404);
    }
    const blocked = await request({ method: "POST", url, payload: body });
    expect(blocked.statusCode).toBe(429);
  });

  it("gives provider posts a high per-IP ceiling", async () => {
    const request = inj("10.0.0.3");
    const url = "/api/webhooks/telegram/fake-account";
    for (let i = 0; i < 50; i++) {
      const res = await request({ method: "POST", url, payload: {} });
      expect(res.statusCode).toBe(404);
    }
    const blocked = await request({ method: "POST", url, payload: {} });
    expect(blocked.statusCode).toBe(429);
  });

  it("tightly limits the WhatsApp verify handshake", async () => {
    const request = inj("10.0.0.4");
    const url = "/api/webhooks/whatsapp/fake-account?hub.mode=subscribe&hub.verify_token=x&hub.challenge=y";
    await request({ method: "GET", url });
    await request({ method: "GET", url });
    const blocked = await request({ method: "GET", url });
    expect(blocked.statusCode).toBe(429);
  });
});
