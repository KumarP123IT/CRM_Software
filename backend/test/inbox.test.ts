import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { agent, setupTestLifecycle } from "./helpers.js";
import { hashPassword } from "../src/lib/password.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  const reg = await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@inbox.in",
    password: "password123",
    business: "Biz",
    slug: "biz-inbox",
  });
  expect(reg.status).toBe(201);
  return a;
}

async function addMember(email: string, role = "agent") {
  const ws = await prisma.workspace.findUniqueOrThrow({ where: { slug: "biz-inbox" } });
  const user = await prisma.user.create({
    data: { name: email, email, passwordHash: await hashPassword("password123") },
  });
  await prisma.membership.create({
    data: { workspaceId: ws.id, userId: user.id, role: role as never },
  });
  const a = agent();
  await a.post("/api/auth/login").send({ email, password: "password123" });
  return { agent: a, user };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("channels", () => {
  it("connects a web widget, ingests a webhook message, and threads a reply", async () => {
    const a = await setup();

    const connect = await a.post("/api/channels/connect").send({
      type: "web",
      name: "Website widget",
    });
    expect(connect.status).toBe(201);
    expect(connect.body.type).toBe("web");
    expect(connect.body.status).toBe("connected");
    const accountId = connect.body.id as string;

    const list = await a.get("/api/channels");
    expect(list.body.supported).toEqual(expect.arrayContaining(["web", "telegram", "whatsapp"]));
    expect(list.body.items).toHaveLength(1);

    const detail = await a.get(`/api/channels/${accountId}`);
    const widgetToken = detail.body.widgetToken as string;
    expect(widgetToken).toBeTruthy();

    // Inbound webhook — wrong token rejected, right token accepted.
    const bad = await a
      .post(`/api/webhooks/web/${accountId}`)
      .send({ widgetToken: "wrong", visitorId: "v1", text: "hi" });
    expect(bad.status).toBe(401);

    const inbound = await a.post(`/api/webhooks/web/${accountId}`).send({
      widgetToken,
      visitorId: "visitor-42",
      name: "Web Visitor",
      text: "Do you deliver on Sundays?",
      messageId: "wm-1",
    });
    expect(inbound.status).toBe(200);
    expect(inbound.body.received).toBe(1);

    // Duplicate delivery is deduped.
    const dup = await a.post(`/api/webhooks/web/${accountId}`).send({
      widgetToken,
      visitorId: "visitor-42",
      text: "Do you deliver on Sundays?",
      messageId: "wm-1",
    });
    expect(dup.status).toBe(200);

    const convos = await a.get("/api/conversations");
    expect(convos.body.total).toBe(1);
    const convo = convos.body.items[0];
    expect(convo.contactName).toBe("Web Visitor");
    expect(convo.channel).toBe("web");
    expect(convo.unread).toBe(1);
    expect(convo.status).toBe("open");

    const messages = await a.get(`/api/conversations/${convo.id}/messages`);
    expect(messages.body).toHaveLength(1);
    expect(messages.body[0].direction).toBe("in");
    expect(messages.body[0].body).toContain("Sundays");

    // Agent reply — web adapter is a no-op, message stays "sent".
    const reply = await a.post(`/api/conversations/${convo.id}/messages`).send({
      kind: "text",
      body: "Yes, we deliver every day!",
    });
    expect(reply.status).toBe(201);
    expect(reply.body.direction).toBe("out");
    expect(reply.body.status).toBe("sent");

    const after = await a.get(`/api/conversations/${convo.id}/messages`);
    expect(after.body).toHaveLength(2);

    // Read receipt clears unread.
    const read = await a.post(`/api/conversations/${convo.id}/read`);
    expect(read.body.unread).toBe(0);
  });

  it("assigns, changes status, snoozes and transfers conversations", async () => {
    const a = await setup();
    const { agent: memberAgent, user: member } = await addMember("agent@inbox.in");
    void memberAgent;

    const connect = await a.post("/api/channels/connect").send({ type: "web", name: "W" });
    const detail = await a.get(`/api/channels/${connect.body.id}`);
    await a.post(`/api/webhooks/web/${connect.body.id}`).send({
      widgetToken: detail.body.widgetToken,
      visitorId: "v9",
      text: "hello",
    });
    const convo = (await a.get("/api/conversations")).body.items[0];

    const assigned = await a
      .post(`/api/conversations/${convo.id}/assign`)
      .send({ assigneeId: member.id });
    expect(assigned.status).toBe(200);
    expect(assigned.body.assigneeId).toBe(member.id);

    const badAssign = await a
      .post(`/api/conversations/${convo.id}/assign`)
      .send({ assigneeId: "nonexistent-user" });
    expect(badAssign.status).toBe(400);

    const status = await a.post(`/api/conversations/${convo.id}/status`).send({ status: "pending" });
    expect(status.body.status).toBe("pending");

    const snoozed = await a.post(`/api/conversations/${convo.id}/snooze`).send({
      until: new Date(Date.now() + 3600_000).toISOString(),
    });
    expect(snoozed.body.snoozedUntil).toBeTruthy();

    const team = await prisma.team.create({
      data: { workspaceId: (await prisma.workspace.findUniqueOrThrow({ where: { slug: "biz-inbox" } })).id, name: "Support" },
    });
    const transferred = await a
      .post(`/api/conversations/${convo.id}/transfer`)
      .send({ teamId: team.id });
    expect(transferred.body.teamId).toBe(team.id);

    // tab filters
    const mine = await memberAgent.get("/api/conversations?tab=mine&viewerId=" + member.id);
    expect(mine.body.total).toBe(1);
    const unassigned = await a.get("/api/conversations?tab=unassigned");
    expect(unassigned.body.total).toBe(0);
  });

  it("connects telegram via bot token and ingests updates with secret-token auth", async () => {
    const a = await setup();

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown, init?: { body?: string }) => {
        const u = String(url);
        if (u.includes("getMe")) {
          return new Response(
            JSON.stringify({ ok: true, result: { id: 777, is_bot: true, first_name: "KonvoBot", username: "konvo_bot" } }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (u.includes("sendMessage")) {
          return new Response(
            JSON.stringify({ ok: true, result: { message_id: 42 } }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        void init;
        return new Response(JSON.stringify({ ok: false }), { status: 404 });
      }),
    );

    const connect = await a.post("/api/channels/connect").send({
      type: "telegram",
      botToken: "123456:ABC-DEF",
      name: "Support bot",
    });
    expect(connect.status).toBe(201);
    expect(connect.body.displayName ?? connect.body.name).toBeTruthy();
    const accountId = connect.body.id as string;

    const detail = await a.get(`/api/channels/${accountId}`);
    const secret = detail.body.webhookSecret as string;
    expect(secret).toBeTruthy();

    // Missing/wrong secret rejected.
    const noSecret = await a.post(`/api/webhooks/telegram/${accountId}`).send({
      update_id: 1,
      message: { message_id: 1, date: 1, text: "hi", from: { id: 555 }, chat: { id: 555 } },
    });
    expect(noSecret.status).toBe(401);

    const inbound = await a
      .post(`/api/webhooks/telegram/${accountId}`)
      .set("x-telegram-bot-api-secret-token", secret)
      .send({
        update_id: 1,
        message: {
          message_id: 10,
          date: Math.floor(Date.now() / 1000),
          text: "Namaste!",
          from: { id: 555, first_name: "Ravi", username: "ravi" },
          chat: { id: 555 },
        },
      });
    expect(inbound.status).toBe(200);
    expect(inbound.body.received).toBe(1);

    const convo = (await a.get("/api/conversations")).body.items[0];
    expect(convo.channel).toBe("telegram");
    expect(convo.contactName).toBe("ravi");

    // Outbound goes through the Bot API (stubbed fetch).
    const reply = await a.post(`/api/conversations/${convo.id}/messages`).send({
      kind: "text",
      body: "Hello! How can I help?",
    });
    expect(reply.status).toBe(201);
    expect(reply.body.status).toBe("sent");
    expect(reply.body.providerMessageId ?? "42").toBeTruthy();

    // Health check uses getMe.
    const test = await a.post(`/api/channels/${accountId}/test`);
    expect(test.body.ok).toBe(true);
  });

  it("verifies WhatsApp webhook signatures and ingests Cloud API payloads", async () => {
    const a = await setup();

    // Stub Graph API: token exchange + phone number enrichment.
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: unknown) => {
        const u = String(url);
        if (u.includes("oauth/access_token")) {
          return new Response(
            JSON.stringify({ access_token: "wa-token" }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        if (u.includes("/messages")) {
          return new Response(
            JSON.stringify({ messages: [{ id: "wamid.out1" }] }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        // phone number lookup
        return new Response(
          JSON.stringify({ display_phone_number: "+15551234567", verified_name: "Biz WA" }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );

    const connect = await a.post("/api/channels/connect").send({
      type: "whatsapp",
      code: "signup-code",
      phoneNumberId: "pn-1",
      businessAccountId: "waba-1",
    });
    expect(connect.status).toBe(201);
    expect(connect.body.phoneNumber).toBe("+15551234567");
    const accountId = connect.body.id as string;

    const detail = await a.get(`/api/channels/${accountId}`);
    const verifyToken = detail.body.verifyToken as string;

    // Webhook verification handshake.
    const challenge = await a.get(
      `/api/webhooks/whatsapp/${accountId}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=CH123`,
    );
    expect(challenge.status).toBe(200);
    expect(challenge.text).toBe("CH123");

    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba-1",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { phone_number_id: "pn-1" },
                messages: [
                  {
                    id: "wamid.in1",
                    from: "919876543210",
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    type: "text",
                    text: { body: "Hi, price list please" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const raw = JSON.stringify(payload);
    const signature =
      "sha256=" + createHmac("sha256", "test-app-secret").update(raw).digest("hex");

    const unsigned = await a
      .post(`/api/webhooks/whatsapp/${accountId}`)
      .set("content-type", "application/json")
      .send(payload);
    expect(unsigned.status).toBe(401);

    const signed = await a
      .post(`/api/webhooks/whatsapp/${accountId}`)
      .set("content-type", "application/json")
      .set("x-hub-signature-256", signature)
      .send(raw);
    expect(signed.status).toBe(200);
    expect(signed.body.received).toBe(1);

    const convo = (await a.get("/api/conversations")).body.items[0];
    expect(convo.channel).toBe("whatsapp");
    expect(convo.contactPhone ?? convo.contactName).toContain("9876543210");
    expect(convo.windowClosesAt).toBeTruthy();

    const reply = await a.post(`/api/conversations/${convo.id}/messages`).send({
      kind: "text",
      body: "Sure — sending it over!",
    });
    expect(reply.status).toBe(201);
    expect(reply.body.status).toBe("sent");
    const outboundRow = await prisma.message.findUniqueOrThrow({ where: { id: reply.body.id } });
    expect(outboundRow.providerMessageId).toBe("wamid.out1");

    // Delivery receipt updates status.
    const statusPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba-1",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                statuses: [{ id: "wamid.out1", status: "delivered", timestamp: "1" }],
              },
            },
          ],
        },
      ],
    };
    const statusRaw = JSON.stringify(statusPayload);
    const statusSig =
      "sha256=" + createHmac("sha256", "test-app-secret").update(statusRaw).digest("hex");
    const statusRes = await a
      .post(`/api/webhooks/whatsapp/${accountId}`)
      .set("content-type", "application/json")
      .set("x-hub-signature-256", statusSig)
      .send(statusRaw);
    expect(statusRes.status).toBe(200);

    const messages = await a.get(`/api/conversations/${convo.id}/messages`);
    const outbound = messages.body.find((m: { direction: string }) => m.direction === "out");
    expect(outbound.status).toBe("delivered");
  });

  it("disconnects a channel and rejects further inbound", async () => {
    const a = await setup();
    const connect = await a.post("/api/channels/connect").send({ type: "web", name: "W2" });
    const accountId = connect.body.id as string;

    const del = await a.delete(`/api/channels/${accountId}`);
    expect(del.status).toBe(204);

    const list = await a.get("/api/channels");
    expect(list.body.items[0].status).toBe("disconnected");

    const detail = await a.get(`/api/channels/${accountId}`);
    const inbound = await a.post(`/api/webhooks/web/${accountId}`).send({
      widgetToken: detail.body.widgetToken,
      visitorId: "v1",
      text: "hi",
    });
    expect(inbound.status).toBe(404);
  });
});
