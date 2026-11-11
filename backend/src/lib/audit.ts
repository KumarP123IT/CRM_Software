import type { Prisma, PrismaClient } from "@prisma/client";

export interface AuditEntry {
  workspaceId?: string | undefined;
  userId?: string | undefined;
  action: string;
  targetType?: string | undefined;
  targetId?: string | undefined;
  meta?: Record<string, unknown> | undefined;
  ip?: string | undefined;
  userAgent?: string | undefined;
}

/** Append an audit log row. Never throws — auditing must not break requests. */
export async function audit(prisma: PrismaClient, entry: AuditEntry): Promise<void> {
  try {
    const data: Prisma.AuditLogUncheckedCreateInput = { action: entry.action };
    if (entry.workspaceId) data.workspaceId = entry.workspaceId;
    if (entry.userId) data.userId = entry.userId;
    if (entry.targetType) data.targetType = entry.targetType;
    if (entry.targetId) data.targetId = entry.targetId;
    if (entry.meta) data.meta = entry.meta as Prisma.InputJsonValue;
    if (entry.ip) data.ip = entry.ip;
    if (entry.userAgent) data.userAgent = entry.userAgent;
    await prisma.auditLog.create({ data });
  } catch {
    // swallow — audit failures are non-fatal
  }
}
