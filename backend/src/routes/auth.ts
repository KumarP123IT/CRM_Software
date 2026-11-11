import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { randomToken, sha256 } from "../lib/crypto.js";
import { audit } from "../lib/audit.js";
import { enqueueMail } from "../lib/jobs.js";
import { config } from "../config.js";
import { AppError, unauthorized, badRequest, conflict } from "../lib/errors.js";
import { requireAuth } from "../plugins/auth.js";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  business: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/, "Slug must be 3-50 chars: lowercase letters, numbers, hyphens"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/;

// Used to equalize timing when the email doesn't exist.
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

function clientMeta(request: { ip: string; headers: Record<string, unknown> }) {
  const ua = request.headers["user-agent"];
  return {
    ip: request.ip,
    userAgent: typeof ua === "string" ? ua : undefined,
  };
}

interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  avatarColor: number;
  role: Role;
  online: boolean;
}

async function serializeUser(userId: string, preferredWorkspaceId?: string): Promise<AuthUserPayload> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const memberships = await prisma.membership.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const membership =
    memberships.find((m) => m.workspaceId === preferredWorkspaceId) ?? memberships[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    role: membership?.role ?? "agent",
    online: true,
  };
}

async function issueSession(
  fastify: FastifyInstance,
  reply: FastifyReply,
  user: User,
  meta: { ip: string; userAgent?: string | undefined },
  workspaceId?: string,
) {
  const accessToken = fastify.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: config.ACCESS_TOKEN_TTL },
  );

  const refreshToken = randomToken(48);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
      ip: meta.ip,
      ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
    },
  });

  const base = {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
  };
  reply.setCookie("access_token", accessToken, { ...base, maxAge: 15 * 60 });
  reply.setCookie("refresh_token", refreshToken, {
    ...base,
    sameSite: "strict",
    maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });

  return { token: accessToken, payload: await serializeUser(user.id, workspaceId) };
}

function clearSessionCookies(reply: FastifyReply) {
  const opts = { path: "/", httpOnly: true, secure: config.COOKIE_SECURE };
  reply.clearCookie("access_token", opts);
  reply.clearCookie("refresh_token", { ...opts, sameSite: "strict" });
}

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    { config: { rateLimit: { max: Math.round(5 * config.RATE_LIMIT_SCALE), timeWindow: "15 minutes" } } },
    async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const slugTaken = await prisma.workspace.findUnique({ where: { slug: body.slug } });
    if (slugTaken) throw conflict("slug_taken", "This URL is already taken");
    const emailTaken = await prisma.user.findUnique({ where: { email: body.email } });
    if (emailTaken) throw conflict("email_taken", "An account with this email already exists");

    const passwordHash = await hashPassword(body.password);
    const { user, workspace } = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { name: body.name, email: body.email, passwordHash, avatarColor: 0 },
      });
      const w = await tx.workspace.create({
        data: { name: body.business, slug: body.slug, city: "" },
      });
      await tx.membership.create({
        data: { workspaceId: w.id, userId: u.id, role: "owner" },
      });
      await tx.team.create({ data: { workspaceId: w.id, name: "General" } });
      return { user: u, workspace: w };
    });

    const meta = clientMeta(request);
    const session = await issueSession(fastify, reply, user, meta, workspace.id);
    await audit(prisma, {
      workspaceId: workspace.id,
      userId: user.id,
      action: "auth.register",
      targetType: "workspace",
      targetId: workspace.id,
      ...meta,
    });
    return reply.status(201).send({ user: session.payload, token: session.token });
    },
  );

  fastify.post("/login", { config: { rateLimit: { max: Math.round(10 * config.RATE_LIMIT_SCALE), timeWindow: "1 minute" } } }, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const meta = clientMeta(request);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const ok = await verifyPassword(hash, body.password);

    if (!user || !ok) {
      if (user) {
        const attempts = user.failedLoginAttempts + 1;
        const locked = attempts >= config.LOCKOUT_THRESHOLD;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: locked ? 0 : attempts,
            ...(locked
              ? { lockedUntil: new Date(Date.now() + config.LOCKOUT_MINUTES * 60 * 1000) }
              : {}),
          },
        });
      }
      await audit(prisma, {
        userId: user?.id,
        action: "auth.login_failed",
        meta: { email: body.email },
        ...meta,
      });
      throw unauthorized("That email and password don't match.");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(423, "account_locked", "Too many failed attempts. Try again later.");
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const firstMembership = await prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    const session = await issueSession(fastify, reply, user, meta, firstMembership?.workspaceId);
    await audit(prisma, {
      workspaceId: firstMembership?.workspaceId,
      userId: user.id,
      action: "auth.login",
      ...meta,
    });
    return reply.send({ user: session.payload, token: session.token });
  });

  fastify.post("/logout", async (request, reply) => {
    const refresh = request.cookies["refresh_token"];
    if (refresh) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: sha256(refresh), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    if (request.userId) {
      await audit(prisma, {
        userId: request.userId,
        action: "auth.logout",
        ...clientMeta(request),
      });
    }
    clearSessionCookies(reply);
    return reply.send({ ok: true });
  });

  fastify.post("/refresh", { config: { rateLimit: { max: Math.round(30 * config.RATE_LIMIT_SCALE), timeWindow: "1 minute" } } }, async (request, reply) => {
    const refresh = request.cookies["refresh_token"] ??
      (typeof request.body === "object" && request.body !== null
        ? (request.body as Record<string, unknown>)["refreshToken"]
        : undefined);
    if (typeof refresh !== "string" || !refresh) throw unauthorized("No refresh token");

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: sha256(refresh) },
      include: { user: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw unauthorized("Invalid or expired refresh token");
    }

    // Rotate: revoke old, issue new.
    const meta = clientMeta(request);
    const newRefresh = randomToken(48);
    const rotated = await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      const created = await tx.refreshToken.create({
        data: {
          userId: stored.userId,
          tokenHash: sha256(newRefresh),
          expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
          ip: meta.ip,
          ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
        },
      });
      await tx.refreshToken.update({
        where: { id: stored.id },
        data: { replacedBy: created.id },
      });
      return created;
    });
    void rotated;

    const accessToken = fastify.jwt.sign(
      { sub: stored.user.id, email: stored.user.email },
      { expiresIn: config.ACCESS_TOKEN_TTL },
    );
    const base = {
      httpOnly: true,
      secure: config.COOKIE_SECURE,
      sameSite: "lax" as const,
      path: "/",
    };
    reply.setCookie("access_token", accessToken, { ...base, maxAge: 15 * 60 });
    reply.setCookie("refresh_token", newRefresh, {
      ...base,
      sameSite: "strict",
      maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    });
    return reply.send({ token: accessToken });
  });

  fastify.post("/forgot-password", { config: { rateLimit: { max: Math.round(5 * config.RATE_LIMIT_SCALE), timeWindow: "15 minutes" } } }, async (request, reply) => {
    const body = forgotSchema.parse(request.body);
    const meta = clientMeta(request);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      // Invalidate previous unused tokens, then issue a new one.
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      const token = randomToken(32);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await enqueueMail({
        to: user.email,
        subject: "Reset your Konvo password",
        text: `Reset your password: http://localhost:3000/reset-password?token=${token}\nThis link expires in 1 hour.`,
      });
      await audit(prisma, {
        userId: user.id,
        action: "auth.password_reset_requested",
        ...meta,
      });
    }
    // Always the same response — don't leak which emails exist.
    return reply.send({ ok: true });
  });

  fastify.post("/reset-password", async (request, reply) => {
    const body = resetSchema.parse(request.body);
    const meta = clientMeta(request);

    const stored = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(body.token) },
      include: { user: true },
    });
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
      throw badRequest("invalid_token", "This reset link is invalid or has expired");
    }

    const passwordHash = await hashPassword(body.password);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: stored.userId },
        data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      });
      await tx.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      });
      // Kill all sessions — password change invalidates existing logins.
      await tx.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
    await audit(prisma, {
      userId: stored.userId,
      action: "auth.password_reset_completed",
      ...meta,
    });
    clearSessionCookies(reply);
    return reply.send({ ok: true });
  });

  fastify.get("/check-slug", async (request) => {
    const query = z.object({ slug: z.string() }).parse(request.query);
    const slug = query.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug)) return { available: false };
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    return { available: !existing };
  });

  fastify.get("/me", { preHandler: requireAuth }, async (request) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: request.userId } });
    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      include: { workspace: { select: { id: true, name: true, slug: true, plan: true, city: true } } },
      orderBy: { createdAt: "asc" },
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        role: memberships[0]?.role ?? "agent",
        online: true,
      },
      workspaces: memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
      })),
    };
  });
}
