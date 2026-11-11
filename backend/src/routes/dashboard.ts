import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import {
  requireAuth,
  resolveWorkspace,
} from "../plugins/auth.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Last `days` daily buckets ending today (UTC), oldest first. */
function dayBuckets(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    out.push(dayKey(new Date(today.getTime() - i * DAY_MS)));
  }
  return out;
}

async function dailyMessageCounts(
  workspaceId: string,
  since: Date,
): Promise<Map<string, { incoming: number; outgoing: number }>> {
  const rows = await prisma.$queryRaw<{ day: string; direction: string; n: bigint }[]>`
    SELECT to_char(date_trunc('day', "sentAt"), 'YYYY-MM-DD') AS day, direction, count(*)::bigint AS n
    FROM "Message"
    WHERE "workspaceId" = ${workspaceId} AND "sentAt" >= ${since}
    GROUP BY 1, 2
  `;
  const map = new Map<string, { incoming: number; outgoing: number }>();
  for (const r of rows) {
    const cur = map.get(r.day) ?? { incoming: 0, outgoing: 0 };
    if (r.direction === "in") cur.incoming = Number(r.n);
    else cur.outgoing = Number(r.n);
    map.set(r.day, cur);
  }
  return map;
}

function trendFrom(map: Map<string, number>, buckets: string[]): number[] {
  return buckets.map((b) => map.get(b) ?? 0);
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Average minutes from an inbound message to the next outbound reply (sampled). */
async function avgResponseMinutes(
  workspaceId: string,
  range?: { gte: Date; lt?: Date },
): Promise<number | null> {
  const rows = await prisma.message.findMany({
    where: {
      workspaceId,
      direction: { in: ["in", "out"] },
      ...(range ? { sentAt: { gte: range.gte, ...(range.lt ? { lt: range.lt } : {}) } } : {}),
    },
    orderBy: { sentAt: "asc" },
    select: { conversationId: true, direction: true, sentAt: true },
    take: 5000,
  });
  const lastInbound = new Map<string, Date>();
  const diffs: number[] = [];
  for (const m of rows) {
    if (m.direction === "in") {
      lastInbound.set(m.conversationId, m.sentAt);
    } else {
      const inbound = lastInbound.get(m.conversationId);
      if (inbound) {
        const mins = (m.sentAt.getTime() - inbound.getTime()) / 60000;
        if (mins >= 0 && mins < 24 * 60) diffs.push(mins);
        lastInbound.delete(m.conversationId);
      }
    }
  }
  if (diffs.length === 0) return null;
  return Math.round((diffs.reduce((a, b) => a + b, 0) / diffs.length) * 10) / 10;
}

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /dashboard/stats — headline metrics with 7-day trends.
  fastify.get("/stats", async (request) => {
    const ws = request.workspaceId;
    const now = Date.now();
    const d7 = new Date(now - 7 * DAY_MS);
    const d14 = new Date(now - 14 * DAY_MS);
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);

    const convBuckets = dayBuckets(7);
    const msgDaily = await dailyMessageCounts(ws, d14);
    const convDailyRaw = await prisma.conversation.findMany({
      where: { workspaceId: ws, createdAt: { gte: d14 } },
      select: { createdAt: true },
      take: 20000,
    });
    const convDaily = new Map<string, number>();
    for (const c of convDailyRaw) {
      const k = dayKey(c.createdAt);
      convDaily.set(k, (convDaily.get(k) ?? 0) + 1);
    }
    const leadDailyRaw = await prisma.lead.findMany({
      where: { workspaceId: ws, createdAt: { gte: d14 } },
      select: { createdAt: true },
      take: 20000,
    });
    const leadDaily = new Map<string, number>();
    for (const l of leadDailyRaw) {
      const k = dayKey(l.createdAt);
      leadDaily.set(k, (leadDaily.get(k) ?? 0) + 1);
    }

    const weekMessages = (from: Date, to: Date) =>
      prisma.message.count({ where: { workspaceId: ws, sentAt: { gte: from, lt: to } } });
    const weekConvs = (from: Date, to: Date) =>
      prisma.conversation.count({ where: { workspaceId: ws, createdAt: { gte: from, lt: to } } });
    const weekLeads = (from: Date, to: Date) =>
      prisma.lead.count({ where: { workspaceId: ws, createdAt: { gte: from, lt: to } } });

    // Per-day average response time for the trend (7 queries, bounded sample each).
    const respTrend: (number | null)[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart.getTime() - i * DAY_MS);
      const dayEnd = new Date(dayStart.getTime() + DAY_MS);
      respTrend.push(await avgResponseMinutes(ws, { gte: dayStart, lt: dayEnd }));
    }
    const respTrendFilled = respTrend.map((v) => v ?? 0);

    const [
      openConversations,
      convsThisWeek,
      convsLastWeek,
      avgResp,
      avgRespPrev,
      newLeadsWeek,
      newLeadsPrev,
      messagesToday,
      messagesYesterday,
    ] = await Promise.all([
      prisma.conversation.count({ where: { workspaceId: ws, status: { in: ["open", "pending"] } } }),
      weekConvs(d7, new Date(now + 1)),
      weekConvs(d14, d7),
      avgResponseMinutes(ws, { gte: d7 }),
      avgResponseMinutes(ws, { gte: d14, lt: d7 }),
      weekLeads(d7, new Date(now + 1)),
      weekLeads(d14, d7),
      weekMessages(todayStart, new Date(now + 1)),
      weekMessages(yesterdayStart, todayStart),
    ]);

    const msgTrend = convBuckets.map(
      (b) => (msgDaily.get(b)?.incoming ?? 0) + (msgDaily.get(b)?.outgoing ?? 0),
    );

    return {
      openConversations: {
        value: openConversations,
        trend: trendFrom(convDaily, convBuckets),
        delta: pctDelta(convsThisWeek, convsLastWeek),
      },
      avgResponseMins: {
        value: avgResp ?? 0,
        trend: respTrendFilled,
        delta: pctDelta(avgResp ?? 0, avgRespPrev ?? 0),
      },
      newLeads: {
        value: newLeadsWeek,
        trend: trendFrom(leadDaily, convBuckets),
        delta: pctDelta(newLeadsWeek, newLeadsPrev),
      },
      messagesToday: {
        value: messagesToday,
        trend: msgTrend,
        delta: pctDelta(messagesToday, messagesYesterday),
      },
    };
  });

  // GET /dashboard/activity — unified recent activity feed.
  fastify.get("/activity", async (request) => {
    const ws = request.workspaceId;
    const since = new Date(Date.now() - 7 * DAY_MS);

    const [messages, leads, broadcasts, contacts, assignments] = await Promise.all([
      prisma.message.findMany({
        where: { workspaceId: ws, direction: "out", sentAt: { gte: since } },
        include: {
          author: { select: { name: true } },
          conversation: { select: { contact: { select: { name: true, phone: true } } } },
        },
        orderBy: { sentAt: "desc" },
        take: 10,
      }),
      prisma.lead.findMany({
        where: { workspaceId: ws, createdAt: { gte: since } },
        include: { owner: { select: { name: true } }, contact: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.broadcast.findMany({
        where: { workspaceId: ws, status: { in: ["sent", "sending"] }, updatedAt: { gte: since } },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.contact.findMany({
        where: { workspaceId: ws, createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, name: true, phone: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
        where: { workspaceId: ws, action: "conversation.assigned", createdAt: { gte: since } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const broadcastAuthorIds = [...new Set(broadcasts.map((b) => b.createdById).filter((x): x is string => !!x))];
    const broadcastAuthors = broadcastAuthorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: broadcastAuthorIds } },
          select: { id: true, name: true },
        })
      : [];
    const authorName = new Map(broadcastAuthors.map((u) => [u.id, u.name]));

    const items = [
      ...messages.map((m) => ({
        id: `m-${m.id}`,
        kind: "message" as const,
        text: `replied to ${m.conversation.contact.name ?? m.conversation.contact.phone}`,
        at: m.sentAt.toISOString(),
        actorName: m.author?.name ?? "Agent",
      })),
      ...leads.map((l) => ({
        id: `l-${l.id}`,
        kind: "lead" as const,
        text: `created lead “${l.title}”`,
        at: l.createdAt.toISOString(),
        actorName: l.owner.name,
      })),
      ...broadcasts.map((b) => ({
        id: `b-${b.id}`,
        kind: "broadcast" as const,
        text: `sent broadcast “${b.name}” to ${b.sent} contacts`,
        at: b.updatedAt.toISOString(),
        actorName: (b.createdById ? authorName.get(b.createdById) : undefined) ?? "System",
      })),
      ...contacts.map((c) => ({
        id: `c-${c.id}`,
        kind: "contact" as const,
        text: `added contact ${c.name ?? c.phone}`,
        at: c.createdAt.toISOString(),
        actorName: "System",
      })),
      ...assignments.map((a) => ({
        id: `a-${a.id}`,
        kind: "assignment" as const,
        text: "assigned a conversation",
        at: a.createdAt.toISOString(),
        actorName: a.user?.name ?? "System",
      })),
    ]
      .sort((x, y) => y.at.localeCompare(x.at))
      .slice(0, 20);

    return items;
  });

  // GET /dashboard/call-reminders — upcoming + overdue undone reminders.
  fastify.get("/call-reminders", async (request) => {
    const rows = await prisma.callReminder.findMany({
      where: { workspaceId: request.workspaceId, done: false },
      orderBy: { at: "asc" },
      take: 50,
    });
    return rows.map((r) => ({
      id: r.id,
      contactName: r.contactName,
      phone: r.phone,
      at: r.at.toISOString(),
      note: r.note,
    }));
  });

  // GET /dashboard/onboarding — setup checklist derived from real state.
  fastify.get("/onboarding", async (request) => {
    const ws = request.workspaceId;
    const [channel, imported, template, members, broadcast] = await Promise.all([
      prisma.channelAccount.count({ where: { workspaceId: ws, status: "connected" } }),
      prisma.contact.count({ where: { workspaceId: ws, source: "import" } }),
      prisma.template.count({ where: { workspaceId: ws, status: "approved" } }),
      prisma.membership.count({ where: { workspaceId: ws } }),
      prisma.broadcast.count({
        where: { workspaceId: ws, status: { in: ["sent", "sending", "scheduled"] } },
      }),
    ]);
    return [
      { id: "connect", done: channel > 0 },
      { id: "import", done: imported > 0 },
      { id: "template", done: template > 0 },
      { id: "invite", done: members > 1 },
      { id: "broadcast", done: broadcast > 0 },
    ];
  });
}
