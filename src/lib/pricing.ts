/** Tasa de cambio fija del negocio: 1 USD = $900 CLP. */
export const USD_TO_CLP = 900;

/** Convierte USD a CLP (entero, sin decimales). */
export function usdToClp(usd: number): number {
  if (!Number.isFinite(usd) || usd < 0) throw new Error("Precio USD inválido");
  return Math.round(usd * USD_TO_CLP);
}

const clpFormatter = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatClp = (n: number) => clpFormatter.format(n);
export const formatUsd = (n: number) => usdFormatter.format(n);
