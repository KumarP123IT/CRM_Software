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
  // Public base URL of the frontend — used in emails (password reset links).
  FRONTEND_URL: z.preprocess((v) => (v === "" ? undefined : v), z.string().url().optional()),
  // Outbound SMTP for transactional mail. If SMTP_HOST is unset, mail is only
  // logged (dev/test) — password reset cannot deliver in that mode.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Konvo <no-reply@localhost>"),
  // Grace period: accept legacy client-supplied widget visitorId values.
  // Defaults to false — set "true" only while migrating sites off legacy ids.
  WIDGET_LEGACY_VISITOR_ID: z
    .preprocess((v) => v === "true" || v === true, z.boolean())
    .default(false),
  // WhatsApp Cloud API app credentials (Embedded Signup).
  WHATSAPP_APP_ID: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  // pino log level (trace|debug|info|warn|error|fatal). Default "info".
  LOG_LEVEL: z.string().optional(),
  // Sentry DSN — error reporting is disabled entirely when unset.
  SENTRY_DSN: z.preprocess((v) => (v === "" ? undefined : v), z.string().optional()),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export const isProd = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

if (isProd) {
  const problems: string[] = [];
  if (/change-me|placeholder|example/i.test(config.JWT_SECRET)) {
    problems.push("JWT_SECRET is still a placeholder value");
  }
  if (/^0+$/.test(config.ENCRYPTION_KEY) || config.ENCRYPTION_KEY.length < 64) {
    problems.push("ENCRYPTION_KEY is still a placeholder value");
  }
  if (problems.length) {
    console.error(`Refusing to start in production: ${problems.join("; ")}`);
    process.exit(1);
  }
  if (!config.SMTP_HOST) {
    console.warn("WARNING: SMTP_HOST is not set — outbound email (e.g. password reset) will only be logged, not delivered.");
  }
  if (!config.FRONTEND_URL) {
    console.warn("WARNING: FRONTEND_URL is not set — email links will fall back to http://localhost:3000.");
  }
}
