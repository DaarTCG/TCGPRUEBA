import { beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { rateLimit, resetRateLimit, AUTH_LIMIT } from "@/lib/rate-limit";
import { sanitizeText, escapeHtml } from "@/lib/sanitize";
import { verifyCsrf, CSRF_COOKIE, CSRF_HEADER } from "@/lib/csrf";
import { hashPassword, verifyPassword, BCRYPT_COST } from "@/lib/password";
import { detectImage, validateUpload } from "@/lib/upload";
import { registerSchema, sellRequestSchema, checkoutSchema } from "@/lib/validation";
import { buildCsp } from "@/lib/csp";
// @ts-expect-error módulo .mjs sin tipos
import { securityHeaders } from "../next.config.mjs";

describe("Rate limiting · fuerza bruta (5 intentos / minuto)", () => {
  beforeEach(() => resetRateLimit());

  it("permite 5 intentos y bloquea el 6º", () => {
    for (let i = 0; i < 5; i++) expect(rateLimit("login:ip:1.2.3.4").ok).toBe(true);
    const sixth = rateLimit("login:ip:1.2.3.4");
    expect(sixth.ok).toBe(false);
    expect(sixth.retryAfter).toBeGreaterThan(0);
  });

  it("se libera cuando pasa la ventana de 60 s", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) rateLimit("k", 5, 60_000, t0);
    expect(rateLimit("k", 5, 60_000, t0 + 1000).ok).toBe(false);
    expect(rateLimit("k", 5, 60_000, t0 + 61_000).ok).toBe(true);
  });

  it("aísla claves distintas (otra IP no queda bloqueada)", () => {
    for (let i = 0; i < 6; i++) rateLimit("login:ip:A");
    expect(rateLimit("login:ip:B").ok).toBe(true);
  });

  it("la configuración exige máximo 5 por minuto", () => expect(AUTH_LIMIT).toEqual({ max: 5, windowMs: 60_000 }));
});

describe("XSS · sanitización de inputs", () => {
  const payloads = [
    '<script>alert("xss")</script>Hola',
    '<img src=x onerror="alert(1)">Hola',
    '<svg onload=alert(1)>Hola',
    '<a href="javascript:alert(1)">Hola</a>',
    '<iframe src="https://evil.com"></iframe>Hola',
    "<<script>script>alert(1)<</script>/script>Hola",
  ];
  it.each(payloads)("neutraliza: %s", (p) => {
    const out = sanitizeText(p);
    expect(out).not.toMatch(/<|>/);
    expect(out.toLowerCase()).not.toContain("javascript:");
    expect(out.toLowerCase()).not.toContain("onerror");
    expect(out).toContain("Hola");
  });
  it("conserva texto normal", () => expect(sanitizeText("Charizard 1ª ed. & binder 9-pocket")).toBe("Charizard 1ª ed. & binder 9-pocket"));
  it("respeta el largo máximo", () => expect(sanitizeText("a".repeat(100), 10)).toHaveLength(10));
  it("escapeHtml escapa caracteres peligrosos para correos", () =>
    expect(escapeHtml(`<b onclick="x">'&`)).toBe("&lt;b onclick=&quot;x&quot;&gt;&#39;&amp;"));
});

describe("CSRF · double-submit token + origen", () => {
  const token = "a".repeat(64);
  const req = (headers: Record<string, string>) => new Request("http://localhost:3000/api/checkout", { method: "POST", headers });

  it("acepta cookie y header iguales del mismo origen", () => {
    expect(verifyCsrf(req({ host: "localhost:3000", origin: "http://localhost:3000", cookie: `${CSRF_COOKIE}=${token}`, [CSRF_HEADER]: token })).ok).toBe(true);
  });
  it("rechaza sin header", () => {
    expect(verifyCsrf(req({ host: "localhost:3000", cookie: `${CSRF_COOKIE}=${token}` })).ok).toBe(false);
  });
  it("rechaza token distinto", () => {
    expect(verifyCsrf(req({ host: "localhost:3000", cookie: `${CSRF_COOKIE}=${token}`, [CSRF_HEADER]: "b".repeat(64) })).ok).toBe(false);
  });
  it("rechaza peticiones desde otro origen (sitio atacante)", () => {
    expect(verifyCsrf(req({ host: "localhost:3000", origin: "https://evil.com", cookie: `${CSRF_COOKIE}=${token}`, [CSRF_HEADER]: token })).ok).toBe(false);
  });
});

describe("Contraseñas · bcrypt cost >= 12", () => {
  it("cost factor configurado en 12 o más", () => expect(BCRYPT_COST).toBeGreaterThanOrEqual(12));
  it("el hash generado usa cost 12 y verifica correctamente", async () => {
    const hash = await hashPassword("Segura#2026x");
    expect(bcrypt.getRounds(hash)).toBeGreaterThanOrEqual(12);
    expect(await verifyPassword("Segura#2026x", hash)).toBe(true);
    expect(await verifyPassword("otra", hash)).toBe(false);
  }, 20_000);
});

describe("Validación de entradas (zod)", () => {
  it("exige contraseñas robustas en el registro", () => {
    expect(registerSchema.safeParse({ name: "Ash", email: "ash@pallet.cl", password: "123456" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "Ash", email: "ash@pallet.cl", password: "Pikachu#2026" }).success).toBe(true);
  });
  it("rechaza inyección SQL/NoSQL como correo", () => {
    expect(registerSchema.safeParse({ name: "x", email: "' OR 1=1 --", password: "Pikachu#2026" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "x", email: { $ne: null }, password: "Pikachu#2026" }).success).toBe(false);
  });
  it("valida el formulario de colecciones", () => {
    const ok = { fullName: "Misty W", email: "m@c.cl", phone: "+56 9 1234 5678", description: "Binder con 200 cartas holo de Hoenn", estimatedValue: "500", currency: "USD" };
    expect(sellRequestSchema.safeParse(ok).success).toBe(true);
    expect(sellRequestSchema.safeParse({ ...ok, phone: "<script>" }).success).toBe(false);
    expect(sellRequestSchema.safeParse({ ...ok, currency: "BTC" }).success).toBe(false);
  });
  it("el checkout no acepta precios del cliente ni cantidades abusivas", () => {
    const base = { shippingName: "Brock", shippingAddress: "Calle 123", shippingCity: "Pewter", phone: "+56911112222" };
    expect(checkoutSchema.safeParse({ ...base, items: [{ productId: "p1", quantity: 999 }] }).success).toBe(false);
    const parsed = checkoutSchema.parse({ ...base, items: [{ productId: "p1", quantity: 1, priceClp: 1 }] });
    expect(parsed.items[0]).not.toHaveProperty("priceClp");
  });
});

describe("Subida de archivos", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0]);
  const fakeJpgHtml = new TextEncoder().encode("<html><script>alert(1)</script></html>");
  it("acepta imágenes reales (magic bytes)", () => expect(detectImage(png)?.mime).toBe("image/png"));
  it("rechaza un HTML disfrazado de imagen", () => expect(validateUpload(fakeJpgHtml, fakeJpgHtml.length)).not.toBeNull());
  it("rechaza archivos de más de 5 MB", () => expect(validateUpload(png, 6 * 1024 * 1024)).toMatch(/5 MB/));
});

describe("Security headers (Helmet-equivalente)", () => {
  const keys = (securityHeaders as { key: string; value: string }[]).reduce<Record<string, string>>((a, h) => ({ ...a, [h.key]: h.value }), {});
  it("Strict-Transport-Security con max-age >= 1 año", () => expect(Number(/max-age=(\d+)/.exec(keys["Strict-Transport-Security"])?.[1])).toBeGreaterThanOrEqual(31536000));
  it("X-Frame-Options: DENY", () => expect(keys["X-Frame-Options"]).toBe("DENY"));
  it("X-Content-Type-Options: nosniff", () => expect(keys["X-Content-Type-Options"]).toBe("nosniff"));
  it("CSP de producción con nonce, sin unsafe-eval y sin framing", () => {
    const csp = buildCsp("abc123", false);
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});

import { rateGuard } from "@/lib/api";
import { API_LIMITS } from "@/lib/rate-limit";

describe("Rate limiting de la API", () => {
  beforeEach(() => resetRateLimit());
  const req = () => new Request("http://localhost/api/checkout", { method: "POST", headers: { "x-forwarded-for": "9.9.9.9" } });

  it("checkout: bloquea con 429 y Retry-After al superar el límite", () => {
    for (let i = 0; i < API_LIMITS.checkout.max; i++) expect(rateGuard(req(), "checkout")).toBeNull();
    const res = rateGuard(req(), "checkout")!;
    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
  it("los grupos tienen contadores independientes", () => {
    for (let i = 0; i <= API_LIMITS.checkout.max; i++) rateGuard(req(), "checkout");
    expect(rateGuard(req(), "wishlist")).toBeNull();
  });
});
