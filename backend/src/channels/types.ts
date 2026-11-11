import type { ChannelAccount, ChannelAccountType } from "@prisma/client";
import type { FastifyRequest } from "fastify";

/** Decrypted credential blob stored per channel account (AES-256-GCM at rest). */
export type ChannelCredentials = Record<string, unknown>;

export type InboundMessageKind = "text" | "image" | "document" | "voice" | "interactive";

/** Normalized inbound message produced by a webhook parser. */
export interface InboundMessageEvent {
  providerMessageId?: string;
  /** Provider-side user id (telegram user id, WA phone, widget visitor id). */
  senderId: string;
  senderName?: string;
  text: string;
  kind?: InboundMessageKind;
  mediaUrl?: string;
  fileName?: string;
  /** ISO timestamp from the provider, when available. */
  sentAt?: string;
}

export interface DeliveryStatusEvent {
  providerMessageId: string;
  status: "sent" | "delivered" | "read" | "failed";
}

export interface ParsedWebhook {
  events: InboundMessageEvent[];
  statuses?: DeliveryStatusEvent[];
}

export interface OutboundPayload {
  body: string;
  kind: string;
  templateName?: string;
  mediaUrl?: string;
  fileName?: string;
}

export interface SendResult {
  providerMessageId?: string;
}

/** Payload handed to a channel adapter when a template is submitted for approval. */
export interface TemplateSyncInput {
  name: string;
  category: string;
  language: string;
  body: string;
  headerMedia?: string;
  buttons?: unknown;
}

export interface TemplateSyncResult {
  providerTemplateId?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface ConnectResult {
  credentials: ChannelCredentials;
  phoneNumber?: string;
  displayName?: string;
  qualityRating?: string;
  messagingTier?: string;
  status?: "connected" | "pending" | "error";
}

export interface HealthResult {
  ok: boolean;
  detail?: string;
}

/**
 * Pluggable per-channel adapter. Each provider implements connect (credential
 * validation + normalization), send (outbound delivery), and — for webhook-
 * based channels — verifyWebhook + parseWebhook.
 */
export interface ChannelAdapter {
  readonly type: ChannelAccountType;
  connect(input: Record<string, unknown>): Promise<ConnectResult>;
  send(
    account: ChannelAccount,
    credentials: ChannelCredentials,
    /** Provider-side recipient id (chat id, phone, visitor id). */
    to: string,
    msg: OutboundPayload,
  ): Promise<SendResult>;
  /** Return false → webhook request rejected with 401. */
  verifyWebhook?(
    request: FastifyRequest,
    account: ChannelAccount,
    credentials: ChannelCredentials,
  ): boolean | Promise<boolean>;
  parseWebhook?(
    body: unknown,
    account: ChannelAccount,
    credentials: ChannelCredentials,
  ): ParsedWebhook;
  /**
   * Submit a template to the provider for approval (e.g. WhatsApp message
   * templates). Absent → the template stays in the local approval flow.
   */
  submitTemplate?(
    account: ChannelAccount,
    credentials: ChannelCredentials,
    input: TemplateSyncInput,
  ): Promise<TemplateSyncResult>;
  /** Best-effort post-connect hook (e.g. register the webhook URL upstream). */
  afterConnect?(account: ChannelAccount, credentials: ChannelCredentials): Promise<void>;
  healthCheck?(account: ChannelAccount, credentials: ChannelCredentials): Promise<HealthResult>;
}
