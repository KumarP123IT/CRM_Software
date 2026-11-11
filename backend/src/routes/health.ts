import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  });
}
