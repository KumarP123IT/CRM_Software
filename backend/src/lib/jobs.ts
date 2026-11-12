import { Queue, Worker, type Job } from "bullmq";
import nodemailer, { type Transporter } from "nodemailer";
import { config, isTest } from "../config.js";
import { redis } from "./redis.js";
import { prisma } from "./prisma.js";
import { getAdapter, type DeliveryStatusEvent, type InboundMessageEvent } from "../channels/index.js";
import { applyDeliveryStatuses, ingestInbound } from "./inbox.js";
import {
  prepareBroadcastDispatch,
  sendRecipientChunk,
} from "./broadcasts.js";
import { decryptSecret, signPayload } from "./webhook-out.js";
import { pinnedDispatcher, resolvePublicTarget } from "./ssrf.js";

// Node's fetch types come from undici-types while our Agent comes from the
// undici package — same runtime, nominally different types. Bridge once here.
type FetchDispatcher = NonNullable<RequestInit["dispatcher"]>;

export interface MailJobData {
  to: string;
  subject: string;
  text: string;
}

export interface SentMail extends MailJobData {
  at: string;
}

/** In-memory sink so tests (and local dev) can assert on "sent" email without SMTP. */
export const sentEmails: SentMail[] = [];
export function clearSentEmails() {
  sentEmails.length = 0;
}

export const MAIL_QUEUE = "mail";

let mailQueue: Queue<MailJobData> | null = null;
let mailWorker: Worker<MailJobData> | null = null;

export function getMailQueue(): Queue<MailJobData> {
  if (!mailQueue) {
    mailQueue = new Queue<MailJobData>(MAIL_QUEUE, { connection: redis() });
  }
  return mailQueue;
}

let mailTransporter: Transporter | null = null;

function getMailTransporter(): Transporter {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      ...(config.SMTP_USER ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASS ?? "" } } : {}),
    });
  }
  return mailTransporter;
}

export async function handleMailJob(data: MailJobData): Promise<void> {
  sentEmails.push({ ...data, at: new Date().toISOString() });
  if (config.SMTP_HOST) {
    await getMailTransporter().sendMail({
      from: config.SMTP_FROM,
      to: data.to,
      subject: data.subject,
      text: data.text,
    });
  } else {
    // Recipient address is personal data — don't write it to logs.
    console.log(`[mail] subject="${data.subject}" (recipient redacted)`);
  }
}

async function processMail(job: Job<MailJobData>): Promise<void> {
  await handleMailJob(job.data);
}

/** Enqueue a mail job. In tests jobs run inline so assertions are deterministic. */
export async function enqueueMail(data: MailJobData): Promise<void> {
  if (isTest || config.NODE_ENV === "development") {
    await handleMailJob(data);
    return;
  }
  await getMailQueue().add("send", data, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
}

export interface ChannelInboundJobData {
  accountId: string;
  events: InboundMessageEvent[];
  statuses: DeliveryStatusEvent[];
}

export const CHANNEL_INBOUND_QUEUE = "channel-inbound";

/* ---------- broadcasts ---------- */

export type BroadcastJobData =
  | { kind: "dispatch"; broadcastId: string }
  | { kind: "send"; broadcastId: string; recipientIds: string[] };

export const BROADCAST_QUEUE = "broadcasts";
const SEND_CHUNK = 25;

let broadcastQueue: Queue<BroadcastJobData> | null = null;
let broadcastWorker: Worker<BroadcastJobData> | null = null;

function getBroadcastQueue(): Queue<BroadcastJobData> {
  if (!broadcastQueue) {
    broadcastQueue = new Queue<BroadcastJobData>(BROADCAST_QUEUE, { connection: redis() });
  }
  return broadcastQueue;
}

async function handleBroadcastDispatchJob(broadcastId: string): Promise<void> {
  const ids = await prepareBroadcastDispatch(broadcastId);
  if (!ids?.length) return;
  for (let i = 0; i < ids.length; i += SEND_CHUNK) {
    const chunk = ids.slice(i, i + SEND_CHUNK);
    if (isTest) {
      await sendRecipientChunk(broadcastId, chunk);
    } else {
      await getBroadcastQueue().add(
        "send",
        { kind: "send", broadcastId, recipientIds: chunk },
        { attempts: 3, backoff: { type: "exponential", delay: 5000 } },
      );
    }
  }
}

async function processBroadcastJob(job: Job<BroadcastJobData>): Promise<void> {
  if (job.data.kind === "dispatch") {
    await handleBroadcastDispatchJob(job.data.broadcastId);
  } else {
    await sendRecipientChunk(job.data.broadcastId, job.data.recipientIds);
  }
}

/**
 * Enqueue (or inline-run) a broadcast dispatch. Scheduled broadcasts get a
 * delayed dispatch job; in tests a future schedule simply stays scheduled
 * (no worker runs), while immediate sends execute inline.
 */
export async function enqueueBroadcastDispatch(
  broadcastId: string,
  scheduledAt?: Date | null,
): Promise<void> {
  const delay = scheduledAt ? Math.max(0, scheduledAt.getTime() - Date.now()) : 0;
  if (isTest) {
    if (delay > 0) return; // stays "scheduled" — deterministic in tests
    await handleBroadcastDispatchJob(broadcastId);
    return;
  }
  await getBroadcastQueue().add(
    "dispatch",
    { kind: "dispatch", broadcastId },
    {
      ...(delay > 0 ? { delay } : {}),
      jobId: `broadcast-dispatch:${broadcastId}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    },
  );
}

/** Best-effort removal of a pending scheduled dispatch (cancel path). */
export async function removeBroadcastDispatch(broadcastId: string): Promise<void> {
  if (isTest) return;
  try {
    await getBroadcastQueue().remove(`broadcast-dispatch:${broadcastId}`);
  } catch {
    // job already gone or redis unreachable — broadcast row is source of truth
  }
}

/** Start the broadcast worker. Called once from app.ts; safe to call repeatedly. */
export function startBroadcastWorker(): void {
  if (broadcastWorker || isTest) return;
  broadcastWorker = new Worker<BroadcastJobData>(BROADCAST_QUEUE, processBroadcastJob, {
    connection: redis(),
  });
  broadcastWorker.on("failed", (job, err) => {
    console.error(`[broadcasts] job ${job?.id ?? "?"} failed:`, err.message);
  });
}

let channelInboundQueue: Queue<ChannelInboundJobData> | null = null;
let channelInboundWorker: Worker<ChannelInboundJobData> | null = null;

function getChannelInboundQueue(): Queue<ChannelInboundJobData> {
  if (!channelInboundQueue) {
    channelInboundQueue = new Queue<ChannelInboundJobData>(CHANNEL_INBOUND_QUEUE, {
      connection: redis(),
    });
  }
  return channelInboundQueue;
}

async function handleChannelInboundJob(data: ChannelInboundJobData): Promise<void> {
  const account = await prisma.channelAccount.findUnique({ where: { id: data.accountId } });
  if (!account || account.status !== "connected") return;
  // Touch adapter so unsupported types fail loudly here rather than silently.
  getAdapter(account.type);
  await ingestInbound(account, data.events);
  if (data.statuses.length) await applyDeliveryStatuses(account, data.statuses);
}

async function processChannelInbound(job: Job<ChannelInboundJobData>): Promise<void> {
  await handleChannelInboundJob(job.data);
}

/** Enqueue normalized inbound channel events. Inline in tests/dev. */
export async function enqueueChannelInbound(data: ChannelInboundJobData): Promise<void> {
  if (isTest || config.NODE_ENV === "development") {
    await handleChannelInboundJob(data);
    return;
  }
  await getChannelInboundQueue().add("inbound", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}

/** Start the channel inbound worker. Called once from app.ts; safe to call repeatedly. */
export function startChannelInboundWorker(): void {
  if (channelInboundWorker || isTest) return;
  channelInboundWorker = new Worker<ChannelInboundJobData>(
    CHANNEL_INBOUND_QUEUE,
    processChannelInbound,
    { connection: redis() },
  );
  channelInboundWorker.on("failed", (job, err) => {
    console.error(`[channel-inbound] job ${job?.id ?? "?"} failed:`, err.message);
  });
}

/* ---------- outbound webhooks ---------- */

export const WEBHOOK_QUEUE = "webhook-deliveries";
const WEBHOOK_MAX_ATTEMPTS = 5;

let webhookQueue: Queue<{ deliveryId: string }> | null = null;
let webhookWorker: Worker<{ deliveryId: string }> | null = null;

function getWebhookQueue(): Queue<{ deliveryId: string }> {
  if (!webhookQueue) {
    webhookQueue = new Queue<{ deliveryId: string }>(WEBHOOK_QUEUE, { connection: redis() });
  }
  return webhookQueue;
}

async function deliverWebhook(deliveryId: string): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { webhook: true },
  });
  if (!delivery || delivery.deliveredAt || !delivery.webhook.active) return;

  const body = JSON.stringify(delivery.payload);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-konvo-event": delivery.event,
    "x-konvo-delivery": delivery.id,
    "user-agent": "Konvo-Webhook/1.0",
  };
  if (delivery.webhook.secretEncrypted) {
    try {
      const secret = decryptSecret(delivery.webhook.secretEncrypted);
      headers["x-konvo-signature"] = signPayload(secret, body);
    } catch {
      // Secret undecryptable — deliver unsigned rather than drop the event.
    }
  }

  const attempts = delivery.attempts + 1;
  let dispatcher: FetchDispatcher | undefined;
  try {
    // Re-validate and pin at connect time — DNS answers can change after
    // registration, and the pinned lookup prevents a rebind between the check
    // and the socket connect.
    const target = await resolvePublicTarget(delivery.webhook.url);
    dispatcher = pinnedDispatcher(target) as unknown as FetchDispatcher;
    const res = await fetch(target.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(10_000),
      redirect: "manual",
      dispatcher,
    });
    // We only need the status — drop the body so the socket closes cleanly.
    await res.body?.cancel().catch(() => undefined);
    if (res.ok) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: res.status, attempts, deliveredAt: new Date(), lastError: null },
      });
      return;
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delivery failed";
    const exhausted = attempts >= WEBHOOK_MAX_ATTEMPTS;
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        attempts,
        lastError: message.slice(0, 500),
        ...(exhausted
          ? {}
          : { nextRetryAt: new Date(Date.now() + attempts * 60_000) }),
      },
    });
    if (!exhausted) {
      // Re-enqueue with delay via BullMQ in non-test envs; inline path rethrows.
      if (!isTest && config.NODE_ENV !== "development") {
        await getWebhookQueue().add(
          "deliver",
          { deliveryId },
          { delay: attempts * 60_000, attempts: 1 },
        );
      } else {
        throw err;
      }
    }
  } finally {
    await dispatcher?.close().catch(() => undefined);
  }
}

async function processWebhookJob(job: Job<{ deliveryId: string }>): Promise<void> {
  await deliverWebhook(job.data.deliveryId);
}

/** Enqueue (or inline-run) a webhook delivery. */
export async function enqueueWebhookDelivery(deliveryId: string): Promise<void> {
  if (isTest || config.NODE_ENV === "development") {
    await deliverWebhook(deliveryId);
    return;
  }
  await getWebhookQueue().add("deliver", { deliveryId }, { attempts: 1 });
}

/** Start the webhook delivery worker. Called once from app.ts. */
export function startWebhookWorker(): void {
  if (webhookWorker || isTest) return;
  webhookWorker = new Worker<{ deliveryId: string }>(WEBHOOK_QUEUE, processWebhookJob, {
    connection: redis(),
  });
  webhookWorker.on("failed", (job, err) => {
    console.error(`[webhooks] delivery ${job?.data.deliveryId ?? "?"} failed:`, err.message);
  });
}

/** Start the mail worker. Called once from app.ts; safe to call repeatedly. */
export function startMailWorker(): void {
  if (mailWorker || isTest) return;
  mailWorker = new Worker<MailJobData>(MAIL_QUEUE, processMail, { connection: redis() });
  mailWorker.on("failed", (job, err) => {
    console.error(`[mail] job ${job?.id ?? "?"} failed:`, err.message);
  });
}

export async function closeQueues(): Promise<void> {
  await mailWorker?.close();
  await mailQueue?.close();
  await channelInboundWorker?.close();
  await channelInboundQueue?.close();
  await broadcastWorker?.close();
  await broadcastQueue?.close();
  await webhookWorker?.close();
  await webhookQueue?.close();
  mailWorker = null;
  mailQueue = null;
  channelInboundWorker = null;
  channelInboundQueue = null;
  broadcastWorker = null;
  broadcastQueue = null;
  webhookWorker = null;
  webhookQueue = null;
  await redis().quit().catch(() => undefined);
}
