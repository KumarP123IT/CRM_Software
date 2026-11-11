import type { ChannelAccount, Conversation, Message, Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { decryptSecret } from "./crypto.js";
import { normalizePhone } from "./phone.js";
import { publishInbox } from "./events.js";
import { getAdapter, type ChannelCredentials, type InboundMessageEvent } from "../channels/index.js";
import type { DeliveryStatusEvent } from "../channels/types.js";
import { badRequest, notFound } from "./errors.js";
import { recountBroadcast } from "./broadcasts.js";

/* ---------- API shapes (mirror frontend Conversation/Message contracts) ---------- */

export const conversationInclude = {
  contact: {
    include: { tags: { include: { tag: { select: { name: true } } } } },
  },
} satisfies Prisma.ConversationInclude;

type ConversationWithContact = Prisma.ConversationGetPayload<{
  include: typeof conversationInclude;
}>;

export function toApiConversation(c: ConversationWithContact) {
  return {
    id: c.id,
    contactId: c.contactId,
    contactName: c.contact.name ?? c.contact.phone,
    contactPhone: c.contact.phone,
    assigneeId: c.assigneeId ?? undefined,
    teamId: c.teamId ?? undefined,
    status: c.status,
    unread: c.unread,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt.toISOString(),
    tags: c.contact.tags.map((t) => t.tag.name),
    channel: c.channel,
    slaDueAt: c.slaDueAt?.toISOString(),
    windowClosesAt: c.windowClosesAt?.toISOString(),
    snoozedUntil: c.snoozedUntil?.toISOString(),
    createdAt: c.createdAt.toISOString(),
  };
}

export function toApiMessage(m: Message) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    direction: m.direction,
    kind: m.kind,
    body: m.body,
    sentAt: m.sentAt.toISOString(),
    authorId: m.authorId ?? undefined,
    status: m.status ?? undefined,
    failReason: m.failReason ?? undefined,
    replyToId: m.replyToId ?? undefined,
    mediaUrl: m.mediaUrl ?? undefined,
    fileName: m.fileName ?? undefined,
    durationSec: m.durationSec ?? undefined,
    buttons: Array.isArray(m.buttons) ? m.buttons : undefined,
    templateName: m.templateName ?? undefined,
  };
}

/** Decrypt a ChannelAccount's credential blob. Returns {} when absent/corrupt. */
export function accountCredentials(account: ChannelAccount): ChannelCredentials {
  if (!account.encryptedCredentials) return {};
  try {
    return JSON.parse(decryptSecret(account.encryptedCredentials)) as ChannelCredentials;
  } catch {
    return {};
  }
}

export const QUICK_REPLIES = [
  { id: "qr1", shortcut: "menu", body: "Here's our menu — let me know what you'd like!" },
  { id: "qr2", shortcut: "hours", body: "We're open every day. What time works for you?" },
  { id: "qr3", shortcut: "thanks", body: "Thank you for reaching out! Is there anything else I can help with?" },
  { id: "qr4", shortcut: "delay", body: "Sorry for the wait — we're on it and will update you shortly." },
];

/* ---------- inbound ingestion ---------- */

const WHATSAPP_WINDOW_MS = 24 * 60 * 60 * 1000;

function senderPhone(channelType: string, senderId: string): string {
  if (channelType === "whatsapp" || channelType === "sms") {
    return normalizePhone(senderId) ?? senderId;
  }
  return senderId;
}

async function resolveContact(
  account: ChannelAccount,
  event: InboundMessageEvent,
): Promise<string> {
  const existing = await prisma.contactIdentity.findFirst({
    where: {
      workspaceId: account.workspaceId,
      externalId: event.senderId,
      OR: [{ channelAccountId: account.id }, { channel: account.type, channelAccountId: null }],
    },
    select: { contactId: true },
  });
  if (existing) return existing.contactId;

  const contact = await prisma.contact.create({
    data: {
      workspaceId: account.workspaceId,
      phone: senderPhone(account.type, event.senderId),
      name: event.senderName ?? null,
      source: account.type,
      lastSeenAt: new Date(),
    },
  });
  await prisma.contactIdentity.create({
    data: {
      workspaceId: account.workspaceId,
      contactId: contact.id,
      channel: account.type,
      channelAccountId: account.id,
      externalId: event.senderId,
    },
  });
  return contact.id;
}

async function resolveConversation(
  account: ChannelAccount,
  contactId: string,
): Promise<Conversation> {
  const open = await prisma.conversation.findFirst({
    where: {
      workspaceId: account.workspaceId,
      contactId,
      channelAccountId: account.id,
      status: { in: ["open", "pending"] },
    },
    orderBy: { lastMessageAt: "desc" },
  });
  if (open) return open;
  const now = new Date();
  const conversation = await prisma.conversation.create({
    data: {
      workspaceId: account.workspaceId,
      contactId,
      channelAccountId: account.id,
      channel: account.type,
      status: "open",
      windowClosesAt: account.type === "whatsapp" ? new Date(now.getTime() + WHATSAPP_WINDOW_MS) : null,
    },
  });

  // Auto-assign new conversations to the least-loaded workspace member.
  if (account.autoAssign) {
    const assigneeId = await pickAssignee(account.workspaceId);
    if (assigneeId) {
      return prisma.conversation.update({
        where: { id: conversation.id },
        data: { assigneeId },
      });
    }
  }
  return conversation;
}

async function pickAssignee(workspaceId: string): Promise<string | null> {
  const members = await prisma.membership.findMany({
    where: { workspaceId, role: { in: ["owner", "admin", "manager", "agent"] } },
    select: { userId: true },
    take: 50,
  });
  if (members.length === 0) return null;
  const loads = await prisma.conversation.groupBy({
    by: ["assigneeId"],
    where: {
      workspaceId,
      status: { in: ["open", "pending"] },
      assigneeId: { in: members.map((m) => m.userId) },
    },
    _count: { _all: true },
  });
  const loadOf = new Map(loads.map((l) => [l.assigneeId, l._count._all]));
  let best: string | null = null;
  let bestLoad = Infinity;
  for (const m of members) {
    const load = loadOf.get(m.userId) ?? 0;
    if (load < bestLoad) {
      bestLoad = load;
      best = m.userId;
    }
  }
  return best;
}

const BODY_PREVIEW_LEN = 140;

/**
 * Ingest normalized inbound events for a channel account: resolve contact +
 * conversation, dedupe by (channelAccountId, providerMessageId), update thread
 * state, and publish SSE events. Returns number of messages stored.
 */
export async function ingestInbound(
  account: ChannelAccount,
  events: InboundMessageEvent[],
): Promise<number> {
  let stored = 0;
  for (const event of events) {
    if (!event.senderId) continue;
    const contactId = await resolveContact(account, event);
    const conversation = await resolveConversation(account, contactId);
    const sentAt = event.sentAt ? new Date(event.sentAt) : new Date();
    const preview =
      event.text ||
      (event.kind && event.kind !== "text" ? `[${event.kind}]` : "") ||
      "";

    let message: Message;
    try {
      message = await prisma.message.create({
        data: {
          workspaceId: account.workspaceId,
          conversationId: conversation.id,
          channelAccountId: account.id,
          direction: "in",
          kind: event.kind ?? "text",
          body: event.text,
          status: "delivered",
          ...(event.providerMessageId ? { providerMessageId: event.providerMessageId } : {}),
          ...(event.mediaUrl ? { mediaUrl: event.mediaUrl } : {}),
          ...(event.fileName ? { fileName: event.fileName } : {}),
          sentAt,
        },
      });
    } catch (err) {
      // Unique (channelAccountId, providerMessageId) → duplicate webhook delivery.
      if ((err as { code?: string }).code === "P2002") continue;
      throw err;
    }
    stored++;

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: preview.slice(0, BODY_PREVIEW_LEN),
        lastMessageAt: sentAt,
        unread: { increment: 1 },
        ...(account.type === "whatsapp"
          ? { windowClosesAt: new Date(sentAt.getTime() + WHATSAPP_WINDOW_MS) }
          : {}),
      },
    });
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastSeenAt: sentAt },
    });

    publishInbox(account.workspaceId, {
      type: "message",
      conversationId: conversation.id,
      message: toApiMessage(message),
    });
  }
  return stored;
}

/** Apply provider delivery receipts (WhatsApp statuses etc). */
export async function applyDeliveryStatuses(
  account: ChannelAccount,
  statuses: DeliveryStatusEvent[],
): Promise<number> {
  let applied = 0;
  for (const s of statuses) {
    const message = await prisma.message.findFirst({
      where: { channelAccountId: account.id, providerMessageId: s.providerMessageId },
    });
    if (!message) {
      // Broadcast recipient receipts — update per-recipient status + counters.
      const recipient = await prisma.broadcastRecipient.findFirst({
        where: { providerMessageId: s.providerMessageId },
      });
      if (!recipient || recipient.status === s.status) continue;
      if (recipient.status === "read" && s.status !== "read") continue;
      const now = new Date();
      await prisma.broadcastRecipient.update({
        where: { id: recipient.id },
        data: {
          status: s.status,
          ...(s.status === "delivered" ? { deliveredAt: now } : {}),
          ...(s.status === "read" ? { readAt: now } : {}),
          ...(s.status === "failed" ? { failedAt: now } : {}),
        },
      });
      await recountBroadcast(recipient.broadcastId);
      applied++;
      continue;
    }
    if (message.status === s.status) continue;
    // Never regress a terminal/read state.
    if (message.status === "read" && s.status !== "read") continue;
    const updated = await prisma.message.update({
      where: { id: message.id },
      data: { status: s.status },
    });
    applied++;
    publishInbox(account.workspaceId, {
      type: "message",
      conversationId: message.conversationId,
      message: toApiMessage(updated),
    });
  }
  return applied;
}

/* ---------- outbound ---------- */

export interface SendMessageRequest {
  kind: "text" | "image" | "document" | "voice" | "template" | "interactive" | "note";
  body: string;
  replyToId?: string | undefined;
  fileName?: string | undefined;
  templateId?: string | undefined;
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
 * Send an agent reply: persist the outbound message, deliver via the channel
 * adapter, and record provider id / failure. Notes are stored only.
 */
export async function sendReply(
  workspaceId: string,
  conversationId: string,
  input: SendMessageRequest,
  authorId: string,
): Promise<Message> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, workspaceId },
  });
  if (!conversation) throw notFound("Conversation not found");

  if (input.replyToId) {
    const replyTo = await prisma.message.findFirst({
      where: { id: input.replyToId, conversationId },
      select: { id: true },
    });
    if (!replyTo) throw badRequest("invalid_reply_to", "Reply target not in this conversation");
  }

  let templateName: string | undefined;
  if (input.kind === "template" && input.templateId) {
    const template = await prisma.template.findFirst({
      where: { id: input.templateId, workspaceId },
      select: { name: true },
    });
    templateName = template?.name;
  }

  let message = await prisma.message.create({
    data: {
      workspaceId,
      conversationId,
      channelAccountId: conversation.channelAccountId,
      direction: "out",
      kind: input.kind,
      body: input.body,
      authorId,
      status: "sent",
      ...(input.replyToId ? { replyToId: input.replyToId } : {}),
      ...(input.fileName ? { fileName: input.fileName } : {}),
      ...(templateName ? { templateName } : {}),
    },
  });

  const isNote = input.kind === "note";
  if (!isNote) {
    const account = conversation.channelAccountId
      ? await prisma.channelAccount.findFirst({
          where: { id: conversation.channelAccountId, workspaceId },
        })
      : await prisma.channelAccount.findFirst({
          where: { workspaceId, type: conversation.channel as ChannelAccount["type"], status: "connected" },
          orderBy: { createdAt: "asc" },
        });

    try {
      if (!account || account.status !== "connected") {
        throw new Error("No connected channel account for this conversation");
      }
      const to = await recipientExternalId(account, conversation.contactId);
      if (!to) throw new Error("No channel identity for this contact");
      const adapter = getAdapter(account.type);
      const result = await adapter.send(account, accountCredentials(account), to, {
        body: input.body,
        kind: input.kind,
        ...(templateName ? { templateName } : {}),
        ...(input.fileName ? { fileName: input.fileName } : {}),
      });
      message = await prisma.message.update({
        where: { id: message.id },
        data: {
          ...(result.providerMessageId ? { providerMessageId: result.providerMessageId } : {}),
        },
      });
    } catch (err) {
      message = await prisma.message.update({
        where: { id: message.id },
        data: {
          status: "failed",
          failReason: err instanceof Error ? err.message : "Send failed",
        },
      });
    }
  }

  if (!isNote) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: (input.body || `[${input.kind}]`).slice(0, BODY_PREVIEW_LEN),
        lastMessageAt: message.sentAt,
      },
    });
  }

  publishInbox(workspaceId, {
    type: "message",
    conversationId,
    message: toApiMessage(message),
  });
  return message;
}
