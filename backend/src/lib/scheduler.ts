import { Queue, Worker, type Job } from "bullmq";
import { prisma } from "./prisma.js";
import { redis } from "./redis.js";
import { config, isTest } from "../config.js";
import { publishInbox } from "./events.js";
import { emitWorkspaceEvent } from "./webhook-out.js";
import { sendAutomated } from "./automation.js";

/**
 * Periodic sweeps + delayed automation, backed by a BullMQ repeatable job.
 *
 * A single "tick" job runs every TICK_MS and performs five idempotent sweeps:
 *   1. snooze wake-up      — clear snoozedUntil once it has passed
 *   2. SLA breach detect   — stamp slaBreachedAt on first-response SLA misses
 *   3. call reminders      — mark due reminders notified (once)
 *   4. delayed auto-reply  — fired by per-message delayed jobs (see below)
 *   5. auto-close          — resolve conversations idle past the workspace limit
 *
 * Every sweep uses conditional updates ("only if still due / not yet done"),
 * so re-running a tick — or running two workers — cannot double-apply.
 *
 * Delayed auto-replies are BullMQ jobs with `delay` on this same queue
 * (jobId-deduped). In test/dev they run on setTimeout so fake timers work.
 */

export const SCHEDULER_QUEUE = "scheduler";
export const TICK_MS = 30_000;
const SWEEP_LIMIT = 200;

/* ---------- delayed auto-reply ---------- */

export interface DelayedAutoReply {
  workspaceId: string;
  conversationId: string;
  accountId: string;
  contactId: string;
  body: string;
  /** Inbound message that triggered the rule — staleness + dedupe anchor. */
  triggerMessageId: string;
  delaySeconds: number;
  sourceKind: "autoReply" | "bot";
  sourceId: string;
}

function autoReplyJobId(d: DelayedAutoReply): string {
  return `autoreply:${d.triggerMessageId}:${d.sourceKind}:${d.sourceId}`;
}

/**
 * Schedule an automated reply `delaySeconds` after the triggering inbound.
 * Production/dev: BullMQ delayed job (dev uses setTimeout — a restart drops
 * pending replies, which is fine outside prod). Tests: setTimeout so
 * vi.useFakeTimers() controls firing.
 */
export async function enqueueDelayedAutoReply(d: DelayedAutoReply): Promise<void> {
  const delayMs = Math.max(0, d.delaySeconds * 1000);
  if (isTest || config.NODE_ENV === "development") {
    const timer = setTimeout(() => {
      void handleDelayedAutoReply(d).catch((err) => {
        console.error("[scheduler] delayed auto-reply failed:", err);
      });
    }, delayMs);
    timer.unref?.();
    return;
  }
  await getSchedulerQueue().add("auto-reply", d, {
    delay: delayMs,
    jobId: autoReplyJobId(d),
    attempts: 2,
    backoff: { type: "exponential", delay: 30_000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  });
}

/**
 * Fire a delayed auto-reply. Idempotent and self-invalidating:
 *  - skips if the conversation is gone/resolved or the rule was disabled
 *  - skips if a NEWER inbound arrived (the reply would be stale)
 *  - skips if an identical automated reply was already sent (retry safety)
 */
export async function handleDelayedAutoReply(d: DelayedAutoReply): Promise<void> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: d.conversationId, workspaceId: d.workspaceId },
    select: { id: true, status: true, contactId: true },
  });
  if (!conversation || conversation.status === "resolved") return;

  // Opted-out contacts must not receive automated replies — STOP may have
  // arrived while this job was pending.
  const contactRow = await prisma.contact.findUnique({
    where: { id: conversation.contactId },
    select: { optedOut: true },
  });
  if (contactRow?.optedOut) return;

  const latestInbound = await prisma.message.findFirst({
    where: { conversationId: d.conversationId, direction: "in" },
    orderBy: { sentAt: "desc" },
    select: { id: true },
  });
  if (latestInbound?.id !== d.triggerMessageId) return;

  const source =
    d.sourceKind === "autoReply"
      ? await prisma.autoReply.findFirst({
          where: { id: d.sourceId, workspaceId: d.workspaceId, active: true },
          select: { id: true },
        })
      : await prisma.bot.findFirst({
          where: { id: d.sourceId, workspaceId: d.workspaceId, active: true },
          select: { id: true },
        });
  if (!source) return;

  const alreadySent = await prisma.message.findFirst({
    where: {
      conversationId: d.conversationId,
      direction: "out",
      authorId: null,
      body: d.body.trim(),
    },
    select: { id: true },
  });
  if (alreadySent) return;

  const account = await prisma.channelAccount.findFirst({
    where: { id: d.accountId, workspaceId: d.workspaceId, status: "connected" },
  });
  if (!account) return;

  const sent = await sendAutomated(account, d.conversationId, conversation.contactId, d.body);
  if (sent && sent.status !== "failed" && d.sourceKind === "bot") {
    await prisma.bot.update({
      where: { id: d.sourceId },
      data: { runs: { increment: 1 } },
    });
  }
}

/* ---------- periodic sweeps ---------- */

async function sweepSnoozed(now: Date): Promise<void> {
  const due = await prisma.conversation.findMany({
    where: { snoozedUntil: { not: null, lte: now } },
    select: { id: true, workspaceId: true },
    take: SWEEP_LIMIT,
  });
  for (const c of due) {
    // Guard: only clear if it is STILL due — a re-snooze to a future time wins.
    const res = await prisma.conversation.updateMany({
      where: { id: c.id, snoozedUntil: { not: null, lte: now } },
      data: { snoozedUntil: null },
    });
    if (res.count > 0) {
      publishInbox(c.workspaceId, {
        type: "conversation",
        conversationId: c.id,
        conversation: { id: c.id, snoozedUntil: null },
      });
    }
  }
}

async function sweepSlaBreaches(now: Date): Promise<void> {
  const due = await prisma.conversation.findMany({
    where: {
      slaDueAt: { not: null, lte: now },
      slaBreachedAt: null,
      status: { in: ["open", "pending"] },
    },
    select: { id: true, workspaceId: true, slaDueAt: true },
    take: SWEEP_LIMIT,
  });
  for (const c of due) {
    const res = await prisma.conversation.updateMany({
      where: { id: c.id, slaBreachedAt: null },
      data: { slaBreachedAt: now },
    });
    if (res.count > 0) {
      publishInbox(c.workspaceId, {
        type: "conversation",
        conversationId: c.id,
        conversation: { id: c.id, slaBreached: true },
      });
      void emitWorkspaceEvent(c.workspaceId, "conversation.sla_breached", {
        conversationId: c.id,
        slaDueAt: c.slaDueAt?.toISOString() ?? null,
      });
    }
  }
}

async function sweepCallReminders(now: Date): Promise<void> {
  const due = await prisma.callReminder.findMany({
    where: { done: false, notifiedAt: null, at: { lte: now } },
    select: {
      id: true,
      workspaceId: true,
      contactName: true,
      phone: true,
      note: true,
      at: true,
    },
    take: SWEEP_LIMIT,
  });
  for (const r of due) {
    const res = await prisma.callReminder.updateMany({
      where: { id: r.id, notifiedAt: null },
      data: { notifiedAt: now },
    });
    if (res.count > 0) {
      publishInbox(r.workspaceId, {
        type: "call-reminder",
        reminder: {
          id: r.id,
          contactName: r.contactName,
          phone: r.phone,
          note: r.note,
          at: r.at.toISOString(),
        },
      });
    }
  }
}

async function sweepAutoClose(now: Date): Promise<void> {
  const workspaces = await prisma.workspace.findMany({
    where: { autoCloseMinutes: { gt: 0 } },
    select: { id: true, autoCloseMinutes: true },
  });
  for (const ws of workspaces) {
    const cutoff = new Date(now.getTime() - ws.autoCloseMinutes * 60_000);
    const idle = await prisma.conversation.findMany({
      where: {
        workspaceId: ws.id,
        status: { in: ["open", "pending"] },
        lastMessageAt: { lt: cutoff },
        // A live snooze means "remind me later" — don't close underneath it.
        OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }],
      },
      select: { id: true },
      take: SWEEP_LIMIT,
    });
    if (idle.length === 0) continue;
    await prisma.conversation.updateMany({
      where: { id: { in: idle.map((c) => c.id) }, status: { in: ["open", "pending"] } },
      data: { status: "resolved" },
    });
    for (const c of idle) {
      publishInbox(ws.id, {
        type: "conversation",
        conversationId: c.id,
        conversation: { id: c.id, status: "resolved", autoClosed: true },
      });
      void emitWorkspaceEvent(ws.id, "conversation.status_changed", {
        conversationId: c.id,
        status: "resolved",
        previousStatus: "open",
        autoClosed: true,
      });
    }
  }
}

/** One scheduler tick — all sweeps, each failure-isolated. */
export async function runSchedulerTick(now: Date = new Date()): Promise<void> {
  const sweeps = [sweepSnoozed, sweepSlaBreaches, sweepCallReminders, sweepAutoClose];
  for (const sweep of sweeps) {
    try {
      await sweep(now);
    } catch (err) {
      console.error("[scheduler] sweep failed:", err);
    }
  }
}

/* ---------- BullMQ plumbing ---------- */

let schedulerQueue: Queue | null = null;
let schedulerWorker: Worker | null = null;

function getSchedulerQueue(): Queue {
  if (!schedulerQueue) {
    schedulerQueue = new Queue(SCHEDULER_QUEUE, { connection: redis() });
  }
  return schedulerQueue;
}

async function processSchedulerJob(job: Job): Promise<void> {
  if (job.name === "tick") {
    await runSchedulerTick();
    return;
  }
  if (job.name === "auto-reply") {
    await handleDelayedAutoReply(job.data as DelayedAutoReply);
    return;
  }
}

/** Start the repeatable tick + delayed-job worker. No-op in tests. */
export async function startSchedulerWorker(): Promise<void> {
  if (schedulerWorker || isTest) return;
  const queue = getSchedulerQueue();
  await queue.upsertJobScheduler(
    "tick",
    { every: TICK_MS },
    { name: "tick", data: {} },
  );
  schedulerWorker = new Worker(SCHEDULER_QUEUE, processSchedulerJob, {
    connection: redis(),
  });
  schedulerWorker.on("failed", (job, err) => {
    console.error(`[scheduler] job ${job?.name ?? job?.id ?? "?"} failed:`, err.message);
  });
}

export async function closeScheduler(): Promise<void> {
  await schedulerWorker?.close();
  await schedulerQueue?.close();
  schedulerWorker = null;
  schedulerQueue = null;
}
