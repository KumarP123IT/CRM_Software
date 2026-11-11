import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { agent, setupTestLifecycle } from "./helpers.js";

setupTestLifecycle();

const registerBody = {
  name: "Asha Rao",
  email: "asha@demo.in",
  password: "password123",
  business: "Demo Foods",
  slug: "demo-foods",
};

describe("auth", () => {
  it("register creates workspace + owner membership and returns a token", async () => {
    const res = await agent().post("/api/auth/register").send(registerBody);
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe("owner");
    expect(res.body.token).toBeTruthy();

    const ws = await prisma.workspace.findUnique({ where: { slug: "demo-foods" } });
    expect(ws?.name).toBe("Demo Foods");
    const membership = await prisma.membership.findFirst({
      where: { workspaceId: ws!.id },
    });
    expect(membership?.role).toBe("owner");
    // Default team created
    const team = await prisma.team.findFirst({ where: { workspaceId: ws!.id } });
    expect(team?.name).toBe("General");
    // Audit logged
    const audit = await prisma.auditLog.findFirst({ where: { action: "auth.register" } });
    expect(audit).toBeTruthy();
  });

  it("rejects duplicate slug and email", async () => {
    await agent().post("/api/auth/register").send(registerBody);
    const dupSlug = await agent()
      .post("/api/auth/register")
      .send({ ...registerBody, email: "other@demo.in" });
    expect(dupSlug.status).toBe(409);
    expect(dupSlug.body.code).toBe("slug_taken");

    const dupEmail = await agent()
      .post("/api/auth/register")
      .send({ ...registerBody, slug: "other-slug" });
    expect(dupEmail.status).toBe(409);
    expect(dupEmail.body.code).toBe("email_taken");
  });

  it("check-slug reports availability", async () => {
    await agent().post("/api/auth/register").send(registerBody);
    const taken = await agent().get("/api/auth/check-slug?slug=demo-foods");
    expect(taken.body.available).toBe(false);
    const free = await agent().get("/api/auth/check-slug?slug=new-workspace");
    expect(free.body.available).toBe(true);
    const bad = await agent().get("/api/auth/check-slug?slug=BAD_SLUG!");
    expect(bad.body.available).toBe(false);
  });

  it("login succeeds with correct credentials and fails otherwise", async () => {
    await agent().post("/api/auth/register").send(registerBody);
    const ok = await agent()
      .post("/api/auth/login")
      .send({ email: "asha@demo.in", password: "password123" });
    expect(ok.status).toBe(200);
    expect(ok.body.user.email).toBe("asha@demo.in");

    const bad = await agent()
      .post("/api/auth/login")
      .send({ email: "asha@demo.in", password: "wrong-password" });
    expect(bad.status).toBe(401);

    const missing = await agent()
      .post("/api/auth/login")
      .send({ email: "nobody@demo.in", password: "password123" });
    expect(missing.status).toBe(401);
  });

  it("locks the account after repeated failed logins", async () => {
    await agent().post("/api/auth/register").send(registerBody);
    for (let i = 0; i < 5; i++) {
      await agent()
        .post("/api/auth/login")
        .send({ email: "asha@demo.in", password: "wrong" });
    }
    const res = await agent()
      .post("/api/auth/login")
      .send({ email: "asha@demo.in", password: "password123" });
    // Correct password while locked → still rejected until lockout expires.
    expect([401, 423]).toContain(res.status);
  });

  it("refresh rotates the refresh token and issues a new access token", async () => {
    const a = agent();
    await a.post("/api/auth/register").send(registerBody);
    const me1 = await a.get("/api/auth/me");
    expect(me1.status).toBe(200);

    const refreshed = await a.post("/api/auth/refresh");
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.token).toBeTruthy();
    const me2 = await a.get("/api/auth/me");
    expect(me2.status).toBe(200);
  });

  it("logout revokes the session", async () => {
    const a = agent();
    await a.post("/api/auth/register").send(registerBody);
    await a.post("/api/auth/logout");
    const me = await a.get("/api/auth/me");
    expect(me.status).toBe(401);
  });

  it("forgot + reset password flow", async () => {
    const { sentEmails } = await import("../src/lib/jobs.js");
    await agent().post("/api/auth/register").send(registerBody);

    const forgot = await agent()
      .post("/api/auth/forgot-password")
      .send({ email: "asha@demo.in" });
    expect(forgot.status).toBe(200);
    expect(sentEmails.length).toBe(1);
    const token = /token=([A-Za-z0-9_-]+)/.exec(sentEmails[0]!.text)?.[1];
    expect(token).toBeTruthy();

    const reset = await agent()
      .post("/api/auth/reset-password")
      .send({ token, password: "newpassword456" });
    expect(reset.status).toBe(200);

    const oldLogin = await agent()
      .post("/api/auth/login")
      .send({ email: "asha@demo.in", password: "password123" });
    expect(oldLogin.status).toBe(401);
    const newLogin = await agent()
      .post("/api/auth/login")
      .send({ email: "asha@demo.in", password: "newpassword456" });
    expect(newLogin.status).toBe(200);

    // Token is single-use
    const reuse = await agent()
      .post("/api/auth/reset-password")
      .send({ token, password: "another12345" });
    expect(reuse.status).toBe(400);
  });

  it("forgot-password does not leak unknown emails", async () => {
    const res = await agent()
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@demo.in" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
