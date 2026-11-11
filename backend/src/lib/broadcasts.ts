import type { Broadcast, ChannelAccount, Contact, Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { decryptSecret } from "./crypto.js";
import { matchesRules, type GroupRule } from "./group-rules.js";
import { getAdapter, type ChannelCredentials } from "../channels/index.js";
import { badRequest } from "./errors.js";

/* ---------- audience resolution ---------- */

export const AUDIENCE_ALL = "all";
export const AUDIENCE_OPTED_IN = "opted-in";

export type AudienceKind = "all" | "opted-in" | "group" | "tag";

export interface ParsedAudience {
  kind: AudienceKind;
  /** group id or tag name, when applicable. */
  ref?: string;
  /** Canonical stored descriptor. */
  canonical: string;
}

/** Parse + validate an audience descriptor against the workspace. */
export async function parseAudience(
  workspaceId: string,
  raw: string,
): Promise<ParsedAudience> {
  const value = raw.trim();
  if (value === AUDIENCE_ALL) return { kind: "all", canonical: AUDIENCE_ALL };
  if (value === AUDIENCE_OPTED_IN) {
    return { kind: "opted-in", canonical: AUDIENCE_OPTED_IN };
  }
  if (value.startsWith("group:")) {
    const id = value.slice("group:".length);
    const group = await prisma.contactGroup.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });
    if (!group) throw badRequest("invalid_audience", "Group not found");
    return { kind: "group", ref: id, canonical: `group:${id}` };
  }
  if (value.startsWith("tag:")) {
    const name = decodeURIComponent(value.slice("tag:".length));
    if (!name) throw badRequest("invalid_audience", "Tag name is empty");
    const tag = await prisma.tag.findFirst({
      where: { workspaceId, name },
      select: { id: true },
    });
    if (!tag) throw badRequest("invalid_audience", "Tag not found");
    return { kind: "tag", ref: name, canonical: `tag:${encodeURIComponent(name)}` };
  }
  throw badRequest(
    "invalid_audience",
    'Audience must be "all", "opted-in", "group:{id}" or "tag:{name}"',
  );
}

const contactInclude = {
  tags: { include: { tag: { select: { name: true } } } },
} satisfies Prisma.ContactInclude;

/** Resolve an audience descriptor to workspace contacts (bounded at 10k). */
export async function resolveAudienceContacts(
  workspaceId: string,
  audience: ParsedAudience,
): Promise<Contact[]> {
  const base: Prisma.ContactWhereInput = { workspaceId };
  if (audience.kind === "opted-in") base.optedOut = false;

  if (audience.kind === "group" && audience.ref) {
    const group = await prisma.contactGroup.findFirst({
      where: { id: audience.ref, workspaceId },
    });
    if (!group) return [];
    if (group.kind === "static") {
      const members = await prisma.contactGroupMember.findMany({
        where: { groupId: group.id },
        select: { contactId: true },
        take: 10000,
      });
      return prisma.contact.findMany({
        where: { ...base, id: { in: members.map((m) => m.contactId) } },
        take: 10000,
      });
    }
    // Dynamic group — evaluate rules in memory (same approach as /groups).
    const rules = (Array.isArray(group.rules) ? group.rules : []) as unknown as GroupRule[];
    const all = await prisma.contact.findMany({
      where: base,
      include: contactInclude,
      take: 10000,
    });
    return all.filter((c) =>
      matchesRules(
        {
          name: c.name,
          phone: c.phone,
          email: c.email,
          city: c.city,
          company: c.company,
          source: c.source,
          optedOut: c.optedOut,
          lifetimeValue: c.lifetimeValue,
          lastSeenAt: c.lastSeenAt,
          tags: c.tags.map((t) => t.tag.name),
        },
        rules,
      ),
    );
  }

  if (audience.kind === "tag" && audience.ref) {
    return prisma.contact.findMany({
      where: { ...base, tags: { some: { tag: { name: audience.ref } } } },
      take: 10000,
    });
  }

  return prisma.contact.findMany({ where: base, take: 10000 });
}

/** Human-readable audience label for list views. */
export async function audienceLabel(workspaceId: string, audience: string): Promise<string> {
  if (audience === AUDIENCE_ALL) return "All contacts";
  if (audience === AUDIENCE_OPTED_IN) return "Opted-in contacts";
  if (audience.startsWith("group:")) {
    const group = await prisma.contactGroup.findFirst({
      where: { id: audience.slice(6), workspaceId },
      select: { name: true },
    });
    return group ? `Group: ${group.name}` : audience;
  }
  if (audience.startsWith("tag:")) {
    return `Tag: ${decodeURIComponent(audience.slice(4))}`;
  }
  return audience;
}

/* ---------- delivery ---------- */

function accountCredentials(account: ChannelAccount): ChannelCredentials {
  if (!account.encryptedCredentials) return {};
  try {
    return JSON.parse(decryptSecret(account.encryptedCredentials)) as ChannelCredentials;
  } catch {
    return {};
  }
}

/** Pick the channel account for a broadcast: explicit, else first connected. */
export async function resolveChannelAccount(
  workspaceId: string,
  channelAccountId?: string | null,
): Promise<ChannelAccount | null> {
  if (channelAccountId) {
    return prisma.channelAccount.findFirst({
      where: { id: channelAccountId, workspaceId },
    });
  }
  return prisma.channelAccount.findFirst({
    where: { workspaceId, status: "connected" },
    orderBy: { createdAt: "asc" },
  });
}

async function recipientExternalId(
  account: ChannelAccount,
  contactId: string,
): Promise<string | null> {
  const identity = await prisma.contactIdentity.findFirst({
    where: {
      workspaceId: account.workspaceId,
      contactId,
      OR: [{ channelAccountId: account.id }, { channel: account.type }],
    },
    orderBy: { createdAt: "asc" },
  });
  return identity?.externalId ?? null;
}

/**
 * Snapshot the broadcast's audience into BroadcastRecipient rows. Opted-out
 * contacts are recorded as skipped. Safe to call repeatedly — existing rows
 * are kept (skipDuplicates), so re-sends don't duplicate recipients.
 */
export async function snapshotRecipients(broadcast: Broadcast): Promise<number> {
  const audience = await parseAudience(broadcast.workspaceId, broadcast.audience);
  const contacts = await resolveAudienceContacts(broadcast.workspaceId, audience);
  await prisma.broadcastRecipient.createMany({
    data: contacts.map((c) => ({
      broadcastId: broadcast.id,
      contactId: c.id,
      status: c.optedOut ? ("skipped" as const) : ("pending" as const),
    })),
    skipDuplicates: true,
  });
  // Contacts opted out since an earlier snapshot are skipped too.
  await prisma.broadcastRecipient.updateMany({
    where: { broadcastId: broadcast.id, status: "pending", contact: { optedOut: true } },
    data: { status: "skipped" },
  });
  return contacts.length;
}

/**
 * Prepare a broadcast for delivery: validate the channel account, ensure the
 * audience snapshot exists, flip status to "sending", and return the pending
 * recipient ids to fan out. Returns null when the broadcast can't send.
 * The caller (jobs.ts) enqueues send chunks — kept separate to avoid a
 * lib↔jobs import cycle.
 */
export async function prepareBroadcastDispatch(
  broadcastId: string,
): Promise<string[] | null> {
  const broadcast = await prisma.broadcast.findUnique({ where: { id: broadcastId } });
  if (!broadcast) return null;
  if (
    broadcast.status !== "draft" &&
    broadcast.status !== "scheduled" &&
    broadcast.status !== "sending"
  ) {
    return null;
  }
  // A delayed job that fires before scheduledAt (e.g. after a reschedule)
  // must not send early.
  if (broadcast.scheduledAt && broadcast.scheduledAt.getTime() > Date.now()) {
    return null;
  }

  const account = await resolveChannelAccount(broadcast.workspaceId, broadcast.channelAccountId);
  if (!account || account.status !== "connected") {
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: { status: "failed" },
    });
    return null;
  }

  // Ensure the audience snapshot exists (covers broadcasts whose recipients
  // were never materialized).
  const existing = await prisma.broadcastRecipient.count({ where: { broadcastId } });
  if (existing === 0) await snapshotRecipients(broadcast);

  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: { status: "sending", channelAccountId: account.id },
  });

  const pending = await prisma.broadcastRecipient.findMany({
    where: { broadcastId, status: "pending" },
    select: { id: true },
    take: 50000,
  });
  return pending.map((r) => r.id);
}

/** Deliver one chunk of pending recipients through the channel adapter. */
export async function sendRecipientChunk(
  broadcastId: string,
  recipientIds: string[],
): Promise<void> {
  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
    include: { template: true },
  });
  // Cancelled/finished broadcasts swallow late chunks.
  if (!broadcast || broadcast.status !== "sending") return;

  const account = await resolveChannelAccount(broadcast.workspaceId, broadcast.channelAccountId);
  if (!account || account.status !== "connected") {
    await prisma.broadcastRecipient.updateMany({
      where: { id: { in: recipientIds }, status: "pending" },
      data: { status: "failed", error: "No connected channel account", failedAt: new Date() },
    });
    await recountBroadcast(broadcastId);
    return;
  }

  const recipients = await prisma.broadcastRecipient.findMany({
    where: { id: { in: recipientIds }, broadcastId, status: "pending" },
    include: { contact: { select: { id: true, optedOut: true } } },
  });

  try {
    const adapter = getAdapter(account.type);
    const creds = accountCredentials(account);

    for (const r of recipients) {
      if (r.contact.optedOut) {
        await prisma.broadcastRecipient.update({
          where: { id: r.id },
          data: { status: "skipped" },
        });
        continue;
      }
      const to = await recipientExternalId(account, r.contactId);
      if (!to) {
        await prisma.broadcastRecipient.update({
          where: { id: r.id },
          data: { status: "skipped", error: "No channel identity for contact" },
        });
        continue;
      }
      try {
        const result = await adapter.send(account, creds, to, {
          body: broadcast.template.body,
          kind: "template",
          templateName: broadcast.template.name,
        });
        await prisma.broadcastRecipient.update({
          where: { id: r.id },
          data: {
            status: "sent",
            sentAt: new Date(),
            ...(result.providerMessageId ? { providerMessageId: result.providerMessageId } : {}),
          },
        });
      } catch (err) {
        await prisma.broadcastRecipient.update({
          where: { id: r.id },
          data: {
            status: "failed",
            error: err instanceof Error ? err.message : "Send failed",
            failedAt: new Date(),
          },
        });
      }
    }
  } catch (err) {
    // Infra-level failure (DB, adapter resolution) — recount and let BullMQ
    // retry; already-processed recipients keep their status.
    await recountBroadcast(broadcastId).catch(() => undefined);
    throw err;
  }

  await recountBroadcast(broadcastId);
}

/**
 * Recompute a broadcast's delivery counters from its recipients and settle the
 * broadcast status once nothing is pending/queued.
 */
export async function recountBroadcast(broadcastId: string): Promise<void> {
  const groups = await prisma.broadcastRecipient.groupBy({
    by: ["status"],
    where: { broadcastId },
    _count: { _all: true },
  });
  const count = (s: string) => groups.find((g) => g.status === s)?._count._all ?? 0;
  const sent = count("sent") + count("delivered") + count("read");
  const delivered = count("delivered") + count("read");
  const read = count("read");
  const failed = count("failed");
  const outstanding = count("pending") + count("queued");

  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
    select: { status: true },
  });
  if (!broadcast) return;

  let status = broadcast.status;
  if (broadcast.status === "sending" && outstanding === 0) {
    status = sent > 0 ? "sent" : failed > 0 ? "failed" : "sent";
  }
  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: { sent, delivered, read, status },
  });
}

/** Mark remaining pending/queued recipients skipped (cancel path). */
export async function skipOutstandingRecipients(broadcastId: string): Promise<void> {
  await prisma.broadcastRecipient.updateMany({
    where: { broadcastId, status: { in: ["pending", "queued"] } },
    data: { status: "skipped" },
  });
}
