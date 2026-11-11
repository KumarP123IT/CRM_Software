import { buildApp } from "./app.js";
import { config } from "./config.js";
import { closeQueues } from "./lib/jobs.js";
import { prisma } from "./lib/prisma.js";

const app = await buildApp({ logger: true });

try {
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  app.log.info(`Konvo API listening on http://localhost:${config.PORT}/api`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await app.close();
    await closeQueues();
    await prisma.$disconnect();
    process.exit(0);
  });
}
