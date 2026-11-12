import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { FastifyInstance } from "fastify";

// Scale limits down so a handful of requests trips them.
// widget: Math.round(60 * 0.05) = 3, provider: Math.round(1000 * 0.05) = 50,
// whatsapp verify: Math.round(30 * 0.05) = 2.
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

describe("webhook route rate limits", () => {
  it("limits the widget thread poll per visitor+IP", async () => {
    const url = "/api/webhooks/web/fake-account/thread";
    for (let i = 0; i < 3; i++) {
      const res = await app.inject({ method: "GET", url: `${url}?visitorId=v1` });
      expect(res.statusCode).toBe(404);
    }
    const blocked = await app.inject({ method: "GET", url: `${url}?visitorId=v1` });
    expect(blocked.statusCode).toBe(429);

    // A different visitor gets a fresh bucket.
    const other = await app.inject({ method: "GET", url: `${url}?visitorId=v2` });
    expect(other.statusCode).toBe(404);
  });

  it("limits widget posts per visitor+IP", async () => {
    const url = "/api/webhooks/web/fake-account";
    const body = { visitorId: "v1", text: "hi" };
    for (let i = 0; i < 3; i++) {
      const res = await app.inject({ method: "POST", url, payload: body });
      expect(res.statusCode).toBe(404);
    }
    const blocked = await app.inject({ method: "POST", url, payload: body });
    expect(blocked.statusCode).toBe(429);
  });

  it("gives provider posts a high per-IP ceiling", async () => {
    const url = "/api/webhooks/telegram/fake-account";
    for (let i = 0; i < 50; i++) {
      const res = await app.inject({ method: "POST", url, payload: {} });
      expect(res.statusCode).toBe(404);
    }
    const blocked = await app.inject({ method: "POST", url, payload: {} });
    expect(blocked.statusCode).toBe(429);
  });

  it("tightly limits the WhatsApp verify handshake", async () => {
    const url = "/api/webhooks/whatsapp/fake-account?hub.mode=subscribe&hub.verify_token=x&hub.challenge=y";
    await app.inject({ method: "GET", url });
    await app.inject({ method: "GET", url });
    const blocked = await app.inject({ method: "GET", url });
    expect(blocked.statusCode).toBe(429);
  });
});
