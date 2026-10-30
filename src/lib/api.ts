import { NextResponse } from "next/server";
import { verifyCsrf } from "./csrf";
import { rateLimit, clientIp, API_LIMITS } from "./rate-limit";

export const jsonError = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Devuelve una respuesta 403 si el token CSRF no es válido, o null si está OK. */
export function csrfGuard(req: Request) {
  const r = verifyCsrf(req);
  return r.ok ? null : jsonError(r.reason, 403);
}

/** Devuelve 429 con Retry-After si se supera el límite del grupo, o null si está OK. */
export function rateGuard(req: Request, group: keyof typeof API_LIMITS, id?: string) {
  const { max, windowMs } = API_LIMITS[group];
  const r = rateLimit(`${group}:${id ?? clientIp(req.headers)}`, max, windowMs);
  if (r.ok) return null;
  return NextResponse.json(
    { error: `Demasiadas solicitudes. Intenta en ${r.retryAfter}s.` },
    { status: 429, headers: { "Retry-After": String(r.retryAfter) } },
  );
}
