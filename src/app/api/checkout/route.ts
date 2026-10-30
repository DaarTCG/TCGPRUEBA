import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { csrfGuard, jsonError, rateGuard } from "@/lib/api";
import { checkoutSchema } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { usdToClp } from "@/lib/pricing";
import { sendOrderConfirmation, cancelPendingOrder } from "@/lib/order-service";
import { isWebpayEnabled, createTransaction } from "@/lib/webpay";

export async function POST(req: Request) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  const limited = rateGuard(req, "checkout");
  if (limited) return limited;
  const session = await getSession();
  if (!session?.user?.id) return jsonError("Debes iniciar sesión", 401);

  const parsed = checkoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  const data = parsed.data;

  // Unificar cantidades por producto
  const qtyById = new Map<string, number>();
  for (const i of data.items) qtyById.set(i.productId, (qtyById.get(i.productId) ?? 0) + i.quantity);

  const webpay = isWebpayEnabled();
  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: [...qtyById.keys()] } } });
      if (products.length !== qtyById.size) throw new Error("Un producto ya no existe");

      let totalClp = 0;
      let costClp = 0;
      const items = products.map((p) => {
        const qty = qtyById.get(p.id)!;
        if (!p.enabled || !p.available || p.priceUsd <= 0) throw new Error(`${p.name} no está disponible`);
        if (p.stock < qty) throw new Error(`Stock insuficiente para ${p.name}`);
        // Precio SIEMPRE desde la BD (nunca desde el cliente)
        const unit = usdToClp(p.priceUsd);
        const unitCost = usdToClp(p.costUsd);
        totalClp += unit * qty;
        costClp += unitCost * qty;
        return { productId: p.id, quantity: qty, unitPriceClp: unit, unitCostClp: unitCost };
      });

      for (const it of items) {
        const r = await tx.product.updateMany({
          where: { id: it.productId, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity } },
        });
        if (r.count !== 1) throw new Error("Stock insuficiente");
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          status: webpay ? "PENDING_PAYMENT" : "PAID",
          paymentProvider: webpay ? "webpay" : "simulado",
          paidAt: webpay ? null : new Date(),
          totalClp,
          costClp,
          shippingName: sanitizeText(data.shippingName, 100),
          shippingAddress: sanitizeText(data.shippingAddress, 200),
          shippingCity: sanitizeText(data.shippingCity, 80),
          phone: data.phone,
          items: { create: items },
        },
      });
    });

    if (webpay) {
      // El stock queda reservado; si Webpay falla, se libera
      try {
        const base = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
        const tx = await createTransaction({ buyOrder: order.id, sessionId: session.user.id, amount: order.totalClp, returnUrl: `${base}/api/webpay/retorno` });
        await prisma.order.update({ where: { id: order.id }, data: { paymentToken: tx.token } });
        return NextResponse.json({ orderId: order.id, redirect: { url: tx.url, token: tx.token } });
      } catch (e) {
        console.error("Webpay create:", e);
        await cancelPendingOrder(order.id);
        return jsonError("No pudimos conectar con Webpay. Intenta de nuevo.", 502);
      }
    }

    await sendOrderConfirmation(order.id);
    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "No se pudo crear el pedido", 409);
  }
}
