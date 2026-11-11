import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const leadInclude = {
  contact: { select: { name: true, phone: true } },
  owner: { select: { name: true } },
} satisfies Prisma.LeadInclude;

type LeadWithRefs = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;

function toApiLead(l: LeadWithRefs) {
  return {
    id: l.id,
    contactId: l.contactId,
    contactName: l.contact.name ?? l.contact.phone,
    phone: l.contact.phone,
    title: l.title,
    value: Number(l.value),
    stage: l.stage,
    ownerId: l.ownerId,
    ownerName: l.owner.name,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

const STAGES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  search: z.string().trim().max(200).optional(),
  stage: z.enum(STAGES).optional(),
  ownerId: z.string().optional(),
});

const createSchema = z.object({
  contactId: z.string().min(1),
  title: z.string().trim().min(1).max(300),
  value: z.number().min(0).max(999_999_999).optional(),
  stage: z.enum(STAGES).optional(),
  ownerId: z.string().optional(),
});

const updateSchema = createSchema
  .partial()
  .omit({ contactId: true })
  .extend({ contactId: z.string().min(1).optional() });

async function assertMember(workspaceId: string, userId: string) {
  const member = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { userId: true },
  });
  if (!member) throw badRequest("invalid_owner", "User is not a workspace member");
}

export async function leadRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  fastify.get("/", async (request) => {
    const q = listQuerySchema.parse(request.query);
    const where: Prisma.LeadWhereInput = { workspaceId: request.workspaceId };
    if (q.stage) where.stage = q.stage;
    if (q.ownerId) where.ownerId = q.ownerId;
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { contact: { name: { contains: q.search, mode: "insensitive" } } },
        { contact: { phone: { contains: q.search.replace(/\s/g, "") } } },
      ];
    }
    const [total, rows] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        include: leadInclude,
        orderBy: { updatedAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items: rows.map(toApiLead), total, page: q.page, pageSize: q.pageSize };
  });

  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const lead = await prisma.lead.findFirst({
      where: { id, workspaceId: request.workspaceId },
      include: leadInclude,
    });
    if (!lead) throw notFound("Lead not found");
    return toApiLead(lead);
  });

  fastify.post(
    "/",
    { preHandler: requirePermission("lead.edit") },
    async (request, reply) => {
      const input = createSchema.parse(request.body);
      const ws = request.workspaceId;
      const contact = await prisma.contact.findFirst({
        where: { id: input.contactId, workspaceId: ws },
        select: { id: true },
      });
      if (!contact) throw notFound("Contact not found");
      const ownerId = input.ownerId ?? request.userId;
      await assertMember(ws, ownerId);

      const lead = await prisma.lead.create({
        data: {
          workspaceId: ws,
          contactId: contact.id,
          title: input.title,
          value: input.value ?? 0,
          ...(input.stage ? { stage: input.stage } : {}),
          ownerId,
        },
        include: leadInclude,
      });
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: "lead.created",
        targetType: "lead",
        targetId: lead.id,
        ip: request.ip,
      });
      return reply.status(201).send(toApiLead(lead));
    },
  );

  fastify.patch(
    "/:id",
    { preHandler: requirePermission("lead.edit") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = updateSchema.parse(request.body);
      const existing = await prisma.lead.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Lead not found");

      if (input.contactId) {
        const contact = await prisma.contact.findFirst({
          where: { id: input.contactId, workspaceId: request.workspaceId },
          select: { id: true },
        });
        if (!contact) throw notFound("Contact not found");
      }
      if (input.ownerId) await assertMember(request.workspaceId, input.ownerId);

      const lead = await prisma.lead.update({
        where: { id },
        data: {
          ...(input.contactId ? { contactId: input.contactId } : {}),
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.value !== undefined ? { value: input.value } : {}),
          ...(input.stage !== undefined ? { stage: input.stage } : {}),
          ...(input.ownerId !== undefined ? { ownerId: input.ownerId } : {}),
        },
        include: leadInclude,
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "lead.updated",
        targetType: "lead",
        targetId: id,
        meta: input.stage ? { stage: input.stage } : undefined,
        ip: request.ip,
      });
      return toApiLead(lead);
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: requirePermission("lead.edit") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.lead.findFirst({
        where: { id, workspaceId: request.workspaceId },
        select: { id: true },
      });
      if (!existing) throw notFound("Lead not found");
      await prisma.lead.delete({ where: { id } });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "lead.deleted",
        targetType: "lead",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );
}
