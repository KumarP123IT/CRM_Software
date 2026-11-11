import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma, Template } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import { accountCredentials } from "../lib/inbox.js";
import { getAdapter } from "../channels/index.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

/* ---------- API shape (mirrors frontend Template contract) ---------- */

function toApiTemplate(t: Template) {
  return {
    id: t.id,
    name: t.name,
    category: t.category,
    language: t.language,
    status: t.status,
    body: t.body,
    headerMedia: t.headerMedia ?? undefined,
    buttons: Array.isArray(t.buttons) ? t.buttons : undefined,
    rejectionReason: t.rejectionReason ?? undefined,
    providerTemplateId: t.providerTemplateId ?? undefined,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

/* ---------- input schemas ---------- */

const buttonSchema = z.object({
  id: z.string().trim().max(60).optional(),
  text: z.string().trim().min(1).max(40),
});

const templateInput = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9_]+$/, "Template name may only contain lowercase letters, numbers and underscores"),
  category: z.enum(["Marketing", "Utility", "Authentication"]).default("Utility"),
  language: z.string().trim().min(2).max(20).default("en"),
  body: z.string().trim().min(1).max(1024),
  headerMedia: z.string().trim().max(2000).optional(),
  buttons: z.array(buttonSchema).max(10).optional(),
});

// No defaults here — partial() would otherwise inject language:"en" etc.
const templateUpdate = z.object({
  name: templateInput.shape.name.optional(),
  category: z.enum(["Marketing", "Utility", "Authentication"]).optional(),
  language: z.string().trim().min(2).max(20).optional(),
  body: z.string().trim().min(1).max(1024).optional(),
  headerMedia: z.string().trim().max(2000).optional(),
  buttons: z.array(buttonSchema).max(10).optional(),
});

const listQuerySchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected"]).optional(),
  search: z.string().trim().max(120).optional(),
});

const rejectSchema = z.object({ reason: z.string().trim().max(500).optional() });

/* ---------- routes ---------- */

export async function templateRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /templates — list, optionally filtered by status/search
  fastify.get("/", async (request) => {
    const q = listQuerySchema.parse(request.query);
    const where: Prisma.TemplateWhereInput = { workspaceId: request.workspaceId };
    if (q.status) where.status = q.status;
    if (q.search) where.name = { contains: q.search, mode: "insensitive" };
    const rows = await prisma.template.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 500,
    });
    return rows.map(toApiTemplate);
  });

  // POST /templates — create a draft
  fastify.post(
    "/",
    { preHandler: requirePermission("template.create") },
    async (request, reply) => {
      const input = templateInput.parse(request.body);
      const ws = request.workspaceId;
      const clash = await prisma.template.findUnique({
        where: {
          workspaceId_name_language: {
            workspaceId: ws,
            name: input.name,
            language: input.language,
          },
        },
      });
      if (clash) {
        throw badRequest("template_exists", "A template with this name and language already exists");
      }
      const template = await prisma.template.create({
        data: {
          workspaceId: ws,
          name: input.name,
          category: input.category,
          language: input.language,
          body: input.body,
          ...(input.headerMedia ? { headerMedia: input.headerMedia } : {}),
          ...(input.buttons ? { buttons: input.buttons } : {}),
        },
      });
      await audit(prisma, {
        workspaceId: ws,
        userId: request.userId,
        action: "template.created",
        targetType: "template",
        targetId: template.id,
        ip: request.ip,
      });
      return reply.status(201).send(toApiTemplate(template));
    },
  );

  // GET /templates/:id
  fastify.get("/:id", async (request) => {
    const { id } = request.params as { id: string };
    const template = await prisma.template.findFirst({
      where: { id, workspaceId: request.workspaceId },
    });
    if (!template) throw notFound("Template not found");
    return toApiTemplate(template);
  });

  // PATCH /templates/:id — editable while draft or rejected
  fastify.patch(
    "/:id",
    { preHandler: requirePermission("template.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const input = templateUpdate.parse(request.body);
      const existing = await prisma.template.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Template not found");
      if (existing.status === "pending" || existing.status === "approved") {
        throw badRequest("template_locked", `Cannot edit a ${existing.status} template`);
      }
      if (
        (input.name !== undefined && input.name !== existing.name) ||
        (input.language !== undefined && input.language !== existing.language)
      ) {
        const name = input.name ?? existing.name;
        const language = input.language ?? existing.language;
        const clash = await prisma.template.findUnique({
          where: {
            workspaceId_name_language: {
              workspaceId: request.workspaceId,
              name,
              language,
            },
          },
        });
        if (clash && clash.id !== id) {
          throw badRequest("template_exists", "A template with this name and language already exists");
        }
      }
      const template = await prisma.template.update({
        where: { id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.language !== undefined ? { language: input.language } : {}),
          ...(input.body !== undefined ? { body: input.body } : {}),
          ...(input.headerMedia !== undefined ? { headerMedia: input.headerMedia || null } : {}),
          ...(input.buttons !== undefined ? { buttons: input.buttons } : {}),
          // Editing a rejected template sends it back to draft.
          ...(existing.status === "rejected" ? { status: "draft" as const, rejectionReason: null } : {}),
        },
      });
      return toApiTemplate(template);
    },
  );

  // DELETE /templates/:id — blocked while broadcasts reference it
  fastify.delete(
    "/:id",
    { preHandler: requirePermission("template.create") },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.template.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Template not found");
      const used = await prisma.broadcast.count({ where: { templateId: id } });
      if (used > 0) {
        throw badRequest("template_in_use", "Template is used by one or more broadcasts");
      }
      await prisma.template.delete({ where: { id } });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "template.deleted",
        targetType: "template",
        targetId: id,
        ip: request.ip,
      });
      return reply.status(204).send();
    },
  );

  // POST /templates/:id/submit — draft|rejected → pending; syncs to WhatsApp when possible
  fastify.post(
    "/:id/submit",
    { preHandler: requirePermission("template.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.template.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Template not found");
      if (existing.status !== "draft" && existing.status !== "rejected") {
        throw badRequest("invalid_state", `Cannot submit a ${existing.status} template`);
      }

      // Prefer a connected WhatsApp account for provider-side approval.
      const account = await prisma.channelAccount.findFirst({
        where: { workspaceId: request.workspaceId, type: "whatsapp", status: "connected" },
        orderBy: { createdAt: "asc" },
      });

      let status: "pending" | "approved" | "rejected" = "pending";
      let rejectionReason: string | null = null;
      let providerTemplateId = existing.providerTemplateId;

      if (account) {
        const adapter = getAdapter(account.type);
        if (adapter.submitTemplate) {
          try {
            const result = await adapter.submitTemplate(
              account,
              accountCredentials(account),
              {
                name: existing.name,
                category: existing.category,
                language: existing.language,
                body: existing.body,
                ...(existing.headerMedia ? { headerMedia: existing.headerMedia } : {}),
                ...(Array.isArray(existing.buttons) ? { buttons: existing.buttons } : {}),
              },
            );
            status = result.status;
            providerTemplateId = result.providerTemplateId ?? providerTemplateId;
            rejectionReason = result.rejectionReason ?? null;
          } catch (err) {
            // Provider unreachable/misconfigured — keep local pending so the
            // template can still be approved manually.
            request.log.warn({ err }, "template provider sync failed");
          }
        }
      }

      const template = await prisma.template.update({
        where: { id },
        data: {
          status,
          rejectionReason,
          ...(providerTemplateId ? { providerTemplateId } : {}),
        },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "template.submitted",
        targetType: "template",
        targetId: id,
        ip: request.ip,
      });
      return toApiTemplate(template);
    },
  );

  // POST /templates/:id/approve — manual approval (pending → approved)
  fastify.post(
    "/:id/approve",
    { preHandler: requirePermission("template.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const existing = await prisma.template.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Template not found");
      if (existing.status !== "pending") {
        throw badRequest("invalid_state", `Cannot approve a ${existing.status} template`);
      }
      const template = await prisma.template.update({
        where: { id },
        data: { status: "approved", rejectionReason: null },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "template.approved",
        targetType: "template",
        targetId: id,
        ip: request.ip,
      });
      return toApiTemplate(template);
    },
  );

  // POST /templates/:id/reject — manual rejection (pending → rejected)
  fastify.post(
    "/:id/reject",
    { preHandler: requirePermission("template.create") },
    async (request) => {
      const { id } = request.params as { id: string };
      const { reason } = rejectSchema.parse(request.body ?? {});
      const existing = await prisma.template.findFirst({
        where: { id, workspaceId: request.workspaceId },
      });
      if (!existing) throw notFound("Template not found");
      if (existing.status !== "pending") {
        throw badRequest("invalid_state", `Cannot reject a ${existing.status} template`);
      }
      const template = await prisma.template.update({
        where: { id },
        data: { status: "rejected", rejectionReason: reason ?? null },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "template.rejected",
        targetType: "template",
        targetId: id,
        ip: request.ip,
      });
      return toApiTemplate(template);
    },
  );
}
