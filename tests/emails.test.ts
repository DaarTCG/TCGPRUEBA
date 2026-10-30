import { describe, expect, it } from "vitest";
import { orderConfirmationEmail, shortId } from "@/lib/emails";

const order = {
  id: "clxabc123def456",
  customerName: '<img src=x onerror="alert(1)">Ash',
  totalClp: 45000,
  items: [{ name: "Latios Illustration Rare", quantity: 2, unitPriceClp: 22500 }],
  shippingAddress: "Av. Siempre Viva 742",
  shippingCity: "Santiago",
};

describe("Correo de confirmación de pedido", () => {
  const mail = orderConfirmationEmail(order);
  it("asunto con número corto de pedido", () => expect(mail.subject).toContain(`#${shortId(order.id)}`));
  it("escapa HTML del usuario (sin XSS en el correo)", () => {
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
  });
  it("incluye ítems y total en CLP", () => {
    expect(mail.text).toContain("2 x Latios Illustration Rare");
    expect(mail.text).toMatch(/Total: \$45\.000/);
  });
});
