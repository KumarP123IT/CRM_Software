import { z } from "zod";
import { randomToken } from "../lib/crypto.js";
import type {
  ChannelAdapter,
  ChannelCredentials,
  InboundMessageEvent,
  ParsedWebhook,
} from "./types.js";

const connectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  domain: z.string().trim().max(255).optional(),
});

const WIDGET_TOKEN_HEADER = "x-widget-token";

/**
 * Web chat widget channel. There is no provider API: outbound messages are
 * already persisted and reach the visitor via SSE/polling; inbound messages
 * arrive through the public widget webhook authenticated by a per-account
 * widget token.
 */
export const webAdapter: ChannelAdapter = {
  type: "web",

  async connect(input) {
    const { name, domain } = connectSchema.parse(input);
    return {
      credentials: {
        widgetToken: randomToken(24),
        ...(domain ? { domain } : {}),
      },
      displayName: name,
      status: "connected",
    };
  },

  async send() {
    // No-op: the message row is the delivery mechanism for web chat.
    return {};
  },

  verifyWebhook(request, _account, credentials) {
    const token = credentials["widgetToken"];
    const header = request.headers[WIDGET_TOKEN_HEADER];
    const body = request.body as { widgetToken?: unknown } | undefined;
    const presented =
      (typeof header === "string" ? header : undefined) ??
      (typeof body?.widgetToken === "string" ? body.widgetToken : undefined);
    return typeof token === "string" && presented === token;
  },

  parseWebhook(body): ParsedWebhook {
    const b = body as {
      visitorId?: unknown;
      name?: unknown;
      text?: unknown;
      kind?: unknown;
      sentAt?: unknown;
      messageId?: unknown;
    };
    if (typeof b.visitorId !== "string" || !b.visitorId) return { events: [] };
    const kind =
      b.kind === "image" || b.kind === "document" || b.kind === "voice" ? b.kind : "text";
    const event: InboundMessageEvent = {
      ...(typeof b.messageId === "string" || typeof b.messageId === "number"
        ? { providerMessageId: String(b.messageId) }
        : {}),
      senderId: b.visitorId,
      ...(typeof b.name === "string" && b.name ? { senderName: b.name } : {}),
      text: typeof b.text === "string" ? b.text : "",
      kind,
      ...(typeof b.sentAt === "string" ? { sentAt: b.sentAt } : {}),
    };
    return { events: [event] };
  },

  async healthCheck() {
    return { ok: true };
  },
};

export type { ChannelCredentials };
