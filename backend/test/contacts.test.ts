import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { agent, setupTestLifecycle } from "./helpers.js";
import { hashPassword } from "../src/lib/password.js";

setupTestLifecycle();

async function setup() {
  const a = agent();
  await a.post("/api/auth/register").send({
    name: "Owner",
    email: "owner@c.in",
    password: "password123",
    business: "Biz",
    slug: "biz-c",
  });
  return a;
}

async function addMember(workspaceSlug: string, email: string, role: string) {
  const ws = await prisma.workspace.findUniqueOrThrow({ where: { slug: workspaceSlug } });
  const user = await prisma.user.create({
    data: { name: email, email, passwordHash: await hashPassword("password123") },
  });
  await prisma.membership.create({ data: { workspaceId: ws.id, userId: user.id, role: role as never } });
  const a = agent();
  await a.post("/api/auth/login").send({ email, password: "password123" });
  return a;
}

describe("contacts", () => {
  it("creates, lists, searches and filters contacts", async () => {
    const a = await setup();
    const c1 = await a.post("/api/contacts").send({
      name: "Meera Krishnan",
      phone: "9876543210", // normalizes to +919876543210
      email: "meera@x.in",
      city: "Chennai",
      tags: ["VIP", "Lead"],
      createLead: true,
    });
    expect(c1.status).toBe(201);
    expect(c1.body.phone).toBe("+919876543210");
    expect(c1.body.optedIn).toBe(true);
    expect(c1.body.tags).toEqual(expect.arrayContaining(["VIP", "Lead"]));

    // Lead was created too
    const lead = await prisma.lead.findFirst({ where: { contactId: c1.body.id } });
    expect(lead).toBeTruthy();

    await a.post("/api/contacts").send({
      name: "Arjun Menon",
      phone: "+91 98123 45678",
      city: "Kochi",
      source: "import",
      optedOut: true,
    });

    const all = await a.get("/api/contacts");
    expect(all.body.total).toBe(2);

    const search = await a.get("/api/contacts?search=meera");
    expect(search.body.total).toBe(1);

    const byTag = await a.get("/api/contacts?tag=VIP");
    expect(byTag.body.total).toBe(1);

    const optedOut = await a.get("/api/contacts?optedOut=true");
    expect(optedOut.body.total).toBe(1);
    expect(optedOut.body.items[0].name).toBe("Arjun Menon");

    const bySource = await a.get("/api/contacts?source=import");
    expect(bySource.body.total).toBe(1);
  });

  it("updates contact, notes, and opt-out status", async () => {
    const a = await setup();
    const c = await a.post("/api/contacts").send({ name: "Test", phone: "+919000000001" });
    const id = c.body.id;

    const upd = await a.patch(`/api/contacts/${id}`).send({ city: "Pune", optedOut: true, tags: ["Cold"] });
    expect(upd.status).toBe(200);
    expect(upd.body.city).toBe("Pune");
    expect(upd.body.optedIn).toBe(false);
    expect(upd.body.tags).toContain("Cold");

    const notes = await a.patch(`/api/contacts/${id}/notes`).send({ notes: "Prefers evening calls" });
    expect(notes.body.notes).toBe("Prefers evening calls");
  });

  it("dedupes on phone per workspace", async () => {
    const a = await setup();
    await a.post("/api/contacts").send({ name: "First", phone: "9000000001" });
    const dup = await a.post("/api/contacts").send({ name: "Second", phone: "+91 90000 00001" });
    expect(dup.status).toBe(201); // upsert → updates existing
    const all = await a.get("/api/contacts");
    expect(all.body.total).toBe(1);
    expect(all.body.items[0].name).toBe("Second");
  });

  it("bulk actions: tags, opt-out, group, delete", async () => {
    const a = await setup();
    const ids: string[] = [];
    for (const p of ["9100000001", "9100000002", "9100000003"]) {
      const r = await a.post("/api/contacts").send({ name: p, phone: `+${p}` });
      ids.push(r.body.id);
    }
    const bulk = await a.post("/api/contacts/bulk").send({
      ids,
      action: "addTags",
      tags: ["BulkTag"],
    });
    expect(bulk.status).toBe(200);
    const tagged = await a.get("/api/contacts?tag=BulkTag");
    expect(tagged.body.total).toBe(3);

    await a.post("/api/contacts/bulk").send({ ids, action: "setOptedOut", optedOut: true });
    const opted = await a.get("/api/contacts?optedOut=true");
    expect(opted.body.total).toBe(3);

    const del = await a.post("/api/contacts/bulk").send({ ids: ids.slice(0, 1), action: "delete" });
    expect(del.status).toBe(200);
    expect(del.body.affected).toBe(1);
    expect((await a.get("/api/contacts")).body.total).toBe(2);
  });

  it("CSV import preview dedupes and commit upserts", async () => {
    const a = await setup();
    await a.post("/api/contacts").send({ name: "Existing", phone: "+919111111111" });

    const csvFixed = [
      "name,phone,email,city,tags",
      "New One,91222222222,new@x.in,Mumbai,VIP;Lead",
      "Existing,919111111111,,Chennai,",
      "Bad,abc,,",
    ].join("\n");
    const preview = await a.post("/api/contacts/import/preview").send({ csv: csvFixed });
    expect(preview.status).toBe(200);
    expect(preview.body.totals.total).toBe(3);
    expect(preview.body.totals.new).toBe(1);
    expect(preview.body.totals.duplicates).toBe(1);
    expect(preview.body.totals.invalid).toBe(1);

    const commit = await a.post("/api/contacts/import/commit").send({
      rows: preview.body.rows.filter((r: { status: string }) => r.status !== "invalid").map((r: { data: unknown }) => r.data),
    });
    expect(commit.status).toBe(200);
    expect(commit.body.created).toBe(1);
    expect(commit.body.updated).toBe(1);

    const all = await a.get("/api/contacts");
    expect(all.body.total).toBe(2); // existing + new
  });

  it("exports contacts as CSV", async () => {
    const a = await setup();
    await a.post("/api/contacts").send({ name: "Exp One", phone: "+919333333333", city: "Delhi" });
    const res = await a.get("/api/contacts/export");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("Exp One");
    expect(res.text).toContain("+919333333333");
  });
});

describe("contacts rbac", () => {
  it("readonly cannot create; agent can create but not delete", async () => {
    const a = await setup();
    const ro = await addMember("biz-c", "ro@c.in", "readonly");
    const ag = await addMember("biz-c", "ag@c.in", "agent");

    const roCreate = await ro.post("/api/contacts").send({ phone: "+919400000001" });
    expect(roCreate.status).toBe(403);

    const agCreate = await ag.post("/api/contacts").send({ phone: "+919400000002", name: "Agent Made" });
    expect(agCreate.status).toBe(201);

    const agDelete = await ag.delete(`/api/contacts/${agCreate.body.id}`);
    expect(agDelete.status).toBe(403);

    const ownerDelete = await a.delete(`/api/contacts/${agCreate.body.id}`);
    expect(ownerDelete.status).toBe(204);
  });
});

describe("tags and groups", () => {
  it("tag CRUD", async () => {
    const a = await setup();
    const t = await a.post("/api/tags").send({ name: "Whale", color: "#ff0000" });
    expect(t.status).toBe(201);
    const list = await a.get("/api/tags");
    expect(list.body.some((x: { name: string }) => x.name === "Whale")).toBe(true);
    const del = await a.delete(`/api/tags/${t.body.id}`);
    expect(del.status).toBe(204);
  });

  it("static group membership + dynamic group rule evaluation", async () => {
    const a = await setup();
    const c1 = await a.post("/api/contacts").send({ name: "High Value", phone: "+919555555551", city: "Mumbai" });
    await a.post("/api/contacts").send({ name: "Low Value", phone: "+919555555552", city: "Delhi" });

    const g = await a.post("/api/groups").send({ name: "Mumbai folks", kind: "static" });
    expect(g.status).toBe(201);
    const add = await a.post(`/api/groups/${g.body.id}/members`).send({ contactIds: [c1.body.id] });
    expect(add.body.memberCount).toBe(1);

    const filtered = await a.get(`/api/contacts?groupId=${g.body.id}`);
    expect(filtered.body.total).toBe(1);

    const dyn = await a.post("/api/groups").send({
      name: "Mumbaikars",
      kind: "dynamic",
      rules: [{ field: "city", operator: "equals", value: "Mumbai" }],
    });
    const dynGet = await a.get(`/api/groups/${dyn.body.id}`);
    expect(dynGet.body.memberCount).toBe(1);
    expect(dynGet.body.members[0].name).toBe("High Value");

    const groups = await a.get("/api/groups");
    expect(groups.body.length).toBe(2);
  });
});
