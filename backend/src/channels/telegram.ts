import { z } from "zod";
import { config } from "../config.js";
import { badRequest } from "../lib/errors.js";
import { randomToken } from "../lib/crypto.js";
import type {
  ChannelAdapter,
  InboundMessageEvent,
  OutboundPayload,
  ParsedWebhook,
} from "./types.js";

const API = "https://api.telegram.org";

const connectSchema = z.object({
  botToken: z.string().trim().min(10).max(200),
  name: z.string().trim().max(120).optional(),
});

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

async function callBot<T>(token: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? "{}" : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    result?: T;
    description?: string;
  } | null;
  if (!res.ok || !data?.ok) {
    throw badRequest("telegram_error", data?.description ?? `Telegram API error (${res.status})`);
  }
  return data.result as T;
}

export const telegramAdapter: ChannelAdapter = {
  type: "telegram",

  async connect(input) {
    const { botToken, name } = connectSchema.parse(input);
    const me = await callBot<TelegramUser>(botToken, "getMe");
    const displayName =
      name ?? `@${me.username ?? me.first_name} (Telegram bot)`;
    return {
      credentials: { botToken, webhookSecret: randomToken(24) },
      displayName,
      status: "connected",
    };
  },

  async afterConnect(account, credentials) {
    const botToken = credentials["botToken"];
    const secret = credentials["webhookSecret"];
    if (typeof botToken !== "string" || typeof secret !== "string") return;
    if (!config.PUBLIC_URL) return; // no public URL — user sets webhook manually
    const url = `${config.PUBLIC_URL.replace(/\/$/, "")}/api/webhooks/telegram/${account.id}`;
    try {
      await callBot(botToken, "setWebhook", {
        url,
        secret_token: secret,
        allowed_updates: ["message"],
      });
    } catch (err) {
      console.warn("[telegram] setWebhook failed:", err);
    }
  },

  async send(_account, credentials, to, msg: OutboundPayload) {
    const botToken = credentials["botToken"];
    if (typeof botToken !== "string") throw badRequest("bad_credentials", "Missing bot token");
    // Non-text kinds degrade to a captioned text message until media upload lands.
    const result = await callBot<{ message_id: number }>(botToken, "sendMessage", {
      chat_id: to,
      text: msg.body,
      disable_web_page_preview: true,
    });
    return { providerMessageId: String(result.message_id) };
  },

  verifyWebhook(request, _account, credentials) {
    const secret = credentials["webhookSecret"];
    const header = request.headers["x-telegram-bot-api-secret-token"];
    return typeof secret === "string" && header === secret;
  },

  parseWebhook(body): ParsedWebhook {
    const update = body as {
      update_id?: number;
      message?: {
        message_id: number;
        date: number;
        text?: string;
        caption?: string;
        from?: { id: number; first_name?: string; username?: string };
        chat?: { id: number; type?: string };
      };
    };
    const m = update.message;
    if (!m?.from || !m.chat) return { events: [] };
    // Ignore messages sent by the bot itself / channel posts without a user.
    const senderName =
      m.from.username ?? m.from.first_name ?? String(m.from.id);
    const event: InboundMessageEvent = {
      providerMessageId: String(m.message_id),
      senderId: String(m.from.id),
      senderName,
      text: m.text ?? m.caption ?? "",
      kind: "text",
      sentAt: new Date(m.date * 1000).toISOString(),
    };
    return { events: [event] };
  },

  async healthCheck(_account, credentials) {
    const botToken = credentials["botToken"];
    if (typeof botToken !== "string") return { ok: false, detail: "Missing bot token" };
    try {
      await callBot<TelegramUser>(botToken, "getMe");
      return { ok: true };
    } catch (err) {
      return { ok: false, detail: err instanceof Error ? err.message : "Telegram unreachable" };
    }
  },
};
