import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { config } from "../config.js";

const key = Buffer.from(config.ENCRYPTION_KEY, "hex");

/**
 * AES-256-GCM encrypt. Output format: v1:<iv>:<tag>:<ciphertext> (base64 parts).
 * Use for channel tokens, provider secrets, webhook secrets at rest.
 */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decryptSecret(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted payload");
  }
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
}

/** SHA-256 hex digest — used for token/api-key storage (never store raw secrets). */
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** URL-safe random token (refresh tokens, reset tokens, API keys). */
export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString("base64url");
}

/** Mask a secret for display, e.g. "sk-...abcd". */
export function maskSecret(secret: string, visible = 4): string {
  if (secret.length <= visible) return "•".repeat(secret.length);
  return `${secret.slice(0, 3)}…${secret.slice(-visible)}`;
}
