import { escapeHtml } from "./sanitize";
import { formatClp } from "./pricing";

type OrderMail = {
  id: string;
  customerName: string;
  totalClp: number;
  items: { name: string; quantity: number; unitPriceClp: number }[];
  shippingAddress: string;
  shippingCity: string;
};

const wrap = (title: string, body: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#0F172A;color:#E2E8F0;padding:24px;border-radius:12px">
<h1 style="font-size:20px;color:#FFD700;margin:0 0 16px">Hoenn TCG</h1><h2 style="font-size:18px;margin:0 0 12px">${title}</h2>${body}
<p style="color:#94A3B8;font-size:12px;margin-top:24px">Este correo se generó automáticamente. Si no hiciste este pedido, responde a este mensaje.</p></div>`;

export const shortId = (id: string) => id.slice(-8).toUpperCase();

/** Correo de confirmación de compra. Todo dato del usuario se escapa. */
export function orderConfirmationEmail(o: OrderMail) {
  const rows = o.items
    .map((i) => `<tr><td style="padding:6px 0">${i.quantity} × ${escapeHtml(i.name)}</td><td style="text-align:right">${formatClp(i.unitPriceClp * i.quantity)}</td></tr>`)
    .join("");
  const subject = `Pedido #${shortId(o.id)} confirmado · Hoenn TCG`;
  const html = wrap(
    `¡Gracias por tu compra, ${escapeHtml(o.customerName)}!`,
    `<p>Recibimos tu pago y estamos preparando tu pedido <b>#${shortId(o.id)}</b>.</p>
<table style="width:100%;border-collapse:collapse">${rows}
<tr><td style="padding-top:10px;border-top:1px solid #334155"><b>Total</b></td><td style="padding-top:10px;border-top:1px solid #334155;text-align:right;color:#00C853"><b>${formatClp(o.totalClp)}</b></td></tr></table>
<p>Envío a: ${escapeHtml(o.shippingAddress)}, ${escapeHtml(o.shippingCity)}</p>`,
  );
  const text = [
    `Gracias por tu compra, ${o.customerName}.`,
    `Pedido #${shortId(o.id)}`,
    ...o.items.map((i) => `${i.quantity} x ${i.name} — ${formatClp(i.unitPriceClp * i.quantity)}`),
    `Total: ${formatClp(o.totalClp)}`,
    `Envío a: ${o.shippingAddress}, ${o.shippingCity}`,
  ].join("\n");
  return { subject, html, text };
}
