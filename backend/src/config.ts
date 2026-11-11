import { z } from "zod";

// Load .env for local dev. Does not override variables already set (e.g. by vitest).
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on real environment
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://127.0.0.1:6379"),
  JWT_SECRET: z.string().min(16),
  // 32-byte key as 64 hex chars, used for AES-256-GCM at-rest encryption.
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, "ENCRYPTION_KEY must be 64 hex chars"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  // "false" must parse to false — z.coerce.boolean() would wrongly give true.
  COOKIE_SECURE: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .default(false),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  LOCKOUT_THRESHOLD: z.coerce.number().int().positive().default(5),
  LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),
  // Multiplies all rate limits — set high in tests.
  RATE_LIMIT_SCALE: z.coerce.number().positive().default(1),
  // Public base URL of this API — used to register provider webhooks (e.g. Telegram).
  PUBLIC_URL: z.string().optional(),
  // WhatsApp Cloud API app credentials (Embedded Signup).
  WHATSAPP_APP_ID: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export const isProd = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
