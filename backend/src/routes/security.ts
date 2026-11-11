import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { encryptSecret, decryptSecret } from "../lib/crypto.js";
import { generateTotpSecret, verifyTotp, totpUri } from "../lib/totp.js";
import { unauthorized, badRequest } from "../lib/errors.js";
import { requireAuth } from "../plugins/auth.js";

function clientMeta(request: { ip: string; headers: Record<string, unknown> }) {
  const ua = request.headers["user-agent"];
  return {
    ip: request.ip,
    userAgent: typeof ua === "string" ? ua : undefined,
  };
}

const codeSchema = z.object({ code: z.string().trim().regex(/^\d{6}$/) });
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

async function totpSecretFor(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpSecretEncrypted: true },
  });
  if (!user?.totpSecretEncrypted) return null;
  try {
    return decryptSecret(user.totpSecretEncrypted);
  } catch {
    return null;
  }
}

export async function securityRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
  });

  // GET /auth/2fa/status
  fastify.get("/2fa/status", async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { totpEnabled: true },
    });
    return { enabled: user?.totpEnabled ?? false };
  });

  // POST /auth/2fa/setup — generate a secret (not yet enabled).
  fastify.post("/2fa/setup", async (request) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.userId },
      select: { email: true },
    });
    const secret = generateTotpSecret();
    await prisma.user.update({
      where: { id: request.userId },
      data: { totpSecretEncrypted: encryptSecret(secret), totpEnabled: false },
    });
    return { secret, otpauthUrl: totpUri(secret, user.email) };
  });

  // POST /auth/2fa/enable {code} — verify and turn 2FA on.
  fastify.post("/2fa/enable", async (request) => {
    const { code } = codeSchema.parse(request.body);
    const secret = await totpSecretFor(request.userId);
    if (!secret) throw badRequest("no_secret", "Run setup first");
    if (!verifyTotp(secret, code)) throw unauthorized("Invalid code");
    await prisma.user.update({
      where: { id: request.userId },
      data: { totpEnabled: true },
    });
    await audit(prisma, {
      userId: request.userId,
      action: "auth.2fa_enabled",
      ...clientMeta(request),
    });
    return { enabled: true };
  });

  // POST /auth/2fa/disable {code}
  fastify.post("/2fa/disable", async (request) => {
    const { code } = codeSchema.parse(request.body);
    const secret = await totpSecretFor(request.userId);
    if (!secret) throw badRequest("no_secret", "2FA is not configured");
    if (!verifyTotp(secret, code)) throw unauthorized("Invalid code");
    await prisma.user.update({
      where: { id: request.userId },
      data: { totpSecretEncrypted: null, totpEnabled: false },
    });
    await audit(prisma, {
      userId: request.userId,
      action: "auth.2fa_disabled",
      ...clientMeta(request),
    });
    return { enabled: false };
  });

  // POST /auth/password — change password (requires current).
  fastify.post("/password", async (request) => {
    const input = passwordSchema.parse(request.body);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: request.userId },
      select: { passwordHash: true },
    });
    const ok = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!ok) throw unauthorized("Current password is incorrect");
    await prisma.user.update({
      where: { id: request.userId },
      data: { passwordHash: await hashPassword(input.newPassword) },
    });
    // Revoke all sessions so other devices must re-authenticate.
    await prisma.refreshToken.updateMany({
      where: { userId: request.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await audit(prisma, {
      userId: request.userId,
      action: "auth.password_changed",
      ...clientMeta(request),
    });
    return { ok: true };
  });
}
