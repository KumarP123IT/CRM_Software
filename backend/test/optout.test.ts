import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";

const { buildApp } = await import("../src/app.js");
const { prisma } = await import("../src/lib/prisma.js");
const { closeQueues } = await import("../src/lib/jobs.js");
const { closeScheduler, handleDelayedAutoReply } = await import("../src/lib/scheduler.js");
const { encryptSecret } = await import("../src/lib/crypto.js");
const { hashPassword } = await import("../src/lib/password.js");

let app: FastifyInstance;
let wsId: string;
let contactId: string;
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

  const ws = await prisma.workspace.create({ data: { name: "OptOut WS", slug: "optout-ws" } });
  wsId = ws.id;
  const user = await prisma.user.create({
    data: {
      name: "U",
      email: "u@optout.test",
      passwordHash: await hashPassword("password123"),
    },
  });
  await prisma.membership.create({ data: { workspaceId: wsId, userId: user.id, role: "owner" } });
  const contact = await prisma.contact.create({
    data: { workspaceId: wsId, phone: "+15550009999", name: "Visitor" },
  });
  contactId = contact.id;
  const account = await prisma.channelAccount.create({
    data: {
      workspaceId: wsId,
      type: "web",
      status: "connected",
      displayName: "Widget",
      encryptedCredentials: encryptSecret(JSON.stringify({ widgetToken: "site-secret-token" })),
    },
  });
  accountId = account.id;
  // Link the widget visitorId used in tests to the fixture contact so
  // resolveContact() reuses it instead of creating a fresh contact.
  await prisma.contactIdentity.create({
    data: {
      workspaceId: wsId,
      contactId,
      channel: "web",
      channelAccountId: accountId,
      externalId: "v-opt",
    },
  });
});

afterAll(async () => {
  await app.close();
  await closeQueues();
  await closeScheduler();
  await prisma.$disconnect();
});

function inbound(text: string, messageId: string) {
  return app.inject({
    method: "POST",
    url: `/api/webhooks/web/${accountId}`,
    payload: {
      widgetToken: "site-secret-token",
      visitorId: "v-opt",
      name: "Visitor",
      text,
      messageId,
    },
  });
}

async function optedOut() {
  const c = await prisma.contact.findUniqueOrThrow({ where: { id: contactId } });
  return c.optedOut;
}

async function outboundBodies() {
  const conv = await prisma.conversation.findFirstOrThrow({ where: { workspaceId: wsId } });
  const msgs = await prisma.message.findMany({
    where: { conversationId: conv.id, direction: "out" },
    select: { body: true },
  });
  return msgs.map((m) => m.body);
}

describe("STOP/START opt-out", () => {
  it("STOP opts the contact out and suppresses automation", async () => {
    await prisma.autoReply.create({
      data: {
        workspaceId: wsId,
        trigger: "keyword",
        keywords: ["hello", "stop"],
        response: "automated reply",
      },
    });

    const res = await inbound("STOP", "m1");
    expect(res.statusCode).toBeLessThan(300);
    expect(await optedOut()).toBe(true);
    // No automated reply to an opt-out signal.
    expect(await outboundBodies()).not.toContain("automated reply");
  });

  it("START opts back in", async () => {
    await prisma.contact.update({ where: { id: contactId }, data: { optedOut: true } });
    await inbound("start", "m1");
    expect(await optedOut()).toBe(false);
  });

  it("matches keyword variants but not mid-sentence use", async () => {
    await inbound("stop!", "m1");
    expect(await optedOut()).toBe(true);

    await inbound("START", "m2");
    expect(await optedOut()).toBe(false);

    await inbound("please stop messaging me", "m3");
    expect(await optedOut()).toBe(false);

    await inbound("UNSUBSCRIBE now", "m4");
    expect(await optedOut()).toBe(true);
  });

  it("never auto-replies to an already opted-out contact", async () => {
    await prisma.contact.update({ where: { id: contactId }, data: { optedOut: true } });
    await prisma.autoReply.create({
      data: {
        workspaceId: wsId,
        trigger: "keyword",
        keywords: ["hello"],
        response: "automated reply",
      },
    });

    await inbound("hello there", "m1");
    expect(await outboundBodies()).not.toContain("automated reply");
  });

  it("a pending delayed auto-reply is dropped if the contact opts out", async () => {
    const rule = await prisma.autoReply.create({
      data: {
        workspaceId: wsId,
        trigger: "keyword",
        keywords: ["hello"],
        response: "delayed reply",
        delaySeconds: 3600,
      },
    });
    await inbound("hello there", "m1");

    // STOP arrives while the delayed reply is still pending.
    await inbound("STOP", "m2");
    expect(await optedOut()).toBe(true);

    // Fire the pending job directly — the opt-out guard must skip it.
    const conv = await prisma.conversation.findFirstOrThrow({ where: { workspaceId: wsId } });
    const trigger = await prisma.message.findFirstOrThrow({
      where: { conversationId: conv.id, direction: "in", body: "hello there" },
    });
    await handleDelayedAutoReply({
      workspaceId: wsId,
      conversationId: conv.id,
      accountId,
      contactId,
      body: "delayed reply",
      triggerMessageId: trigger.id,
      delaySeconds: 3600,
      sourceKind: "autoReply",
      sourceId: rule.id,
    });
    expect(await outboundBodies()).not.toContain("delayed reply");
  });
});
