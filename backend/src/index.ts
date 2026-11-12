import { buildApp } from "./app.js";
import { config } from "./config.js";
import { closeQueues } from "./lib/jobs.js";
import { prisma } from "./lib/prisma.js";
import { initSentry, closeSentry } from "./lib/sentry.js";

initSentry();

const app = await buildApp();

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`Konvo API listening on http://localhost:${config.PORT}/api`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, "shutting down");

  // Force-exit if graceful shutdown stalls (e.g. a hung queue or DB call).
  const force = setTimeout(() => {
    app.log.error("graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 15_000);
  force.unref();

  try {
    // Stop accepting new connections and drain in-flight requests.
    await app.close();
    await closeQueues();
    await prisma.$disconnect();
    await closeSentry();
  } catch (err) {
    app.log.error(err);
  } finally {
    clearTimeout(force);
    process.exit(0);
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void shutdown(signal));
}
