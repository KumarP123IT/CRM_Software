import { createHmac, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { encryptSecret, decryptSecret } from "./crypto.js";
import { enqueueWebhookDelivery } from "./jobs.js";

export const WEBHOOK_EVENTS = [
  "message.created",
  "conversation.created",
  "conversation.assigned",
  "conversation.status_changed",
  "contact.created",
  "lead.created",
  "broadcast.sent",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

function eventMatches(filter: string, event: string): boolean {
  const f = filter.trim();
  if (f === "*" || f === "") return true;
  return f
    .split(",")
    .map((s) => s.trim())
    .some((pat) => pat === event || (pat.endsWith(".*") && event.startsWith(pat.slice(0, -1))));
}

/**
 * Fan a workspace event out to every active outbound webhook whose filter
 * matches. Creates WebhookDelivery rows and enqueues delivery jobs.
 * Never throws — webhook fan-out must not break the originating request.
 */
export async function emitWorkspaceEvent(
  workspaceId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const hooks = await prisma.webhook.findMany({
      where: { workspaceId, active: true, channelAccountId: null },
      select: { id: true, events: true },
    });
    const targets = hooks.filter((h) => eventMatches(h.events, event));
    if (!targets.length) return;

    const payload = {
      event,
      data: data as Prisma.InputJsonValue,
      sentAt: new Date().toISOString(),
    };
    for (const hook of targets) {
      const delivery = await prisma.webhookDelivery.create({
        data: { webhookId: hook.id, event, payload },
      });
      await enqueueWebhookDelivery(delivery.id);
    }
  } catch (err) {
    console.error(`[webhooks] emit ${event} failed:`, err);
  }
}

export function newWebhookSecret(): string {
  return randomBytes(24).toString("hex");
}

export function signPayload(secret: string, body: string): string {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

export { encryptSecret, decryptSecret };
