import { badRequest } from "../lib/errors.js";
import type { ChannelAccountType } from "@prisma/client";
import type { ChannelAdapter } from "./types.js";
import { telegramAdapter } from "./telegram.js";
import { webAdapter } from "./web.js";
import { whatsappAdapter } from "./whatsapp.js";

const adapters = new Map<ChannelAccountType, ChannelAdapter>([
  [telegramAdapter.type, telegramAdapter],
  [webAdapter.type, webAdapter],
  [whatsappAdapter.type, whatsappAdapter],
]);

export function getAdapter(type: ChannelAccountType): ChannelAdapter {
  const adapter = adapters.get(type);
  if (!adapter) {
    throw badRequest("channel_unsupported", `Channel "${type}" is not supported yet`);
  }
  return adapter;
}

export function supportedChannelTypes(): ChannelAccountType[] {
  return [...adapters.keys()];
}

export * from "./types.js";
