import type { ChannelAccount, Message } from "@prisma/client";
import { prisma } from "./prisma.js";
import { publishInbox } from "./events.js";
import { getAdapter } from "../channels/index.js";
import {
  accountCredentials,
  recipientExternalId,
  toApiMessage,
} from "./inbox.js";

const BODY_PREVIEW_LEN = 140;
const MAX_AUTOMATED_PER_INBOUND = 2;

export type AutoReplyTrigger = "first_message" | "keyword" | "outside_hours";
export type BotTriggerType = AutoReplyTrigger;

export interface BotTrigger {
  type: BotTriggerType;
  keywords?: string[];
  response: string;
}

interface DayHours {
  day: number; // 0 = Sunday … 6 = Saturday
  open: string; // "HH:MM"
  close: string;
}

function isValidTrigger(t: unknown): t is BotTrigger {
  if (typeof t !== "object" || t === null) return false;
  const o = t as Record<string, unknown>;
  return (
    (o.type === "first_message" || o.type === "keyword" || o.type === "outside_hours") &&
    typeof o.response === "string" &&
    o.response.trim().length > 0 &&
    (o.keywords === undefined ||
      (Array.isArray(o.keywords) && o.keywords.every((k) => typeof k === "string")))
  );
}

export function parseBotTrigger(raw: unknown): BotTrigger | null {
  return isValidTrigger(raw) ? raw : null;
}

/** Current weekday (0=Sun) and minutes-since-midnight in the given IANA timezone. */
function zonedNow(timezone: string): { day: number; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const dayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const hour = Number(get("hour")) % 24;
    return { day: dayMap[get("weekday")] ?? new Date().getDay(), minutes: hour * 60 + Number(get("minute")) };
  } catch {
    const d = new Date();
    return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
  }
}

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Is the workspace currently inside business hours? No config → always open. */
export function isOutsideBusinessHours(
  hours: unknown,
  timezone: string,
  enabled: boolean,
): boolean {
  if (!enabled || !Array.isArray(hours) || hours.length === 0) return false;
  const now = zonedNow(timezone);
  const today = (hours as DayHours[]).find((h) => h.day === now.day);
  if (!today) return true;
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (open === null || close === null) return true;
  return now.minutes < open || now.minutes >= close;
}

function keywordMatch(keywords: string[], text: string): boolean {
  const t = text.toLowerCase();
  return keywords.some((k) => {
    const kw = k.trim().toLowerCase();
    return kw.length >= 2 && t.includes(kw);
  });
}

/** Deliver an automated outbound text message (no human author). */
async function sendAutomated(
  account: ChannelAccount,
  conversationId: string,
  contactId: string,
  body: string,
): Promise<Message | null> {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const to = await recipientExternalId(account, contactId);
  if (!to) return null;

  let message = await prisma.message.create({
    data: {
      workspaceId: account.workspaceId,
      conversationId,
      channelAccountId: account.id,
      direction: "out",
      kind: "text",
      body: trimmed,
      authorId: null,
      status: "sent",
    },
  });

  try {
    const adapter = getAdapter(account.type);
    const result = await adapter.send(account, accountCredentials(account), to, {
      kind: "text",
      body: trimmed,
    });
    if (result.providerMessageId) {
      message = await prisma.message.update({
        where: { id: message.id },
        data: { providerMessageId: result.providerMessageId },
      });
    }
  } catch (err) {
    message = await prisma.message.update({
      where: { id: message.id },
      data: {
        status: "failed",
        failReason: err instanceof Error ? err.message : "Send failed",
      },
    });
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: trimmed.slice(0, BODY_PREVIEW_LEN),
      lastMessageAt: message.sentAt,
    },
  });
  publishInbox(account.workspaceId, {
    type: "message",
    conversationId,
    message: toApiMessage(message),
  });
  return message;
}

/**
 * Evaluate automation rules for a freshly stored inbound message:
 * business-hours away replies, keyword/first-message auto-replies, and bots.
 * Capped at MAX_AUTOMATED_PER_INBOUND sends; bots' `runs` increments on fire.
 */
export async function runAutomation(
  workspaceId: string,
  conversationId: string,
  inbound: Message,
): Promise<void> {
  if (inbound.direction !== "in" || inbound.kind !== "text" || !inbound.body.trim()) return;

  const [conversation, businessHours, autoReplies, bots, messageCount] = await Promise.all([
    prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
      select: { id: true, contactId: true, channelAccountId: true, channel: true },
    }),
    prisma.businessHours.findUnique({ where: { workspaceId } }),
    prisma.autoReply.findMany({ where: { workspaceId, active: true } }),
    prisma.bot.findMany({ where: { workspaceId, active: true } }),
    prisma.message.count({ where: { conversationId } }),
  ]);
  if (!conversation) return;

  const account = conversation.channelAccountId
    ? await prisma.channelAccount.findFirst({
        where: { id: conversation.channelAccountId, workspaceId },
      })
    : await prisma.channelAccount.findFirst({
        where: { workspaceId, type: conversation.channel as ChannelAccount["type"], status: "connected" },
        orderBy: { createdAt: "asc" },
      });
  if (!account || account.status !== "connected") return;

  const outsideHours = isOutsideBusinessHours(
    businessHours?.hours,
    businessHours?.timezone ?? "UTC",
    businessHours?.enabled ?? true,
  );
  const isFirstMessage = messageCount === 1;
  const text = inbound.body;

  interface Candidate {
    body: string;
    botId?: string;
  }
  const candidates: Candidate[] = [];

  // Auto-replies first (settings-managed), then bots.
  for (const rule of autoReplies) {
    const hit =
      (rule.trigger === "outside_hours" && outsideHours) ||
      (rule.trigger === "first_message" && isFirstMessage) ||
      (rule.trigger === "keyword" && keywordMatch(rule.keywords, text));
    if (hit) candidates.push({ body: rule.response });
  }
  for (const bot of bots) {
    const trigger = parseBotTrigger(bot.trigger);
    if (!trigger) continue;
    const hit =
      (trigger.type === "outside_hours" && outsideHours) ||
      (trigger.type === "first_message" && isFirstMessage) ||
      (trigger.type === "keyword" && keywordMatch(trigger.keywords ?? [], text));
    if (hit) candidates.push({ body: trigger.response, botId: bot.id });
  }

  // Dedupe identical bodies, cap sends.
  const seen = new Set<string>();
  const firedBotIds: string[] = [];
  let sent = 0;
  for (const c of candidates) {
    if (sent >= MAX_AUTOMATED_PER_INBOUND) break;
    const key = c.body.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const msg = await sendAutomated(account, conversationId, conversation.contactId, c.body);
    if (msg && msg.status !== "failed") {
      sent++;
      if (c.botId) firedBotIds.push(c.botId);
    }
  }

  if (firedBotIds.length) {
    await prisma.bot.updateMany({
      where: { id: { in: firedBotIds } },
      data: { runs: { increment: 1 } },
    });
  }
}
