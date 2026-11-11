import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import {
  conversationInclude,
  QUICK_REPLIES,
  sendReply,
  toApiConversation,
  toApiMessage,
} from "../lib/inbox.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  search: z.string().trim().max(200).optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["open", "pending", "resolved"]).optional(),
  tag: z.string().trim().max(60).optional(),
  channel: z.string().trim().max(30).optional(),
  tab: z.enum(["mine", "unassigned", "all"]).optional(),
  viewerId: z.string().optional(),
});

const sendSchema = z.object({
  kind: z.enum(["text", "image", "document", "voice", "template", "interactive", "note"]),
  body: z.string().max(8000).default(""),
  replyToId: z.string().optional(),
  fileName: z.string().trim().max(300).optional(),
  templateId: z.string().optional(),
});

const assignSchema = z.object({ assigneeId: z.string().nullable() });
const statusSchema = z.object({ status: z.enum(["open", "pending", "resolved"]) });
const snoozeSchema = z.object({ until: z.string().datetime({ offset: true }) });
const transferSchema = z.object({ teamId: z.string().min(1) });

export async function conversationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /conversations — paginated inbox list
  fastify.get("/", async (request) => {
    const q = listQuerySchema.parse(request.query);
    const ws = request.workspaceId;

    const where: Prisma.ConversationWhereInput = { workspaceId: ws };
    if (q.tab === "mine") {
      where.assigneeId = q.viewerId ?? request.userId;
    } else if (q.tab === "unassigned") {
      where.assigneeId = null;
    } else if (q.assigneeId) {
      where.assigneeId = q.assigneeId;
    }
    if (q.status) where.status = q.status;
    if (q.channel) where.channel = q.channel;
    if (q.search) {
      where.OR = [
        { lastMessage: { contains: q.search, mode: "insensitive" } },
        { contact: { name: { contains: q.search, mode: "insensitive" } } },
        { contact: { phone: { contains: q.search.replace(/\s/g, "") } } },
      ];
    }
    if (q.tag) {
      where.contact = { tags: { some: { tag: { name: q.tag } } } };
    }

    const [total, rows] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.findMany({
        where,
        include: conversationInclude,
        orderBy: { lastMessageAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items: rows.map(toApiConversation), total, page: q.page, pageSize: q.pageSize };
  });

  // GET /conversations/quick-replies — must be registered before /:id.
  fastify.get("/quick-replies", async () => QUICK_REPLIES);

  // GET /conversations/:id
  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const conv = await prisma.conversation.findFirst({
      where: { id, workspaceId: request.workspaceId },
      include: conversationInclude,
    });
    if (!conv) throw notFound("Conversation not found");
    return toApiConversation(conv);
  });

  // GET /conversations/:id/messages — oldest first, capped.
  fastify.get("/:id/messages", async (request) => {
    const { id } = request.params as { id: string };
    const conv = await prisma.conversation.findFirst({
      where: { id, workspaceId: request.workspaceId },
      select: { id: true },
    });
    if (!conv) throw notFound("Conversation not found");
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { sentAt: "asc" },
      take: 300,
    });
    return messages.map(toApiMessage);
  });

  // POST /conversations/:id/messages — agent reply / note
  fastify.post(
    "/:id/messages",
    { preHandler: requirePermission("conversation.reply") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = sendSchema.parse(request.body);
      const message = await sendReply(request.workspaceId, id, input, request.userId);
      return reply.status(201).send(toApiMessage(message));
    },
  );

  // POST /conversations/:id/assign
  fastify.post(
    "/:id/assign",
    { preHandler: requirePermission("conversation.assign") },
    async (request) => {
      const { id } = request.params as { id: string };
      const { assigneeId } = assignSchema.parse(request.body);
      const conv = await prisma.conversation.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!conv) throw notFound("Conversation not found");
      if (assigneeId) {
        const member = await prisma.membership.findUnique({
          where: { workspaceId_userId: { workspaceId: request.workspaceId, userId: assigneeId } },
          select: { userId: true },
        });
        if (!member) throw badRequest("invalid_assignee", "User is not a workspace member");
      }
      const updated = await prisma.conversation.update({
        where: { id },
        data: { assigneeId },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "conversation.assigned",
        targetType: "conversation",
        targetId: id,
        meta: { assigneeId },
        ip: request.ip,
      });
      const full = await prisma.conversation.findUniqueOrThrow({
        where: { id: updated.id },
        include: conversationInclude,
      });
      return toApiConversation(full);
    },
  );

  // POST /conversations/:id/status
  fastify.post("/:id/status", async (request) => {
    const { id } = request.params as { id: string };
    const { status } = statusSchema.parse(request.body);
    const conv = await prisma.conversation.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!conv) throw notFound("Conversation not found");
    await prisma.conversation.update({ where: { id }, data: { status } });
    const full = await prisma.conversation.findUniqueOrThrow({
      where: { id },
      include: conversationInclude,
    });
    return toApiConversation(full);
  });

  // POST /conversations/:id/snooze
  fastify.post("/:id/snooze", async (request) => {
    const { id } = request.params as { id: string };
    const { until } = snoozeSchema.parse(request.body);
    const conv = await prisma.conversation.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!conv) throw notFound("Conversation not found");
    await prisma.conversation.update({ where: { id }, data: { snoozedUntil: new Date(until) } });
    const full = await prisma.conversation.findUniqueOrThrow({
      where: { id },
      include: conversationInclude,
    });
    return toApiConversation(full);
  });

  // POST /conversations/:id/transfer
  fastify.post("/:id/transfer", async (request) => {
    const { id } = request.params as { id: string };
    const { teamId } = transferSchema.parse(request.body);
    const conv = await prisma.conversation.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!conv) throw notFound("Conversation not found");
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId: request.workspaceId },
      select: { id: true },
    });
    if (!team) throw notFound("Team not found");
    await prisma.conversation.update({ where: { id }, data: { teamId } });
    const full = await prisma.conversation.findUniqueOrThrow({
      where: { id },
      include: conversationInclude,
    });
    return toApiConversation(full);
  });

  // POST /conversations/:id/read — clear unread counter.
  fastify.post("/:id/read", async (request) => {
    const { id } = request.params as { id: string };
    const conv = await prisma.conversation.findFirst({
      where: { id, workspaceId: request.workspaceId },
      select: { id: true },
    });
    if (!conv) throw notFound("Conversation not found");
    await prisma.conversation.update({ where: { id }, data: { unread: 0 } });
    const full = await prisma.conversation.findUniqueOrThrow({
      where: { id },
      include: conversationInclude,
    });
    return toApiConversation(full);
  });
}
