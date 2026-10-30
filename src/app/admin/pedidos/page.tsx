import { prisma } from "@/lib/prisma";
import { formatClp } from "@/lib/pricing";
import OrderStatus from "@/components/admin/OrderStatus";

export const metadata = { title: "Pedidos · Admin" };

export default async function AdminPedidos() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } }, items: { include: { product: { select: { name: true } } } } },
  });
  return (
    <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-400">{orders.length} pedidos (máx. 100 en pantalla)</p>
      <a href="/api/admin/orders/export" className="btn-ghost" download>⬇ Exportar CSV</a>
    </div>
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
          <tr><th className="px-4 py-2.5">Pedido</th><th className="px-4 py-2.5">Cliente / envío</th><th className="px-4 py-2.5">Productos</th><th className="px-4 py-2.5 text-right">Total</th><th className="px-4 py-2.5">Estado y seguimiento</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((o) => (
            <tr key={o.id} className="align-top">
              <td className="px-4 py-3"><span className="font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</span><span className="block text-xs text-slate-500">{o.createdAt.toLocaleString("es-CL")}</span></td>
              <td className="px-4 py-3">{o.user.email}<span className="block text-xs text-slate-500">{o.shippingName} · {o.shippingCity}</span></td>
              <td className="px-4 py-3 text-xs text-slate-300">{o.items.map((i) => <div key={i.id}>{i.quantity} × {i.product.name}</div>)}</td>
              <td className="px-4 py-3 text-right font-semibold">{formatClp(o.totalClp)}</td>
              <td className="px-4 py-3"><OrderStatus id={o.id} status={o.status} trackingCode={o.trackingCode} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
