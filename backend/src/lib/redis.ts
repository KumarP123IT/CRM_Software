import { Redis } from "ioredis";
import { config, isTest } from "../config.js";

let connection: Redis | null = null;

/** Shared Redis connection for BullMQ. Lazy — tests can run without Redis for pure unit paths. */
export function redis(): Redis {
  if (!connection) {
    connection = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: null, // required by BullMQ
      lazyConnect: true,
      ...(isTest ? { retryStrategy: () => null } : {}),
    });
    connection.on("error", () => {
      // connection errors are surfaced by queue operations; keep process alive
    });
  }
  return connection;
}
