import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { sendMail } from "./mail";
import { escapeHtml } from "./sanitize";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Crea un token de un solo uso (24 h). En BD se guarda solo su hash. */
export async function createAndSendVerification(email: string, name: string, baseUrl: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { email } });
  await prisma.verificationToken.create({
    data: { email, tokenHash: sha256(token), expires: new Date(Date.now() + 24 * 3600 * 1000) },
  });
  const link = `${baseUrl}/verificar?token=${token}`;
  await sendMail({
    to: email,
    subject: "Verifica tu correo · Hoenn TCG",
    text: `Hola ${name}, confirma tu correo aquí: ${link}`,
    html: `<p>Hola ${escapeHtml(name)},</p><p>Confirma tu correo para activar tu cuenta:</p><p><a href="${link}">Verificar mi correo</a></p><p>El enlace vence en 24 horas.</p>`,
  });
}

export async function consumeVerification(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const row = await prisma.verificationToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.expires < new Date()) return false;
  await prisma.$transaction([
    prisma.user.update({ where: { email: row.email }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { id: row.id } }),
  ]);
  return true;
}
