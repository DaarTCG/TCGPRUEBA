import { prisma } from "./prisma";

/** Registra una visita diaria (para la métrica de conversión del dashboard). */
export async function trackVisit() {
  const day = new Date().toISOString().slice(0, 10);
  try {
    await prisma.dailyVisit.upsert({ where: { day }, update: { count: { increment: 1 } }, create: { day, count: 1 } });
  } catch {
    /* las métricas nunca deben romper la página */
  }
}
