/**
 * Protección CSRF (double-submit cookie + verificación de Origin).
 * El middleware entrega la cookie `csrf_token`; el cliente la reenvía en el header `x-csrf-token`.
 * Se exige en Checkout, Admin, Wishlist y formulario de colecciones.
 */
export const CSRF_COOKIE = "csrf_token";
export const CSRF_HEADER = "x-csrf-token";

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export function verifyCsrf(req: Request): { ok: true } | { ok: false; reason: string } {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    try {
      if (new URL(origin).host !== host) return { ok: false, reason: "Origen no permitido" };
    } catch {
      return { ok: false, reason: "Origen inválido" };
    }
  }
  const cookie = readCookie(req.headers.get("cookie"), CSRF_COOKIE);
  const header = req.headers.get(CSRF_HEADER);
  if (!cookie || !header || cookie.length < 32 || !timingSafeEqual(cookie, header)) {
    return { ok: false, reason: "Token CSRF inválido" };
  }
  return { ok: true };
}
