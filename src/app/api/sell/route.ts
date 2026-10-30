import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { csrfGuard, jsonError } from "@/lib/api";
import { sellRequestSchema } from "@/lib/validation";
import { sanitizeText, escapeHtml } from "@/lib/sanitize";
import { detectImage, validateUpload, UPLOAD_LIMITS } from "@/lib/upload";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mail";
import { formatClp, formatUsd } from "@/lib/pricing";

export async function POST(req: Request) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  const limit = rateLimit(`sell:${clientIp(req.headers)}`, 5, 10 * 60_000);
  if (!limit.ok) return jsonError("Demasiados envíos. Intenta más tarde.", 429);

  const form = await req.formData().catch(() => null);
  if (!form) return jsonError("Formulario inválido");

  const parsed = sellRequestSchema.safeParse({
    fullName: form.get("fullName"),
    email: form.get("email"),
    phone: form.get("phone"),
    description: form.get("description"),
    estimatedValue: form.get("estimatedValue"),
    currency: form.get("currency"),
  });
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");

  // Sanitización XSS de todo el texto libre
  const data = {
    ...parsed.data,
    fullName: sanitizeText(parsed.data.fullName, 100),
    description: sanitizeText(parsed.data.description, 4000),
  };

  const photos = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length > UPLOAD_LIMITS.maxFiles) return jsonError(`Máximo ${UPLOAD_LIMITS.maxFiles} imágenes`);

  const id = randomUUID();
  const dir = path.join(process.cwd(), "uploads", "sell", id); // fuera de /public: no accesible por URL
  const saved: { filename: string; content: Buffer; contentType: string }[] = [];
  for (const [i, f] of photos.entries()) {
    const buf = Buffer.from(await f.arrayBuffer());
    const err = validateUpload(buf, f.size);
    if (err) return jsonError(`${err} (${sanitizeText(f.name, 60)})`);
    const kind = detectImage(buf)!;
    saved.push({ filename: `foto-${i + 1}.${kind.ext}`, content: buf, contentType: kind.mime }); // nombre generado, nunca el original
  }
  if (saved.length) {
    await mkdir(dir, { recursive: true });
    await Promise.all(saved.map((s) => writeFile(path.join(dir, s.filename), s.content)));
  }

  await prisma.sellRequest.create({
    data: { id, ...data, files: JSON.stringify(saved.map((s) => s.filename)) },
  });

  const value = data.currency === "USD" ? formatUsd(data.estimatedValue) : formatClp(data.estimatedValue);
  const rows: [string, string][] = [
    ["Nombre", data.fullName],
    ["Correo", data.email],
    ["Teléfono", data.phone],
    ["Valor estimado", `${value} (${data.currency})`],
    ["Descripción", data.description],
  ];
  await sendMail({
    to: process.env.ADMIN_EMAIL || "admin@localhost",
    replyTo: data.email,
    subject: `🃏 Nueva colección para comprar: ${data.fullName} (${value})`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `<h2>Nueva solicitud de compra de colección</h2><table cellpadding="6">${rows
      .map(([k, v]) => `<tr><td><b>${escapeHtml(k)}</b></td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
      .join("")}</table><p>${saved.length} foto(s) adjunta(s). ID: ${id}</p>`,
    attachments: saved,
  });

  return NextResponse.json({ ok: true, id });
}
