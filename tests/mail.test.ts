import { describe, expect, it } from "vitest";
import { smtpOptions } from "@/lib/mail";

describe("Configuración SMTP", () => {
  it("sin SMTP_HOST usa el modo consola", () => expect(smtpOptions({})).toBeNull());
  it("puerto 587 exige STARTTLS (requireTLS)", () => {
    const o = smtpOptions({ SMTP_HOST: "smtp.sendgrid.net", SMTP_PORT: "587", SMTP_USER: "apikey", SMTP_PASS: "x" })!;
    expect(o.secure).toBe(false);
    expect(o.requireTLS).toBe(true);
    expect(o.auth).toEqual({ user: "apikey", pass: "x" });
  });
  it("puerto 465 usa TLS directo", () => {
    const o = smtpOptions({ SMTP_HOST: "smtp.gmail.com", SMTP_PORT: "465" })!;
    expect(o.secure).toBe(true);
    expect(o.requireTLS).toBe(false);
  });
  it("TLS mínimo 1.2", () => expect(smtpOptions({ SMTP_HOST: "h" })!.tls.minVersion).toBe("TLSv1.2"));
});
