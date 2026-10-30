import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { createAndSendVerification } from "@/lib/verification";
import { csrfGuard, jsonError } from "@/lib/api";

export async function POST(req: Request) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;

  const limit = rateLimit(`register:ip:${clientIp(req.headers)}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  const { email, password } = parsed.data;
  const name = sanitizeText(parsed.data.name, 80);

  const existing = await prisma.user.findUnique({ where: { email } });
  // Respuesta idéntica exista o no la cuenta (evita enumeración de usuarios)
  if (!existing) {
    await prisma.user.create({ data: { email, name, passwordHash: await hashPassword(password) } });
    const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    await createAndSendVerification(email, name, base);
  } else if (!existing.emailVerified && existing.passwordHash) {
    // Reenvía el enlace si la cuenta aún no fue verificada
    const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    await createAndSendVerification(email, existing.name ?? name, base);
  }
  return NextResponse.json({ ok: true, message: "Si el correo es válido, te enviamos un enlace de verificación." });
}
