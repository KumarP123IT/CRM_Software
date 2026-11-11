import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { audit } from "../lib/audit.js";
import { badRequest, notFound } from "../lib/errors.js";
import { encryptSecret, decryptSecret } from "../lib/crypto.js";
import {
  requireAuth,
  resolveWorkspace,
  requirePermission,
} from "../plugins/auth.js";

const OPENAI_BASE = "https://api.openai.com/v1";
const SUGGEST_MODEL = "gpt-4o-mini";

async function openAiFetch(path: string, apiKey: string, init?: RequestInit) {
  const res = await fetch(`${OPENAI_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(20_000),
  });
  return res;
}

async function workspaceKey(workspaceId: string): Promise<string | null> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { openaiKeyEncrypted: true },
  });
  if (!ws?.openaiKeyEncrypted) return null;
  try {
    return decryptSecret(ws.openaiKeyEncrypted);
  } catch {
    return null;
  }
}

export async function integrationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request, reply) => {
    await requireAuth(request, reply);
    await resolveWorkspace(request, reply);
  });

  // GET /integrations/openai — masked key status.
  fastify.get("/openai", async (request) => {
    const ws = await prisma.workspace.findUnique({
      where: { id: request.workspaceId },
      select: { openaiKeyMasked: true },
    });
    return { configured: !!ws?.openaiKeyMasked, masked: ws?.openaiKeyMasked ?? null };
  });

  // POST /integrations/openai — store an encrypted key.
  fastify.post(
    "/openai",
    { preHandler: requirePermission("ai.configure") },
    async (request) => {
      const { key } = z.object({ key: z.string().trim().min(10).max(200) }).parse(request.body);
      if (!key.startsWith("sk-")) {
        throw badRequest("invalid_key", "OpenAI keys start with sk-");
      }
      const masked = `sk-...${key.slice(-4)}`;
      await prisma.workspace.update({
        where: { id: request.workspaceId },
        data: { openaiKeyEncrypted: encryptSecret(key), openaiKeyMasked: masked },
      });
      await audit(prisma, {
        workspaceId: request.workspaceId,
        userId: request.userId,
        action: "integration.openai_saved",
        targetType: "workspace",
        targetId: request.workspaceId,
        ip: request.ip,
      });
      return { masked };
    },
  );

  // DELETE /integrations/openai — remove the key.
  fastify.delete(
    "/openai",
    { preHandler: requirePermission("ai.configure") },
    async (request, reply) => {
      await prisma.workspace.update({
        where: { id: request.workspaceId },
        data: { openaiKeyEncrypted: null, openaiKeyMasked: null },
      });
      return reply.status(204).send();
    },
  );

  // POST /integrations/openai/test — verify the key against OpenAI.
  fastify.post("/openai/test", async (request) => {
    const key = await workspaceKey(request.workspaceId);
    if (!key) throw badRequest("ai_not_configured", "No OpenAI key configured");
    try {
      const res = await openAiFetch("/models", key);
      if (!res.ok) {
        return { ok: false, error: `OpenAI responded ${res.status}` };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
    }
  });

  // POST /integrations/ai/suggest — suggest replies for a conversation thread.
  fastify.post(
    "/ai/suggest",
    { preHandler: requirePermission("conversation.reply") },
    async (request, reply) => {
      const { conversationId } = z
        .object({ conversationId: z.string().min(1) })
        .parse(request.body);
      const key = await workspaceKey(request.workspaceId);
      if (!key) throw badRequest("ai_not_configured", "No OpenAI key configured");

      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, workspaceId: request.workspaceId },
        include: { contact: { select: { name: true, phone: true } } },
      });
      if (!conversation) throw notFound("Conversation not found");

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { sentAt: "desc" },
        take: 20,
        select: { direction: true, body: true, kind: true },
      });
      const transcript = messages
        .reverse()
        .map((m) => `${m.direction === "in" ? "Customer" : "Agent"}: ${m.body}`)
        .join("\n")
        .slice(-6000);

      try {
        const res = await openAiFetch("/chat/completions", key, {
          method: "POST",
          body: JSON.stringify({
            model: SUGGEST_MODEL,
            temperature: 0.7,
            max_tokens: 300,
            messages: [
              {
                role: "system",
                content:
                  "You write short customer-support replies for a business chat. " +
                  "Suggest 3 distinct replies to the customer's latest message. " +
                  "Reply with JSON only: {\"suggestions\": [\"...\", \"...\", \"...\"]}. " +
                  "Keep each under 60 words, friendly, no markdown.",
              },
              {
                role: "user",
                content: `Customer: ${conversation.contact.name ?? conversation.contact.phone}\n\n${transcript}`,
              },
            ],
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content ?? "";
        const parsed = JSON.parse(content) as { suggestions?: unknown };
        const suggestions = Array.isArray(parsed.suggestions)
          ? parsed.suggestions.filter((s): s is string => typeof s === "string").slice(0, 3)
          : [];
        if (!suggestions.length) throw new Error("No suggestions returned");
        return { suggestions };
      } catch (err) {
        return reply.status(502).send({
          code: "ai_error",
          message: err instanceof Error ? err.message : "AI request failed",
        });
      }
    },
  );
}
