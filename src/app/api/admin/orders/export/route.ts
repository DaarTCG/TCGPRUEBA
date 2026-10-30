import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { toCsv } from "@/lib/csv";
import { ORDER_LABEL } from "@/lib/orders";

/** Descarga todos los pedidos en CSV (solo admin). */
export async function GET() {
  if (!(await requireAdmin())) return jsonError("Prohibido", 403);
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } }, items: { include: { product: { select: { name: true } } } } },
  });
  const csv = toCsv(
    ["Pedido", "Fecha", "Cliente", "Estado", "Productos", "Total CLP", "Costo CLP", "Margen CLP", "Ciudad", "Tracking"],
    orders.map((o) => [
      o.id,
      o.createdAt.toISOString(),
      o.user.email,
      ORDER_LABEL[o.status] ?? o.status,
      o.items.map((i) => `${i.quantity}x ${i.product.name}`).join(" | "),
      o.totalClp,
      o.costClp,
      o.totalClp - o.costClp,
      o.shippingCity,
      o.trackingCode ?? "",
    ]),
  );
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
