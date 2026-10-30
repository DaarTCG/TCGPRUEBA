/**
 * Rate limiter de ventana deslizante en memoria.
 * Login/Register: máximo 5 intentos por minuto por IP (+ email) contra fuerza bruta.
 * Para varias instancias en producción, reemplazar el Map por Redis/Upstash.
 */
type Bucket = number[];
const store = new Map<string, Bucket>();

export const AUTH_LIMIT = { max: 5, windowMs: 60_000 };
/** Límites para el resto de la API (anti-abuso / scraping). */
export const API_LIMITS = {
  checkout: { max: 10, windowMs: 60_000 },
  wishlist: { max: 30, windowMs: 60_000 },
  admin: { max: 60, windowMs: 60_000 },
} as const;

export function rateLimit(key: string, max = AUTH_LIMIT.max, windowMs = AUTH_LIMIT.windowMs, now = Date.now()) {
  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    store.set(key, hits);
    const retryAfter = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { ok: false as const, remaining: 0, retryAfter };
  }
  hits.push(now);
  store.set(key, hits);
  return { ok: true as const, remaining: max - hits.length, retryAfter: 0 };
}

export function resetRateLimit(key?: string) {
  if (key) store.delete(key);
  else store.clear();
}

export function clientIp(headers: Headers | Record<string, unknown> | undefined): string {
  if (!headers) return "unknown";
  const get = (k: string) =>
    headers instanceof Headers ? headers.get(k) : (headers[k] as string | undefined) ?? null;
  const fwd = get("x-forwarded-for");
  return (fwd?.split(",")[0].trim() || get("x-real-ip") || "unknown").slice(0, 64);
}
