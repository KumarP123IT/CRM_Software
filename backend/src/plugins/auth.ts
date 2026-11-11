import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import type { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { can, type Permission } from "../lib/permissions.js";
import { unauthorized, forbidden, notFound, AppError } from "../lib/errors.js";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
    /** Resolved workspace id, or "" when not yet resolved. */
    workspaceId: string;
    membershipRole?: Role;
  }
}

interface JwtPayload {
  sub: string;
  [key: string]: unknown;
}

/** Verify the access token from the httpOnly cookie or an Authorization Bearer header. */
export const authenticate = fp(async (fastify) => {
  fastify.decorateRequest("userId", "");
  fastify.decorateRequest("workspaceId", "");
  fastify.decorateRequest("membershipRole", undefined);

  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    const cookieToken = request.cookies["access_token"];
    const authHeader = request.headers.authorization;
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const token = cookieToken ?? bearer;
    if (!token) return; // leave userId empty — route-level guards decide

    try {
      const payload = fastify.jwt.verify<JwtPayload>(token);
      request.userId = payload.sub;
    } catch {
      // invalid/expired token — treated as unauthenticated
    }
  });
});

/** Require a valid access token. Use as a route preHandler. */
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.userId) throw unauthorized();
}

/**
 * Resolve the active workspace for this request and load the caller's membership.
 * Order: route param :workspaceId → x-workspace-id header → ?workspaceId= query →
 * the user's only membership (when they belong to exactly one workspace).
 * Sets request.workspaceId and request.membershipRole.
 */
export async function resolveWorkspace(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.userId) throw unauthorized();

  const params = request.params as Record<string, unknown>;
  const query = request.query as Record<string, unknown>;
  const fromParam = typeof params["workspaceId"] === "string" ? params["workspaceId"] : undefined;
  const fromHeader = request.headers["x-workspace-id"];
  const fromQuery = typeof query["workspaceId"] === "string" ? query["workspaceId"] : undefined;
  const explicit = fromParam ?? (typeof fromHeader === "string" ? fromHeader : undefined) ?? fromQuery;

  if (explicit) {
    const membership = await prisma.membership.findUnique({
      where: { workspaceId_userId: { workspaceId: explicit, userId: request.userId } },
    });
    // 404 (not 403) so workspace existence isn't leaked across tenants.
    if (!membership) throw notFound("Workspace not found");
    request.workspaceId = explicit;
    request.membershipRole = membership.role;
    return;
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: request.userId },
    select: { workspaceId: true, role: true },
    take: 2,
  });
  if (memberships.length === 0) throw notFound("Workspace not found");
  if (memberships.length > 1) {
    throw new AppError(400, "workspace_required", "Multiple workspaces — pass workspaceId");
  }
  const only = memberships[0];
  if (!only) throw notFound("Workspace not found");
  request.workspaceId = only.workspaceId;
  request.membershipRole = only.role;
}

/** Require a permission for the resolved workspace role. Use after resolveWorkspace. */
export function requirePermission(perm: Permission) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.membershipRole || !request.workspaceId) throw unauthorized();
    if (!can(request.membershipRole, perm)) throw forbidden();
  };
}
