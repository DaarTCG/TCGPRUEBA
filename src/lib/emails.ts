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

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  PREPARING: { title: "Estamos preparando tu pedido", body: "Tus cartas están siendo protegidas y empacadas." },
  SHIPPED: { title: "¡Tu pedido va en camino!", body: "Lo entregamos al courier." },
  DELIVERED: { title: "Tu pedido fue entregado", body: "Esperamos que disfrutes tus cartas. ¡Gracias por comprar en Hoenn TCG!" },
  CANCELLED: { title: "Tu pedido fue cancelado", body: "Si tienes dudas sobre el reembolso, responde a este correo." },
};

/** Correo de cambio de estado del pedido (con código de seguimiento si existe). Null si el estado no notifica. */
export function orderStatusEmail(o: { id: string; customerName: string; status: string; trackingCode?: string | null }) {
  const copy = STATUS_COPY[o.status];
  if (!copy) return null;
  const tracking = o.trackingCode ? `Código de seguimiento: ${o.trackingCode}` : "";
  return {
    subject: `${copy.title} · Pedido #${shortId(o.id)}`,
    text: [`Hola ${o.customerName},`, copy.body, tracking].filter(Boolean).join("\n"),
    html: wrap(
      copy.title,
      `<p>Hola ${escapeHtml(o.customerName)},</p><p>${copy.body}</p>${
        tracking ? `<p style="font-size:16px">Código de seguimiento: <b style="color:#4C8DFF">${escapeHtml(o.trackingCode!)}</b></p>` : ""
      }<p>Pedido <b>#${shortId(o.id)}</b></p>`,
    ),
  };
}
