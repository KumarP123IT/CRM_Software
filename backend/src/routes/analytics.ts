import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const overviewQuery = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

/**
 * GET /analytics/overview — workspace-wide metrics for the Analytics page.
 * Range-scoped where noted; entity totals are all-time.
 */
export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get(
    "/overview",
    { preHandler: requirePermission("analytics.view") },
    async (request) => {
      const q = overviewQuery.parse(request.query);
      const ws = request.workspaceId;
      const since = new Date(Date.now() - q.days * DAY_MS);

      const [
        contacts,
        conversations,
        leads,
        wonValue,
        messagesIn,
        messagesOut,
        byStatus,
        byStage,
        channelRows,
        agentRows,
        dailyRows,
      ] = await Promise.all([
        prisma.contact.count({ where: { workspaceId: ws } }),
        prisma.conversation.count({ where: { workspaceId: ws } }),
        prisma.lead.count({ where: { workspaceId: ws } }),
        prisma.lead.aggregate({
          where: { workspaceId: ws, stage: "won" },
          _sum: { value: true },
        }),
        prisma.message.count({ where: { workspaceId: ws, direction: "in", sentAt: { gte: since } } }),
        prisma.message.count({ where: { workspaceId: ws, direction: "out", sentAt: { gte: since } } }),
        prisma.conversation.groupBy({
          by: ["status"],
          where: { workspaceId: ws },
          _count: { _all: true },
        }),
        prisma.lead.groupBy({
          by: ["stage"],
          where: { workspaceId: ws },
          _count: { _all: true },
          _sum: { value: true },
        }),
        prisma.$queryRaw<{ channel: string; conversations: bigint; messages: bigint }[]>`
          SELECT cv.channel AS channel,
                 count(DISTINCT cv.id)::bigint AS conversations,
                 count(DISTINCT m.id)::bigint AS messages
          FROM "Conversation" cv
          LEFT JOIN "Message" m ON m."conversationId" = cv.id AND m."sentAt" >= ${since}
          WHERE cv."workspaceId" = ${ws}
          GROUP BY cv.channel
          ORDER BY messages DESC
        `,
        prisma.message.groupBy({
          by: ["authorId"],
          where: { workspaceId: ws, direction: "out", sentAt: { gte: since }, authorId: { not: null } },
          _count: { _all: true },
          orderBy: { _count: { authorId: "desc" } },
          take: 5,
        }),
        prisma.$queryRaw<{ day: string; incoming: bigint; outgoing: bigint }[]>`
          SELECT to_char(date_trunc('day', "sentAt"), 'YYYY-MM-DD') AS day,
                 count(*) FILTER (WHERE direction = 'in')::bigint AS incoming,
                 count(*) FILTER (WHERE direction = 'out')::bigint AS outgoing
          FROM "Message"
          WHERE "workspaceId" = ${ws} AND "sentAt" >= ${since}
          GROUP BY 1
          ORDER BY 1
        `,
      ]);

      const agentIds = agentRows.map((a) => a.authorId).filter((x): x is string => !!x);
      const agents = agentIds.length
        ? await prisma.user.findMany({
            where: { id: { in: agentIds } },
            select: { id: true, name: true },
          })
        : [];
      const agentName = new Map(agents.map((a) => [a.id, a.name]));

      return {
        days: q.days,
        totals: {
          contacts,
          conversations,
          leads,
          wonValue: Number(wonValue._sum.value ?? 0),
          messagesIn,
          messagesOut,
        },
        conversationsByStatus: byStatus.map((s) => ({
          status: s.status,
          count: s._count._all,
        })),
        leadsByStage: byStage.map((s) => ({
          stage: s.stage,
          count: s._count._all,
          value: Number(s._sum.value ?? 0),
        })),
        channelBreakdown: channelRows.map((c) => ({
          channel: c.channel,
          conversations: Number(c.conversations),
          messages: Number(c.messages),
        })),
        topAgents: agentRows.map((a) => ({
          userId: a.authorId!,
          name: agentName.get(a.authorId!) ?? "Agent",
          replies: a._count._all,
        })),
        messagesByDay: dailyRows.map((d) => ({
          date: d.day,
          incoming: Number(d.incoming),
          outgoing: Number(d.outgoing),
        })),
      };
    },
  );
}
