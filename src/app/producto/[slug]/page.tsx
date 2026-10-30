import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatClp, formatUsd, usdToClp, USD_TO_CLP } from "@/lib/pricing";
import CardArt from "@/components/CardArt";
import ProductActions from "@/components/ProductActions";

const CAT_LABEL: Record<string, string> = { SINGLE: "Singles", SEALED: "Sellados", GRADED: "Graduadas" };
const CAT_SLUG: Record<string, string> = { SINGLE: "singles", SEALED: "sellados", GRADED: "graduadas" };

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug.slice(0, 120) } });
  if (!p || !p.enabled) notFound();
  await prisma.product.update({ where: { id: p.id }, data: { views: { increment: 1 } } });

  const session = await getSession();
  const inWishlist = session?.user?.id
    ? Boolean(await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId: session.user.id, productId: p.id } } }))
    : false;
  const canBuy = p.available && p.stock > 0 && p.priceUsd > 0;
  const priceClp = p.priceUsd > 0 ? usdToClp(p.priceUsd) : 0;

  return (
    <div className="container-x py-10">
      <nav className="mb-6 text-sm text-slate-400" aria-label="Migas">
        <Link href="/tienda" className="hover:text-white">Tienda</Link> /{" "}
        <Link href={`/tienda?cat=${CAT_SLUG[p.category]}`} className="hover:text-white">{CAT_LABEL[p.category]}</Link> /{" "}
        <span className="text-slate-200">{p.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <CardArt {...p} size="lg" />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {p.rarity && <span className={`badge ${p.isSecret ? "bg-rayquaza-gold/15 text-rayquaza-gold ring-1 ring-rayquaza-gold/40" : "bg-latios/20 text-blue-300"}`}>{p.rarity}</span>}
            {p.grade && <span className="badge bg-white/10 text-white">{p.grade}</span>}
            {canBuy ? (
              <span className="badge bg-rayquaza/15 text-rayquaza">✓ En stock ({p.stock})</span>
            ) : (
              <span className="badge bg-latias/15 text-latias">{p.available ? "Sin stock" : "No disponible"}</span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{p.name}</h1>
          <p className="mt-1 text-slate-400">{p.setName}{p.number ? ` · ${p.number}` : ""}</p>

          <div className="panel mt-6 p-5">
            {p.priceUsd > 0 ? (
              <>
                <p className={`price text-4xl ${canBuy ? "" : "text-slate-400"}`}>{formatClp(priceClp)}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {p.category === "GRADED" ? "Referencia" : "TCGPlayer avg"} {formatUsd(p.priceUsd)} × ${USD_TO_CLP} CLP
                </p>
              </>
            ) : (
              <p className="text-lg text-slate-300">Precio a consultar</p>
            )}
            {p.referenceNote && <p className="mt-2 text-sm text-rayquaza-gold">{p.referenceNote}</p>}
          </div>

          <p className="mt-6 leading-relaxed text-slate-300">{p.description}</p>

          <ProductActions productId={p.id} slug={p.slug} name={p.name} priceClp={priceClp} stock={p.stock} canBuy={canBuy} inWishlist={inWishlist} />
        </div>
      </div>
    </div>
  );
}
