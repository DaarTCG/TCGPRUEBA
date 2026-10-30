import { describe, expect, it, vi } from "vitest";
import { commitTransaction, createTransaction, isApproved, webpayConfig, WEBPAY_INTEGRATION } from "@/lib/webpay";

const cfg = webpayConfig({});

describe("Webpay Plus", () => {
  it("usa credenciales de integración por defecto", () => {
    expect(cfg).toEqual(WEBPAY_INTEGRATION);
  });
  it("exige credenciales propias en producción", () => {
    expect(() => webpayConfig({ WEBPAY_ENV: "production" })).toThrow();
    expect(webpayConfig({ WEBPAY_ENV: "production", WEBPAY_COMMERCE_CODE: "597000000000", WEBPAY_API_KEY: "k" }).baseUrl).toBe("https://webpay3g.transbank.cl");
  });
  it("crea la transacción con headers y body correctos", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ token: "t".repeat(64), url: "https://webpay3gint.transbank.cl/webpayserver/initTransaction" })));
    const r = await createTransaction({ buyOrder: "clorder123", sessionId: "user1", amount: 45000, returnUrl: "https://tienda.cl/api/webpay/retorno" }, cfg, fetchMock);
    expect(r.url).toContain("initTransaction");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://webpay3gint.transbank.cl/rswebpaytransaction/api/webpay/v1.2/transactions");
    expect(init.method).toBe("POST");
    expect(init.headers["Tbk-Api-Key-Id"]).toBe("597055555532");
    expect(JSON.parse(init.body)).toEqual({ buy_order: "clorder123", session_id: "user1", amount: 45000, return_url: "https://tienda.cl/api/webpay/retorno" });
  });
  it("rechaza montos inválidos y buy_order largos", async () => {
    await expect(createTransaction({ buyOrder: "x", sessionId: "u", amount: 10.5, returnUrl: "r" }, cfg, vi.fn())).rejects.toThrow();
    await expect(createTransaction({ buyOrder: "x".repeat(27), sessionId: "u", amount: 1, returnUrl: "r" }, cfg, vi.fn())).rejects.toThrow();
  });
  it("commit usa PUT y rechaza tokens mal formados", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "AUTHORIZED", response_code: 0, amount: 45000, buy_order: "o1" })));
    await commitTransaction("a".repeat(64), cfg, fetchMock);
    expect(fetchMock.mock.calls[0][1].method).toBe("PUT");
    await expect(commitTransaction("../../etc", cfg, fetchMock)).rejects.toThrow();
  });
  it("solo aprueba si estado, código, monto y orden coinciden", () => {
    const ok = { status: "AUTHORIZED", response_code: 0, amount: 45000, buy_order: "o1" };
    expect(isApproved(ok, { amount: 45000, buyOrder: "o1" })).toBe(true);
    expect(isApproved({ ...ok, response_code: -1 }, { amount: 45000, buyOrder: "o1" })).toBe(false);
    expect(isApproved({ ...ok, status: "FAILED" }, { amount: 45000, buyOrder: "o1" })).toBe(false);
    expect(isApproved({ ...ok, amount: 1 }, { amount: 45000, buyOrder: "o1" })).toBe(false); // monto adulterado
    expect(isApproved({ ...ok, buy_order: "otra" }, { amount: 45000, buyOrder: "o1" })).toBe(false);
  });
});
