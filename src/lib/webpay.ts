/**
 * Cliente mínimo de Transbank Webpay Plus (API REST v1.2).
 * Docs: https://www.transbankdevelopers.cl/referencia/webpay
 */
export const WEBPAY_INTEGRATION = {
  commerceCode: "597055555532",
  apiKey: "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C",
  baseUrl: "https://webpay3gint.transbank.cl",
};
const PRODUCTION_URL = "https://webpay3g.transbank.cl";
const PATH = "/rswebpaytransaction/api/webpay/v1.2/transactions";

export type WebpayConfig = { commerceCode: string; apiKey: string; baseUrl: string };

export function webpayConfig(env: Record<string, string | undefined> = process.env): WebpayConfig {
  if (env.WEBPAY_ENV === "production") {
    if (!env.WEBPAY_COMMERCE_CODE || !env.WEBPAY_API_KEY) throw new Error("Faltan WEBPAY_COMMERCE_CODE / WEBPAY_API_KEY de producción");
    return { commerceCode: env.WEBPAY_COMMERCE_CODE, apiKey: env.WEBPAY_API_KEY, baseUrl: PRODUCTION_URL };
  }
  return {
    commerceCode: env.WEBPAY_COMMERCE_CODE || WEBPAY_INTEGRATION.commerceCode,
    apiKey: env.WEBPAY_API_KEY || WEBPAY_INTEGRATION.apiKey,
    baseUrl: WEBPAY_INTEGRATION.baseUrl,
  };
}

export const isWebpayEnabled = (env: Record<string, string | undefined> = process.env) => env.PAYMENT_PROVIDER === "webpay";

type Fetch = typeof fetch;

async function call<T>(cfg: WebpayConfig, method: "POST" | "PUT", url: string, body: unknown, fetchImpl: Fetch): Promise<T> {
  const res = await fetchImpl(url, {
    method,
    headers: { "Tbk-Api-Key-Id": cfg.commerceCode, "Tbk-Api-Key-Secret": cfg.apiKey, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Webpay respondió ${res.status}`);
  return res.json() as Promise<T>;
}

/** Crea la transacción. Devuelve token y URL a la que el navegador debe enviar `token_ws` por POST. */
export async function createTransaction(
  input: { buyOrder: string; sessionId: string; amount: number; returnUrl: string },
  cfg = webpayConfig(),
  fetchImpl: Fetch = fetch,
) {
  if (input.buyOrder.length > 26) throw new Error("buy_order supera 26 caracteres");
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error("Monto inválido");
  return call<{ token: string; url: string }>(cfg, "POST", cfg.baseUrl + PATH, {
    buy_order: input.buyOrder,
    session_id: input.sessionId.slice(0, 61),
    amount: input.amount,
    return_url: input.returnUrl,
  }, fetchImpl);
}

export type CommitResponse = {
  status: string;
  response_code: number;
  amount: number;
  buy_order: string;
  authorization_code?: string;
};

/** Confirma la transacción (obligatorio dentro de los 5 minutos posteriores al retorno). */
export async function commitTransaction(token: string, cfg = webpayConfig(), fetchImpl: Fetch = fetch) {
  if (!/^[a-f0-9]{64}$/i.test(token)) throw new Error("Token inválido");
  return call<CommitResponse>(cfg, "PUT", `${cfg.baseUrl}${PATH}/${token}`, undefined, fetchImpl);
}

/** Pago aprobado solo si está AUTHORIZED, con código 0, y si el monto y la orden coinciden con lo esperado. */
export function isApproved(r: CommitResponse, expected: { amount: number; buyOrder: string }) {
  return r.status === "AUTHORIZED" && r.response_code === 0 && r.amount === expected.amount && r.buy_order === expected.buyOrder;
}
