import { PrismaClient } from "@prisma/client";

// Prisma usa consultas parametrizadas: protege contra inyección SQL (OWASP A03).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
