import nodemailer from "nodemailer";

type Attachment = { filename: string; content: Buffer; contentType: string };

let transporter: nodemailer.Transporter | null = null;
function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

/** Envía correo vía SMTP (NodeMailer; compatible con SendGrid SMTP). Sin SMTP configurado, lo muestra en consola. */
export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string; attachments?: Attachment[] }) {
  const t = getTransport();
  if (!t) {
    console.info(`\n📧 [MAIL DEV] Para: ${opts.to}\nAsunto: ${opts.subject}\n${opts.text}\n(adjuntos: ${opts.attachments?.length ?? 0})\n`);
    return { dev: true };
  }
  await t.sendMail({ from: process.env.MAIL_FROM, ...opts });
  return { dev: false };
}
