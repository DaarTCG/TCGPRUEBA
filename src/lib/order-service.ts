import { prisma } from "./prisma";
import { sendMail } from "./mail";
import { orderConfirmationEmail } from "./emails";

/** Envía el correo de confirmación de un pedido pagado. Nunca lanza error. */
export async function sendOrderConfirmation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true } }, items: { include: { product: { select: { name: true } } } } },
  });
  if (!order) return;
  const mail = orderConfirmationEmail({
    id: order.id,
    customerName: order.shippingName,
    totalClp: order.totalClp,
    items: order.items.map((i) => ({ name: i.product.name, quantity: i.quantity, unitPriceClp: i.unitPriceClp })),
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
  });
  await sendMail({ to: order.user.email, ...mail }).catch((e) => console.error("Correo de pedido no enviado:", e));
}

/** Cancela un pedido pendiente de pago y devuelve el stock reservado (idempotente). */
export async function cancelPendingOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const r = await tx.order.updateMany({ where: { id: orderId, status: "PENDING_PAYMENT" }, data: { status: "CANCELLED" } });
    if (r.count !== 1) return false;
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const it of items) {
      await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
    }
    return true;
  });
}
