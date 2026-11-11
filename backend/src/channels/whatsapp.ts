import { createHmac, timingSafeEqual } from "node:crypto";
import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { badRequest } from "../lib/errors.js";
import { randomToken } from "../lib/crypto.js";
import type {
  ChannelAdapter,
  DeliveryStatusEvent,
  InboundMessageEvent,
  OutboundPayload,
  ParsedWebhook,
  SendResult,
  TemplateSyncInput,
  TemplateSyncResult,
} from "./types.js";

const GRAPH = "https://graph.facebook.com/v21.0";

/**
 * WhatsApp Cloud API adapter. Connect implements the Embedded Signup code
 * exchange: the frontend SDK returns {code, phoneNumberId, businessAccountId}
 * which we trade for a long-lived access token, then enrich with phone
 * display info.
 */
const connectSchema = z.object({
  code: z.string().trim().min(1).max(2000),
  phoneNumberId: z.string().trim().min(1).max(100),
  businessAccountId: z.string().trim().max(100).optional(),
});

interface TokenResponse {
  access_token?: string;
  error?: { message?: string };
}

interface PhoneNumberResponse {
  display_phone_number?: string;
  verified_name?: string;
  quality_rating?: string;
  messaging_tier?: string; // nested under platform_type in some versions; tolerate absence
  error?: { message?: string };
}

async function graph<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${GRAPH}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => null)) as T & {
    error?: { message?: string };
  } | null;
  if (!res.ok) {
    throw badRequest(
      "whatsapp_error",
      data?.error?.message ?? `WhatsApp API error (${res.status})`,
    );
  }
  return data as T;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

export const whatsappAdapter: ChannelAdapter = {
  type: "whatsapp",

  async connect(input) {
    if (!config.WHATSAPP_APP_ID || !config.WHATSAPP_APP_SECRET) {
      throw badRequest(
        "whatsapp_not_configured",
        "WhatsApp Cloud API is not configured on this server",
      );
    }
    const { code, phoneNumberId, businessAccountId } = connectSchema.parse(input);
    const token = await graph<TokenResponse>(
      `/oauth/access_token?client_id=${encodeURIComponent(config.WHATSAPP_APP_ID)}` +
        `&client_secret=${encodeURIComponent(config.WHATSAPP_APP_SECRET)}` +
        `&code=${encodeURIComponent(code)}`,
      { method: "GET" },
    );
    const accessToken = token.access_token;
    if (!accessToken) {
      throw badRequest("whatsapp_error", "Code exchange did not return an access token");
    }

    // Enrich with display info — best effort, connect still succeeds without it.
    let phone: PhoneNumberResponse | null = null;
    try {
      phone = await graph<PhoneNumberResponse>(
        `/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`,
        { headers: { authorization: `Bearer ${accessToken}` } },
      );
    } catch {
      phone = null;
    }

    return {
      credentials: {
        accessToken,
        phoneNumberId,
        ...(businessAccountId ? { businessAccountId } : {}),
        appSecret: config.WHATSAPP_APP_SECRET,
        verifyToken: randomToken(24),
      },
      ...(phone?.display_phone_number ? { phoneNumber: phone.display_phone_number } : {}),
      ...(phone?.verified_name ? { displayName: phone.verified_name } : {}),
      ...(phone?.quality_rating ? { qualityRating: phone.quality_rating } : {}),
      status: "connected",
    };
  },

  async send(account, credentials, to, msg: OutboundPayload): Promise<SendResult> {
    const accessToken = credentials["accessToken"];
    const pnid = str(credentials["phoneNumberId"]);
    if (typeof accessToken !== "string" || !pnid) {
      throw badRequest("bad_credentials", "Missing WhatsApp credentials");
    }
    const payload =
      msg.kind === "template" && msg.templateName
        ? {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: { name: msg.templateName, language: { code: "en" } },
          }
        : {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: msg.body, preview_url: false },
          };
    const res = await fetch(`${GRAPH}/${pnid}/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => null)) as {
      messages?: { id?: string }[];
      error?: { message?: string };
    } | null;
    if (!res.ok) {
      throw badRequest(
        "whatsapp_send_failed",
        data?.error?.message ?? `WhatsApp send failed (${res.status})`,
      );
    }
    return { ...(data?.messages?.[0]?.id ? { providerMessageId: data.messages[0].id } : {}) };
  },

  async submitTemplate(
    _account,
    credentials,
    input: TemplateSyncInput,
  ): Promise<TemplateSyncResult> {
    const accessToken = credentials["accessToken"];
    const wabaId = str(credentials["businessAccountId"]);
    if (typeof accessToken !== "string" || !wabaId) {
      throw badRequest(
        "whatsapp_not_configured",
        "WhatsApp account is missing a business account id — reconnect the inbox",
      );
    }

    const category =
      input.category === "Marketing"
        ? "MARKETING"
        : input.category === "Authentication"
          ? "AUTHENTICATION"
          : "UTILITY";

    const components: Record<string, unknown>[] = [];
    if (input.headerMedia) {
      components.push({
        type: "HEADER",
        format: "IMAGE",
        example: { header_handle: [input.headerMedia] },
      });
    }
    components.push({ type: "BODY", text: input.body });

    const buttons = Array.isArray(input.buttons) ? input.buttons : [];
    const quickReplies = buttons
      .map((b) => (b as { text?: unknown }).text)
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .slice(0, 3)
      .map((text) => ({ type: "QUICK_REPLY", text }));
    if (quickReplies.length) {
      components.push({ type: "BUTTONS", buttons: quickReplies });
    }

    const res = await fetch(`${GRAPH}/${wabaId}/message_templates`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: input.name,
        category,
        language: input.language || "en",
        components,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await res.json().catch(() => null)) as {
      id?: string;
      status?: string;
      error?: { message?: string };
    } | null;
    if (!res.ok) {
      throw badRequest(
        "whatsapp_template_error",
        data?.error?.message ?? `WhatsApp template submission failed (${res.status})`,
      );
    }
    const status = (data?.status ?? "PENDING").toLowerCase();
    return {
      ...(data?.id ? { providerTemplateId: data.id } : {}),
      status:
        status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending",
    };
  },

  verifyWebhook(request, _account, credentials) {
    const appSecret = credentials["appSecret"] ?? config.WHATSAPP_APP_SECRET;
    if (typeof appSecret !== "string" || !appSecret) return false;
    const signature = request.headers["x-hub-signature-256"];
    if (typeof signature !== "string" || !signature.startsWith("sha256=")) return false;
    const raw = (request as FastifyRequest & { rawBody?: Buffer }).rawBody;
    if (!raw) return false;
    const expected =
      "sha256=" + createHmac("sha256", appSecret).update(raw).digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  },

  parseWebhook(body): ParsedWebhook {
    const events: InboundMessageEvent[] = [];
    const statuses: DeliveryStatusEvent[] = [];
    const payload = body as {
      entry?: {
        changes?: {
          field?: string;
          value?: {
            messages?: {
              id?: string;
              from?: string;
              timestamp?: string;
              type?: string;
              text?: { body?: string };
              image?: { link?: string; caption?: string; mime_type?: string };
              document?: { link?: string; filename?: string; caption?: string };
              audio?: { link?: string };
              interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
            }[];
            statuses?: { id?: string; status?: string }[];
          };
        }[];
      }[];
    };
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== "messages") continue;
        const value = change.value ?? {};
        for (const m of value.messages ?? []) {
          if (!m.id || !m.from) continue;
          const kind =
            m.type === "image"
              ? ("image" as const)
              : m.type === "document"
                ? ("document" as const)
                : m.type === "audio" || m.type === "voice"
                  ? ("voice" as const)
                  : m.type === "interactive"
                    ? ("interactive" as const)
                    : ("text" as const);
          events.push({
            providerMessageId: m.id,
            senderId: m.from,
            text:
              m.text?.body ??
              m.image?.caption ??
              m.document?.caption ??
              m.interactive?.button_reply?.title ??
              m.interactive?.list_reply?.title ??
              "",
            kind,
            ...(m.image?.link ? { mediaUrl: m.image.link } : {}),
            ...(m.document?.link || m.document?.filename
              ? { mediaUrl: m.document.link, fileName: m.document.filename }
              : {}),
            ...(m.audio?.link ? { mediaUrl: m.audio.link } : {}),
            ...(m.timestamp ? { sentAt: new Date(Number(m.timestamp) * 1000).toISOString() } : {}),
          });
        }
        for (const s of value.statuses ?? []) {
          if (!s.id || !s.status) continue;
          if (["sent", "delivered", "read", "failed"].includes(s.status)) {
            statuses.push({
              providerMessageId: s.id,
              status: s.status as DeliveryStatusEvent["status"],
            });
          }
        }
      }
    }
    return { events, statuses };
  },

  async healthCheck(account, credentials) {
    const accessToken = credentials["accessToken"];
    const pnid = str(credentials["phoneNumberId"]);
    if (typeof accessToken !== "string" || !pnid) {
      return { ok: false, detail: "Missing credentials" };
    }
    try {
      await graph<PhoneNumberResponse>(
        `/${pnid}?fields=display_phone_number,verified_name`,
        { headers: { authorization: `Bearer ${accessToken}` } },
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, detail: err instanceof Error ? err.message : "WhatsApp unreachable" };
    }
  },
};
