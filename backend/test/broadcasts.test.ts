import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { agent, setupTestLifecycle } from "./helpers.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@b.in",
    password: "password123",
    business: "Biz",
    slug: "biz-b",
  });
  const ws = await prisma.workspace.findFirstOrThrow();

  // Connected "web" channel account — its adapter send() is a no-op success.
  const account = await prisma.channelAccount.create({
    data: { workspaceId: ws.id, type: "web", status: "connected", displayName: "Site" },
  });

  const t = await a.post("/api/templates").send({
    name: "promo_blast",
    category: "Marketing",
    language: "en",
    body: "Hi {{1}}, special offer inside!",
  });
  await a.post(`/api/templates/${t.body.id}/submit`);
  await a.post(`/api/templates/${t.body.id}/approve`);

  return { a, ws, account, templateId: t.body.id as string };
}

async function addContact(
  a: ReturnType<typeof agent>,
  data: { name: string; phone: string; tags?: string[]; optedOut?: boolean },
  accountId: string,
) {
  const res = await a.post("/api/contacts").send(data);
  expect(res.status).toBe(201);
  await prisma.contactIdentity.create({
    data: {
      workspaceId: (await prisma.workspace.findFirstOrThrow()).id,
      contactId: res.body.id,
      channel: "web",
      channelAccountId: accountId,
      externalId: `visitor-${res.body.id}`,
    },
  });
  return res.body.id as string;
}

describe("broadcasts", () => {
  it("sends immediately to an audience and records per-recipient status", async () => {
    const { a, account, templateId } = await setup();
    await addContact(a, { name: "Asha", phone: "9000000001", tags: ["VIP"] }, account.id);
    await addContact(a, { name: "Bala", phone: "9000000002", optedOut: true }, account.id);
    await addContact(a, { name: "Cid", phone: "9000000003" }, account.id);

    const res = await a.post("/api/broadcasts").send({
      name: "Diwali blast",
      templateId,
      audience: "all",
    });
    expect(res.status).toBe(201);
    // Inline dispatch in tests → already sent.
    expect(res.body.status).toBe("sent");
    expect(res.body.total).toBe(3);
    expect(res.body.sent).toBe(2); // opted-out contact skipped
    expect(res.body.skipped).toBe(1);

    const recipients = await a.get(`/api/broadcasts/${res.body.id}/recipients`);
    expect(recipients.body.total).toBe(3);
    const statuses = recipients.body.items.map((r: { status: string }) => r.status);
    expect(statuses.filter((s: string) => s === "sent")).toHaveLength(2);
    expect(statuses).toContain("skipped");
  });

  it("resolves tag audiences and excludes opted-out via opted-in", async () => {
    const { a, account, templateId } = await setup();
    await addContact(a, { name: "Tagged", phone: "9000000011", tags: ["Wholesale"] }, account.id);
    await addContact(a, { name: "Untagged", phone: "9000000012" }, account.id);

    const byTag = await a.post("/api/broadcasts").send({
      name: "tag blast",
      templateId,
      audience: "tag:Wholesale",
    });
    expect(byTag.status).toBe(201);
    expect(byTag.body.total).toBe(1);
    expect(byTag.body.sent).toBe(1);

    const optedIn = await a.post("/api/broadcasts").send({
      name: "opted in",
      templateId,
      audience: "opted-in",
    });
    expect(optedIn.body.total).toBe(2);
  });

  it("schedules, sends-now and cancels broadcasts", async () => {
    const { a, account, templateId } = await setup();
    await addContact(a, { name: "Asha", phone: "9000000021" }, account.id);

    const later = new Date(Date.now() + 3600_000).toISOString();
    const sched = await a.post("/api/broadcasts").send({
      name: "scheduled",
      templateId,
      audience: "all",
      scheduledAt: later,
    });
    expect(sched.status).toBe(201);
    expect(sched.body.status).toBe("scheduled");
    expect(sched.body.total).toBe(1);

    // Cancel → recipients skipped
    const cancelled = await a.post(`/api/broadcasts/${sched.body.id}/cancel`);
    expect(cancelled.body.status).toBe("cancelled");
    const recips = await a.get(`/api/broadcasts/${sched.body.id}/recipients`);
    expect(recips.body.items[0].status).toBe("skipped");

    // Draft → send now via /send
    const draft = await prisma.broadcast.create({
      data: {
        workspaceId: (await prisma.workspace.findFirstOrThrow()).id,
        name: "manual",
        templateId,
        audience: "all",
        status: "draft",
      },
    });
    await prisma.broadcastRecipient.create({
      data: { broadcastId: draft.id, contactId: (await prisma.contact.findFirstOrThrow()).id },
    });
    const sent = await a.post(`/api/broadcasts/${draft.id}/send`);
    expect(sent.body.status).toBe("sent");
    expect(sent.body.sent).toBe(1);
    void account;
  });

  it("rejects unapproved templates and bad audiences", async () => {
    const { a, templateId } = await setup();
    const draft = await a.post("/api/templates").send({
      name: "draft_tpl",
      category: "Utility",
      language: "en",
      body: "draft",
    });
    const bad = await a.post("/api/broadcasts").send({
      name: "x",
      templateId: draft.body.id,
      audience: "all",
    });
    expect(bad.status).toBe(400);

    const badAudience = await a.post("/api/broadcasts").send({
      name: "x",
      templateId,
      audience: "group:nonexistent",
    });
    expect(badAudience.status).toBe(400);
  });
});
