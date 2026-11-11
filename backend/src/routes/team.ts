import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, resolveWorkspace } from "../plugins/auth.js";

const listQuery = z.object({
  workspaceId: z.string().optional(),
});

function toApiUser(u: {
  id: string;
  name: string;
  email: string;
  avatarColor: number;
  role: string;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatarColor: u.avatarColor,
    role: u.role,
    online: true,
  };
}

export async function teamRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    listQuery.parse(request.query ?? {});
    await resolveWorkspace(request, reply);
  });

  // GET /team — members of the resolved workspace (contract: team.list → User[])
  fastify.get("/", async (request) => {
    const members = await prisma.membership.findMany({
      where: { workspaceId: request.workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });
    return members.map((m) => toApiUser({ ...m.user, role: m.role }));
  });
}

export async function teamsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    listQuery.parse(request.query ?? {});
    await resolveWorkspace(request, reply);
  });

  // GET /teams — teams of the resolved workspace (contract: team.teams → Team[])
  fastify.get("/", async (request) => {
    const teams = await prisma.team.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return teams;
  });
}
