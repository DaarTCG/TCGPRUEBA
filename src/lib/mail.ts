import nodemailer, { type Transporter } from "nodemailer";

type Attachment = { filename: string; content: Buffer; contentType: string };
type Env = Record<string, string | undefined>;

/** Opciones SMTP seguras: TLS directo en 465 y STARTTLS obligatorio en los demás puertos. */
export function smtpOptions(env: Env = process.env) {
  if (!env.SMTP_HOST) return null;
  const port = Number(env.SMTP_PORT || 587);
  return {
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465, // nunca enviar credenciales sin cifrar
    tls: { minVersion: "TLSv1.2" as const },
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  };
}

let transporter: Transporter | null = null;
function getTransport() {
  const opts = smtpOptions();
  if (!opts) return null;
  transporter ??= nodemailer.createTransport(opts);
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
