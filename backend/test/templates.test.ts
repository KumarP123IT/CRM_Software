import { describe, expect, it } from "vitest";
import { agent, setupTestLifecycle } from "./helpers.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@t.in",
    password: "password123",
    business: "Biz",
    slug: "biz-t",
  });
  return a;
}

const tpl = {
  name: "order_update",
  category: "Utility",
  language: "en",
  body: "Hi {{1}}, your order is on the way.",
};

describe("templates", () => {
  it("creates, lists, submits, approves and rejects templates", async () => {
    const a = await setup();

    const created = await a.post("/api/templates").send(tpl);
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("draft");
    expect(created.body.name).toBe("order_update");

    const list = await a.get("/api/templates");
    expect(list.body).toHaveLength(1);

    // Duplicate name+language rejected
    const dup = await a.post("/api/templates").send(tpl);
    expect(dup.status).toBe(400);

    // Same name, different language is fine
    const other = await a.post("/api/templates").send({ ...tpl, language: "hi" });
    expect(other.status).toBe(201);

    // Submit → pending (no WhatsApp account → local approval flow)
    const submitted = await a.post(`/api/templates/${created.body.id}/submit`);
    expect(submitted.status).toBe(200);
    expect(submitted.body.status).toBe("pending");

    // Can't edit while pending
    const edit = await a.patch(`/api/templates/${created.body.id}`).send({ body: "changed" });
    expect(edit.status).toBe(400);

    // Approve
    const approved = await a.post(`/api/templates/${created.body.id}/approve`);
    expect(approved.body.status).toBe("approved");

    // Reject flow on the second template
    const rejected = await a.post(`/api/templates/${other.body.id}/submit`);
    expect(rejected.body.status).toBe("pending");
    const rej = await a.post(`/api/templates/${other.body.id}/reject`).send({ reason: "bad content" });
    expect(rej.body.status).toBe("rejected");
    expect(rej.body.rejectionReason).toBe("bad content");

    // Editing a rejected template returns it to draft
    const edited = await a.patch(`/api/templates/${other.body.id}`).send({ body: "fixed body" });
    expect(edited.body.status).toBe("draft");
    expect(edited.body.body).toBe("fixed body");
  });

  it("enforces template permissions", async () => {
    const a = await setup();
    // readonly member cannot create templates
    const { prisma } = await import("../src/lib/prisma.js");
    const { hashPassword } = await import("../src/lib/password.js");
    const ws = await prisma.workspace.findFirstOrThrow();
    const user = await prisma.user.create({
      data: { name: "ro", email: "ro@t.in", passwordHash: await hashPassword("password123") },
    });
    await prisma.membership.create({
      data: { workspaceId: ws.id, userId: user.id, role: "readonly" },
    });
    const ro = agent();
    await ro.post("/api/auth/login").send({ email: "ro@t.in", password: "password123" });
    const res = await ro.post("/api/templates").send(tpl);
    expect(res.status).toBe(403);
    void a;
  });

  it("blocks deleting a template used by a broadcast", async () => {
    const a = await setup();
    const { prisma } = await import("../src/lib/prisma.js");
    const t = await a.post("/api/templates").send(tpl);
    await a.post(`/api/templates/${t.body.id}/submit`);
    await a.post(`/api/templates/${t.body.id}/approve`);
    const ws = await prisma.workspace.findFirstOrThrow();
    await prisma.broadcast.create({
      data: { workspaceId: ws.id, name: "b", templateId: t.body.id },
    });
    const del = await a.delete(`/api/templates/${t.body.id}`);
    expect(del.status).toBe(400);
  });
});
