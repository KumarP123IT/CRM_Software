import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { randomToken, sha256 } from "../lib/crypto.js";
import { notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const SCOPES = ["read", "write"] as const;

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  scopes: z.array(z.enum(SCOPES)).min(1).max(2).default(["read"]),
});

function toApiKey(k: {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    scopes: k.scopes.split(",").filter(Boolean),
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    revokedAt: k.revokedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  };
}

export async function apiKeyRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const rows = await prisma.apiKey.findMany({
      where: { workspaceId: request.workspaceId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toApiKey);
  });

  fastify.post(
    "/",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const input = createSchema.parse(request.body);
      const key = `kv_${randomToken(24)}`;
      const record = await prisma.apiKey.create({
        data: {
          workspaceId: request.workspaceId,
          name: input.name,
          prefix: key.slice(0, 12),
          keyHash: sha256(key),
          scopes: input.scopes.join(","),
        },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "api_key.created",
        targetType: "api_key",
        targetId: record.id,
        ip: request.ip,
      });
      // Raw key is returned exactly once — only the SHA-256 hash is stored.
      return reply.status(201).send({ ...toApiKey(record), key });
    },
  );

  fastify.post(
    "/:id/revoke",
    { preHandler: requirePermission("settings.manage") },
    async (request) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.apiKey.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("API key not found");
      const key = await prisma.apiKey.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "api_key.revoked",
        targetType: "api_key",
        targetId: id,
        ip: request.ip,
      });
      return toApiKey(key);
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: requirePermission("settings.manage") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.apiKey.findFirst({
        where: { id, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!existing) throw notFound("API key not found");
      await prisma.apiKey.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
}
