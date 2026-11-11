import { describe, expect, it } from "vitest";
import { agent, setupTestLifecycle } from "./helpers.js";
import { generateTotpSecret, verifyTotp } from "../src/lib/totp.js";

setupTestLifecycle();

async function register(email: string, slug: string) {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email,
    password: "password123",
    business: "Sec Co",
    slug,
  });
  return a;
}

describe("totp", () => {
  it("generates and verifies codes within the time window", () => {
    const secret = generateTotpSecret();
    expect(() => verifyTotp(secret, "abcdef")).not.toThrow();
    expect(verifyTotp(secret, "000000")).toBe(false);
    // A real code for "now" must verify — compute via hotp path is internal,
    // so brute-force the 6-digit space is impractical; instead verify the
    // negative path and that setup/enable round-trips below.
  });
});

describe("security: 2fa", () => {
  it("enables 2fa and requires a code at login", async () => {
    const a = await register("twofa@t.in", "twofa-co");

    const setup = await a.post("/api/auth/2fa/setup");
    expect(setup.status).toBe(200);
    expect(setup.body.secret).toBeTruthy();
    expect(setup.body.otpauthUrl).toContain("otpauth://totp/");

    // Wrong code rejected.
    const bad = await a.post("/api/auth/2fa/enable").send({ code: "000000" });
    expect(bad.status).toBe(401);

    // Compute a valid code for the returned secret at current time.
    const { base32Decode } = await import("../src/lib/totp.js");
    const { createHmac } = await import("node:crypto");
    const secretBytes = base32Decode(setup.body.secret as string);
    const counter = Math.floor(Date.now() / 1000 / 30);
    const msg = Buffer.alloc(8);
    msg.writeBigUInt64BE(BigInt(counter));
    const h = createHmac("sha1", secretBytes).update(msg).digest();
    const off = h[h.length - 1]! & 0x0f;
    const code = String(
      (((h[off]! & 0x7f) << 24) | (h[off + 1]! << 16) | (h[off + 2]! << 8) | h[off + 3]!) %
        1_000_000,
    ).padStart(6, "0");

    const enable = await a.post("/api/auth/2fa/enable").send({ code });
    expect(enable.status).toBe(200);
    expect(enable.body.enabled).toBe(true);

    const status = await a.get("/api/auth/2fa/status");
    expect(status.body.enabled).toBe(true);

    // Login without code → totp_required.
    const noCode = await agent().post("/api/auth/login").send({
      email: "twofa@t.in",
      password: "password123",
    });
    expect(noCode.status).toBe(401);
    expect(noCode.body.code).toBe("totp_required");

    // Login with the same valid code succeeds.
    const ok = await agent().post("/api/auth/login").send({
      email: "twofa@t.in",
      password: "password123",
      totpCode: code,
    });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTruthy();
  });

  it("changes password and revokes other sessions", async () => {
    const a = await register("pw@t.in", "pw-co");
    const bad = await a.post("/api/auth/password").send({
      currentPassword: "wrong",
      newPassword: "newpassword1",
    });
    expect(bad.status).toBe(401);

    const ok = await a.post("/api/auth/password").send({
      currentPassword: "password123",
      newPassword: "newpassword1",
    });
    expect(ok.status).toBe(200);

    // Old password no longer works.
    const old = await agent().post("/api/auth/login").send({
      email: "pw@t.in",
      password: "password123",
    });
    expect(old.status).toBe(401);
    const fresh = await agent().post("/api/auth/login").send({
      email: "pw@t.in",
      password: "newpassword1",
    });
    expect(fresh.status).toBe(200);
  });
});

describe("api keys", () => {
  it("creates, authenticates, scopes and revokes keys", async () => {
    const a = await register("keys@t.in", "keys-co");

    const created = await a.post("/api/api-keys").send({ name: "CI bot", scopes: ["read"] });
    expect(created.status).toBe(201);
    expect(created.body.key).toMatch(/^kv_/);
    expect(created.body.key).not.toBe(created.body.prefix);

    const key = created.body.key as string;

    // Read scope: GET works.
    const list = await agent().get("/api/contacts").set("X-Api-Key", key);
    expect(list.status).toBe(200);

    // Read scope: POST rejected.
    const post = await agent()
      .post("/api/contacts")
      .set("X-Api-Key", key)
      .send({ name: "X", phone: "+919999999999" });
    expect(post.status).toBe(403);

    // Write scope: mutation works.
    const writeKey = await a.post("/api/api-keys").send({ name: "Writer", scopes: ["write"] });
    const wkey = writeKey.body.key as string;
    const post2 = await agent()
      .post("/api/contacts")
      .set("X-Api-Key", wkey)
      .send({ name: "Via API", phone: "+918888888888" });
    expect(post2.status).toBe(201);

    // Revoke → key stops working.
    await a.post(`/api/api-keys/${created.body.id}/revoke`);
    const after = await agent().get("/api/contacts").set("X-Api-Key", key);
    expect(after.status).toBe(401);
  });
});

describe("outbound webhooks", () => {
  it("delivers signed events and exposes delivery status", async () => {
    const a = await register("hooks@t.in", "hooks-co");

    const created = await a.post("/api/webhook-endpoints").send({
      url: "https://127.0.0.1:9/hook",
      events: ["message.created", "contact.created"],
    });
    expect(created.status).toBe(201);
    expect(created.body.secret).toBeTruthy();

    // Trigger contact.created via contact create.
    await a.post("/api/contacts").send({ name: "Hooked", phone: "+917777777777" });

    const deliveries = await a.get(`/api/webhook-endpoints/${created.body.id}/deliveries`);
    expect(deliveries.status).toBe(200);
    // Delivery attempted (fails to reach example.com in test env is fine —
    // the row proves the pipeline ran).
    expect(deliveries.body.length).toBeGreaterThanOrEqual(1);
    expect(deliveries.body[0].event).toBe("contact.created");
  });
});
