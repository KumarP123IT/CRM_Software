import { describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { agent, setupTestLifecycle } from "./helpers.js";
import { hashPassword } from "../src/lib/password.js";

setupTestLifecycle();

async function makeWorkspace(slug: string, email: string) {
  const a = agent();
  const res = await a.post("/api/auth/register").send({
    name: "User",
    email,
    password: "password123",
    business: `Biz ${slug}`,
    slug,
  });
  expect(res.status).toBe(201);
  const ws = await prisma.workspace.findUniqueOrThrow({ where: { slug } });
  return { agent: a, workspaceId: ws.id };
}

describe("cross-workspace isolation", () => {
  it("a member of workspace B cannot read or mutate workspace A", async () => {
    const a = await makeWorkspace("ws-alpha", "a@iso.in");
    const b = await makeWorkspace("ws-beta", "b@iso.in");

    // B listing workspaces sees only their own
    const list = await b.agent.get("/api/workspaces");
    expect(list.status).toBe(200);
    const slugs = list.body.map((w: { slug: string }) => w.slug);
    expect(slugs).toEqual(["ws-beta"]);

    // B cannot fetch A's workspace — 404, not 403 (no existence leak)
    const fetchA = await b.agent.get(`/api/workspaces/${a.workspaceId}`);
    expect(fetchA.status).toBe(404);

    // B cannot patch A's workspace
    const patchA = await b.agent
      .patch(`/api/workspaces/${a.workspaceId}`)
      .send({ name: "hijacked" });
    expect(patchA.status).toBe(404);

    // B's team list contains only B's members
    const team = await b.agent.get("/api/team");
    expect(team.status).toBe(200);
    expect(team.body).toHaveLength(1);
    expect(team.body[0].email).toBe("b@iso.in");

    // Sanity: A's workspace untouched
    const wsA = await prisma.workspace.findUniqueOrThrow({ where: { id: a.workspaceId } });
    expect(wsA.name).toBe("Biz ws-alpha");
  });

  it("data created in one workspace is invisible to another", async () => {
    const a = await makeWorkspace("ws-one", "one@iso.in");
    const b = await makeWorkspace("ws-two", "two@iso.in");

    // Give B a second member
    const member = await prisma.user.create({
      data: {
        name: "Second",
        email: "second@iso.in",
        passwordHash: await hashPassword("password123"),
      },
    });
    await prisma.membership.create({
      data: { workspaceId: b.workspaceId, userId: member.id, role: "agent" },
    });

    const teamB = await b.agent.get("/api/team?workspaceId=" + b.workspaceId);
    expect(teamB.body).toHaveLength(2);

    const teamA = await a.agent.get(`/api/team?workspaceId=${a.workspaceId}`);
    expect(teamA.body).toHaveLength(1);
  });
});
