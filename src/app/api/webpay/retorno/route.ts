import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commitTransaction, isApproved } from "@/lib/webpay";
import { cancelPendingOrder, sendOrderConfirmation } from "@/lib/order-service";

/**
 * URL de retorno de Webpay Plus. Transbank redirige aquí (POST o GET) con:
 *  - token_ws: flujo normal → se confirma (commit) la transacción en el servidor.
 *  - TBK_TOKEN + TBK_ORDEN_COMPRA: el usuario anuló el pago.
 *  - TBK_ORDEN_COMPRA sin token: timeout del formulario.
 * No usa CSRF de cookie (es un POST cross-site de Transbank). La autenticidad se garantiza
 * porque solo un token válido de Transbank puede confirmarse con nuestras credenciales.
 */
async function handle(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  if (req.method === "POST") {
    const form = await req.formData().catch(() => null);
    form?.forEach((v, k) => typeof v === "string" && params.set(k, v));
  }
  const base = process.env.NEXTAUTH_URL ?? url.origin;
  const go = (path: string) => NextResponse.redirect(`${base}${path}`, 303);

  const tokenWs = params.get("token_ws");
  const tbkToken = params.get("TBK_TOKEN");
  const buyOrder = params.get("TBK_ORDEN_COMPRA");

  // Pago anulado por el usuario o formulario expirado
  if (!tokenWs || tbkToken) {
    if (buyOrder && /^[a-z0-9]{10,26}$/i.test(buyOrder)) await cancelPendingOrder(buyOrder);
    return go("/carrito?pago=cancelado");
  }

  const order = await prisma.order.findUnique({ where: { paymentToken: tokenWs.slice(0, 64) } });
  if (!order) return go("/carrito?pago=error");
  if (order.status !== "PENDING_PAYMENT") {
    // Retorno repetido (refresh): no se vuelve a confirmar
    return go(order.status === "CANCELLED" ? "/carrito?pago=rechazado" : `/cuenta?pedido=${order.id}`);
  }

  try {
    const result = await commitTransaction(tokenWs);
    if (isApproved(result, { amount: order.totalClp, buyOrder: order.id })) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date(), paymentAuthCode: result.authorization_code ?? null },
      });
      await sendOrderConfirmation(order.id);
      return go(`/cuenta?pedido=${order.id}`);
    }
  } catch (e) {
    console.error("Webpay commit:", e);
  }
  await cancelPendingOrder(order.id);
  return go("/carrito?pago=rechazado");
}

export const GET = handle;
export const POST = handle;
