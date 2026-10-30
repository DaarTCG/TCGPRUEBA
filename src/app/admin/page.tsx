import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatClp } from "@/lib/pricing";
import { ORDER_COLOR, ORDER_LABEL } from "@/lib/orders";
import AutoRefresh from "@/components/admin/AutoRefresh";
import { SalesChart, CategoryChart } from "@/components/admin/Charts";

export const metadata = { title: "Dashboard admin" };

const CAT: Record<string, string> = { SINGLE: "Singles", SEALED: "Sellados", GRADED: "Graduadas" };

export default async function AdminDashboard() {
  const since = new Date(Date.now() - 13 * 86400000);
  since.setHours(0, 0, 0, 0);

  const [orders, critical, visits, clients, recent, pendingSell] = await Promise.all([
    prisma.order.findMany({ where: { status: { not: "CANCELLED" } }, include: { items: { include: { product: { select: { category: true } } } } } }),
    prisma.product.findMany({ where: { enabled: true, available: true, stock: { lte: 2 } }, orderBy: { stock: "asc" } }),
    prisma.dailyVisit.findMany({ where: { day: { gte: since.toISOString().slice(0, 10) } } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.order.findMany({ take: 12, orderBy: { createdAt: "desc" }, include: { user: { select: { email: true, name: true } }, items: true } }),
    prisma.sellRequest.count({ where: { status: "NEW" } }),
  ]);

  const total = orders.reduce((a, o) => a + o.totalClp, 0);
  const cost = orders.reduce((a, o) => a + o.costClp, 0);
  const margin = total - cost;
  const marginPct = total ? (margin / total) * 100 : 0;
  const active = orders.filter((o) => ["PAID", "PREPARING", "SHIPPED"].includes(o.status)).length;

  // Serie diaria de 14 días
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000);
    return d.toISOString().slice(0, 10);
  });
  const recentOrders = orders.filter((o) => o.createdAt >= since);
  const salesByDay = days.map((day) => ({
    day: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
    ventas: recentOrders.filter((o) => o.createdAt.toISOString().slice(0, 10) === day).reduce((a, o) => a + o.totalClp, 0),
  }));
  const byCat = Object.entries(CAT).map(([k, label]) => ({
    categoria: label,
    ventas: orders.flatMap((o) => o.items).filter((i) => i.product.category === k).reduce((a, i) => a + i.unitPriceClp * i.quantity, 0),
  }));

  const visits14 = visits.reduce((a, v) => a + v.count, 0);
  const conversion = visits14 ? (recentOrders.length / visits14) * 100 : 0;
  const avgTicket = orders.length ? total / orders.length : 0;

  return (
    <div className="space-y-6">
      <AutoRefresh seconds={30} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Ventas totales" value={formatClp(total)} hint={`${orders.length} pedidos`} accent="border-t-latios" />
        <Kpi label="Margen de ganancia" value={formatClp(margin)} hint={`${marginPct.toFixed(1)}% sobre ventas`} accent="border-t-rayquaza" />
        <Kpi label="Órdenes activas" value={String(active)} hint="Pagadas, en preparación o enviadas" accent="border-t-latias" />
        <Kpi label="Inventario crítico" value={String(critical.length)} hint="Productos con stock ≤ 2" accent="border-t-rayquaza-gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="panel p-5">
          <h2 className="font-semibold">Ventas últimos 14 días (CLP)</h2>
          <div className="mt-3"><SalesChart data={salesByDay} /></div>
        </div>
        <div className="panel p-5">
          <h2 className="font-semibold">Ventas por categoría (CLP)</h2>
          <div className="mt-3"><CategoryChart data={byCat} /></div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <h2 className="font-semibold">Métricas de conversión · 14 días</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-400">Visitas</dt><dd className="font-display text-2xl font-bold">{visits14.toLocaleString("es-CL")}</dd></div>
            <div><dt className="text-slate-400">Pedidos</dt><dd className="font-display text-2xl font-bold">{recentOrders.length}</dd></div>
            <div><dt className="text-slate-400">Tasa de conversión</dt><dd className="font-display text-2xl font-bold">{conversion.toFixed(2)}%</dd></div>
            <div><dt className="text-slate-400">Ticket promedio</dt><dd className="font-display text-2xl font-bold">{formatClp(avgTicket)}</dd></div>
            <div><dt className="text-slate-400">Clientes</dt><dd className="font-display text-2xl font-bold">{clients}</dd></div>
            <div><dt className="text-slate-400">Colecciones nuevas</dt><dd className="font-display text-2xl font-bold"><Link href="/admin/colecciones" className="hover:underline">{pendingSell}</Link></dd></div>
          </dl>
        </div>
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Inventario crítico</h2>
            <Link href="/admin/productos" className="text-sm text-latios-glow hover:underline">Gestionar →</Link>
          </div>
          {critical.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Todo el inventario está sobre el mínimo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/5 text-sm">
              {critical.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{p.name}</span>
                  <span className={`badge ${p.stock === 0 ? "bg-latias/15 text-latias" : "bg-rayquaza-gold/15 text-rayquaza-gold"}`}>
                    {p.stock === 0 ? "⚠ Agotado" : `⚠ ${p.stock} en stock`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-semibold">Transacciones recientes</h2>
          <Link href="/admin/pedidos" className="text-sm text-latios-glow hover:underline">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-5 py-2.5">Pedido</th><th className="px-5 py-2.5">Cliente</th><th className="px-5 py-2.5">Fecha</th><th className="px-5 py-2.5">Ítems</th><th className="px-5 py-2.5">Estado</th><th className="px-5 py-2.5 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-white/[.03]">
                  <td className="px-5 py-2.5 font-mono text-xs">#{o.id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-2.5">{o.user.name ?? o.user.email}<span className="block text-xs text-slate-500">{o.user.email}</span></td>
                  <td className="px-5 py-2.5 text-slate-400">{o.createdAt.toLocaleDateString("es-CL")}</td>
                  <td className="px-5 py-2.5">{o.items.reduce((a, i) => a + i.quantity, 0)}</td>
                  <td className="px-5 py-2.5"><span className={`badge ${ORDER_COLOR[o.status]}`}>{ORDER_LABEL[o.status]}</span></td>
                  <td className="px-5 py-2.5 text-right font-semibold">{formatClp(o.totalClp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return (
    <div className={`panel border-t-2 p-5 ${accent}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
