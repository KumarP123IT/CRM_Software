import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { agent, setupTestLifecycle } from "./helpers.js";
import { issueVisitorToken } from "../src/lib/widget-auth.js";

setupTestLifecycle();

async function setupWidget() {
  const a = agent();
  const reg = await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@widget.test",
    password: "password123",
    business: "Biz",
    slug: "biz-widget",
  });
  expect(reg.status).toBe(201);
  const connect = await a.post("/api/channels/connect").send({
    type: "web",
    name: "Website widget",
  });
  expect(connect.status).toBe(201);
  const accountId = connect.body.id as string;
  const detail = await a.get(`/api/channels/${accountId}`);
  return { a, accountId, widgetToken: detail.body.widgetToken as string };
}

async function workspaceId() {
  const ws = await prisma.workspace.findUniqueOrThrow({ where: { slug: "biz-widget" } });
  return ws.id;
}

describe("widget visitor tokens", () => {
  it("accepts a legacy visitorId, then upgrades to a signed token for the same visitor", async () => {
    const { accountId, widgetToken } = await setupWidget();

    // Legacy path: plain visitorId still works and returns a signed token.
    const legacy = await agent().get(
      `/api/webhooks/web/${accountId}/thread?visitorId=legacy-visitor-1`,
    );
    expect(legacy.status).toBe(200);
    expect(legacy.body.messages).toEqual([]);
    const token = legacy.body.visitorToken as string;
    expect(token).toBeTruthy();

    // The issued token must carry the SAME visitor id — post a message with it.
    const post = await agent().post(`/api/webhooks/web/${accountId}`).send({
      widgetToken,
      visitorToken: token,
      name: "Web Visitor",
      text: "hello from token",
    });
    expect(post.status).toBe(200);
    expect(post.body.visitorToken).toBeUndefined(); // already signed — no re-issue

    // Thread is visible under the token (same visitor id preserved).
    const thread = await agent().get(
      `/api/webhooks/web/${accountId}/thread?visitorToken=${encodeURIComponent(token)}`,
    );
    expect(thread.status).toBe(200);
    expect(thread.body.messages.length).toBe(1);
    expect(thread.body.messages[0].body).toBe("hello from token");
  });

  it("token endpoint issues a token; migrated legacy id is preserved", async () => {
    const { accountId } = await setupWidget();

    const issued = await agent().post(`/api/webhooks/web/${accountId}/token`).send({});
    expect(issued.status).toBe(200);
    expect(issued.body.visitorToken).toBeTruthy();

    // Migrate an existing legacy visitor id into a token.
    const migrated = await agent()
      .post(`/api/webhooks/web/${accountId}/token`)
      .send({ visitorId: "legacy-keep-me" });
    expect(migrated.status).toBe(200);
    const thread = await agent().get(
      `/api/webhooks/web/${accountId}/thread?visitorToken=${encodeURIComponent(migrated.body.visitorToken)}`,
    );
    expect(thread.status).toBe(200);
  });

  it("rejects forged and expired visitor tokens", async () => {
    const { accountId } = await setupWidget();
    const url = `/api/webhooks/web/${accountId}/thread`;

    const forged = await agent().get(`${url}?visitorToken=forged.token.value`);
    expect(forged.status).toBe(401);

    // Correctly signed but expired (ttl of -1s).
    const expired = issueVisitorToken(accountId, undefined, -1000);
    const res = await agent().get(`${url}?visitorToken=${encodeURIComponent(expired)}`);
    expect(res.status).toBe(401);

    // Token minted for a different account must not work here.
    const other = issueVisitorToken("some-other-account");
    const wrongAccount = await agent().get(`${url}?visitorToken=${encodeURIComponent(other)}`);
    expect(wrongAccount.status).toBe(401);
  });

  it("enforces the workspace Origin allow-list; empty list allows all", async () => {
    const { a, accountId } = await setupWidget();
    const wsId = await workspaceId();

    // Restrict to example.com.
    const patch = await a.patch(`/api/workspaces/${wsId}`).send({
      widgetAllowedDomains: ["example.com"],
    });
    expect(patch.status).toBe(200);

    const ok = await agent()
      .get(`/api/webhooks/web/${accountId}/thread?visitorId=v1`)
      .set("Origin", "https://example.com");
    expect(ok.status).toBe(200);

    const sub = await agent()
      .get(`/api/webhooks/web/${accountId}/thread?visitorId=v1`)
      .set("Origin", "https://app.example.com");
    expect(sub.status).toBe(200);

    const bad = await agent()
      .get(`/api/webhooks/web/${accountId}/thread?visitorId=v1`)
      .set("Origin", "https://evil.com");
    expect(bad.status).toBe(403);

    // Token issuance is origin-checked too.
    const badToken = await agent()
      .post(`/api/webhooks/web/${accountId}/token`)
      .set("Origin", "https://evil.com")
      .send({});
    expect(badToken.status).toBe(403);

    // Clear the list — any origin allowed again.
    await a.patch(`/api/workspaces/${wsId}`).send({ widgetAllowedDomains: [] });
    const anyOrigin = await agent()
      .get(`/api/webhooks/web/${accountId}/thread?visitorId=v1`)
      .set("Origin", "https://anything.example.org");
    expect(anyOrigin.status).toBe(200);
  });
});
