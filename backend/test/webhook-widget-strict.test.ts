import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import type { FastifyInstance } from "fastify";

// Legacy visitorId path disabled — only signed visitor tokens are accepted.
vi.stubEnv("WIDGET_LEGACY_VISITOR_ID", "false");

const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");
const { closeQueues } = await import("../src/lib/jobs.js");
const { encryptSecret } = await import("../src/lib/crypto.js");
const { issueVisitorToken } = await import("../src/lib/widget-auth.js");
const { hashPassword } = await import("../src/lib/password.js");

let app: FastifyInstance;
let accountId: string;

beforeAll(async () => {
  app = await buildApp({ logger: false });
});

beforeEach(async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const names = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);

  const ws = await prisma.workspace.create({
    data: { name: "Strict WS", slug: "strict-ws" },
  });
  const user = await prisma.user.create({
    data: {
      name: "U",
      email: "u@strict.test",
      passwordHash: await hashPassword("password123"),
    },
  });
  await prisma.membership.create({
    data: { workspaceId: ws.id, userId: user.id, role: "owner" },
  });
  const account = await prisma.channelAccount.create({
    data: {
      workspaceId: ws.id,
      type: "web",
      status: "connected",
      displayName: "Widget",
      encryptedCredentials: encryptSecret(
        JSON.stringify({ widgetToken: "site-secret-token" }),
      ),
    },
  });
  accountId = account.id;
});

afterAll(async () => {
  await app.close();
  await closeQueues();
  await prisma.$disconnect();
});

describe("widget with legacy visitorId disabled", () => {
  it("rejects visitorId-only calls but accepts signed tokens", async () => {
    const thread = await app.inject({
      method: "GET",
      url: `/api/webhooks/web/${accountId}/thread?visitorId=legacy-1`,
    });
    expect(thread.statusCode).toBe(400);
    expect(thread.json().code).toBe("visitor_token_required");

    const post = await app.inject({
      method: "POST",
      url: `/api/webhooks/web/${accountId}`,
      payload: {
        widgetToken: "site-secret-token",
        visitorId: "legacy-1",
        text: "hi",
      },
    });
    expect(post.statusCode).toBe(400);

    // Signed token still works end to end.
    const token = issueVisitorToken(accountId);
    const ok = await app.inject({
      method: "GET",
      url: `/api/webhooks/web/${accountId}/thread?visitorToken=${encodeURIComponent(token)}`,
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json().messages).toEqual([]);
  });
});
