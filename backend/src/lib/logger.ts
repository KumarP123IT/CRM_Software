import type { FastifyServerOptions } from "fastify";
import { config } from "../config.js";

/**
 * Pino options for Fastify's logger. Customer data is personal data —
 * redact credentials, tokens, emails, phone numbers and message content
 * from anything the logger might serialize (request logs, error objects,
 * job payloads).
 */
export const pinoOptions: NonNullable<FastifyServerOptions["logger"]> = {
  level: config.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      // HTTP request/response
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      "req.headers['x-konvo-signature']",
      "res.headers['set-cookie']",
      // Credentials & tokens (any depth)
      "*.password",
      "*.passwordHash",
      "*.currentPassword",
      "*.newPassword",
      "*.totpSecret",
      "*.secret",
      "*.secretEncrypted",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.visitorToken",
      "*.widgetToken",
      "*.apiKey",
      "*.session",
      // Personal data
      "*.email",
      "*.phone",
      "*.phoneNumber",
      "*.notes",
      // Message / payload content
      "*.text",
      "*.body",
      "*.messageText",
      "*.credentials",
      "*.encryptedCredentials",
    ],
    censor: "[redacted]",
  },
};
