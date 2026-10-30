import { describe, expect, it } from "vitest";
import { usdToClp, USD_TO_CLP } from "@/lib/pricing";

describe("Reglas de precios (1 USD = 900 CLP)", () => {
  it("usa la tasa fija de 900", () => expect(USD_TO_CLP).toBe(900));
  it("Latios & Latias GX alt-art: $1,200 USD → $1.080.000", () => expect(usdToClp(1200)).toBe(1_080_000));
  it("Latios IR #203: $25 USD → $22.500", () => expect(usdToClp(25)).toBe(22_500));
  it("Rayquaza VMAX alt-art: $400 USD → $360.000", () => expect(usdToClp(400)).toBe(360_000));
  it("redondea decimales a pesos enteros", () => expect(usdToClp(0.555)).toBe(500));
  it("rechaza precios negativos o inválidos", () => {
    expect(() => usdToClp(-1)).toThrow();
    expect(() => usdToClp(Number.NaN)).toThrow();
  });
});
