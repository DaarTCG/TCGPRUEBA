import { NextResponse } from "next/server";
import { verifyCsrf } from "./csrf";

export const jsonError = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Devuelve una respuesta 403 si el token CSRF no es válido, o null si está OK. */
export function csrfGuard(req: Request) {
  const r = verifyCsrf(req);
  return r.ok ? null : jsonError(r.reason, 403);
}
