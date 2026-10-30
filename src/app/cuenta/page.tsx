import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatClp, usdToClp } from "@/lib/pricing";
import { ORDER_COLOR, ORDER_LABEL, ORDER_STEPS } from "@/lib/orders";
import ClearCart from "@/components/cart/ClearCart";

export const metadata = { title: "Mi cuenta" };

export default async function Cuenta({ searchParams }: { searchParams: { pedido?: string } }) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login?callbackUrl=/cuenta");

  const [user, orders, wishlist] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wishlistItem.findMany({ where: { userId: session.user.id }, include: { product: true }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="container-x py-10">
      {searchParams.pedido && (
        <>
          <ClearCart />
          <p className="mb-6 rounded-xl bg-rayquaza/10 px-4 py-3 text-rayquaza" role="status">✓ ¡Pedido confirmado! Puedes seguir su estado aquí abajo.</p>
        </>
      )}
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="panel h-fit p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-latios to-latias font-display text-xl font-bold">
            {(user.name ?? user.email)[0].toUpperCase()}
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">{user.name ?? "Mi perfil"}</h1>
          <p className="text-sm text-slate-400">{user.email}</p>
          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">Rol</dt><dd>{user.role === "ADMIN" ? "Administrador" : "Cliente"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Acceso</dt><dd className="capitalize">{user.provider}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Correo</dt><dd className="text-rayquaza">✓ Verificado</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">Pedidos</dt><dd>{orders.length}</dd></div>
          </dl>
          {user.role === "ADMIN" && <Link href="/admin" className="btn-ghost mt-5 w-full">Ir al panel admin</Link>}
        </aside>

        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl font-bold">Mis pedidos</h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-slate-400">Aún no tienes pedidos. <Link href="/tienda" className="text-latios-glow hover:underline">Ir a la tienda</Link></p>
            ) : (
              <ul className="mt-4 space-y-4">
                {orders.map((o) => {
                  const stepIdx = ORDER_STEPS.indexOf(o.status as (typeof ORDER_STEPS)[number]);
                  return (
                    <li key={o.id} className={`panel p-5 ${o.id === searchParams.pedido ? "ring-2 ring-rayquaza" : ""}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-xs text-slate-500">#{o.id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm text-slate-400">{o.createdAt.toLocaleDateString("es-CL", { dateStyle: "medium" })}</p>
                        </div>
                        <span className={`badge ${ORDER_COLOR[o.status]}`}>{ORDER_LABEL[o.status]}</span>
                        <p className="price text-lg">{formatClp(o.totalClp)}</p>
                      </div>
                      <ul className="mt-3 text-sm text-slate-300">
                        {o.items.map((i) => (
                          <li key={i.id}>{i.quantity} × <Link href={`/producto/${i.product.slug}`} className="hover:underline">{i.product.name}</Link></li>
                        ))}
                      </ul>
                      {o.status !== "CANCELLED" && (
                        <ol className="mt-4 grid grid-cols-4 gap-1" aria-label="Seguimiento del envío">
                          {ORDER_STEPS.map((s, i) => (
                            <li key={s} className="text-center text-[11px]">
                              <div className={`h-1.5 rounded-full ${i <= stepIdx ? "bg-rayquaza" : "bg-white/10"}`} />
                              <span className={i <= stepIdx ? "text-slate-200" : "text-slate-500"}>{ORDER_LABEL[s]}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                      {o.trackingCode && <p className="mt-3 text-sm">Código de seguimiento: <span className="font-mono text-latios-glow">{o.trackingCode}</span></p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">Wishlist</h2>
            {wishlist.length === 0 ? (
              <p className="mt-4 text-slate-400">Tu wishlist está vacía. Toca ♡ en cualquier producto para guardarlo.</p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {wishlist.map((w) => (
                  <li key={w.id} className="panel flex items-center justify-between gap-3 p-4">
                    <Link href={`/producto/${w.product.slug}`} className="font-semibold hover:underline">{w.product.name}</Link>
                    <span className="price text-sm">{w.product.priceUsd > 0 ? formatClp(usdToClp(w.product.priceUsd)) : "Consultar"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
