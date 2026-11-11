import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "src/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://konvo@localhost:5433/konvo_test",
      REDIS_URL: "redis://127.0.0.1:6379",
      JWT_SECRET: "test-jwt-secret-0123456789abcdef0123456789",
      ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      COOKIE_SECURE: "false",
      CORS_ORIGIN: "http://localhost:3000",
      RATE_LIMIT_SCALE: "1000",
      WHATSAPP_APP_ID: "test-app-id",
      WHATSAPP_APP_SECRET: "test-app-secret",
    },
    // Test files share one Postgres database — run serially to avoid truncates racing.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
