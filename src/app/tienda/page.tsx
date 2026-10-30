import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_SLUGS, productSelect } from "@/lib/products";
import { trackVisit } from "@/lib/metrics";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Tienda" };

export default async function Tienda({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  await trackVisit();
  const cat = searchParams.cat && CATEGORY_SLUGS[searchParams.cat] ? searchParams.cat : undefined;
  const q = (searchParams.q ?? "").slice(0, 60);
  const products = await prisma.product.findMany({
    where: {
      enabled: true,
      ...(cat ? { category: CATEGORY_SLUGS[cat].db } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { setName: { contains: q } }] } : {}),
    },
    select: productSelect,
    orderBy: [{ available: "desc" }, { priceUsd: "desc" }],
  });

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">{cat ? CATEGORY_SLUGS[cat].label : "Todo el catálogo"}</h1>
      <p className="mt-1 text-slate-400">{cat ? CATEGORY_SLUGS[cat].desc : "Singles, sellados y graduadas."}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href="/tienda" className={`badge px-3 py-1.5 text-sm ${!cat ? "bg-latios text-white" : "bg-white/5 text-slate-300"}`}>Todo</Link>
        {Object.entries(CATEGORY_SLUGS).map(([slug, c]) => (
          <Link key={slug} href={`/tienda?cat=${slug}`} className={`badge px-3 py-1.5 text-sm ${cat === slug ? "bg-latios text-white" : "bg-white/5 text-slate-300"}`}>{c.label}</Link>
        ))}
        <form className="ml-auto w-full sm:w-64" action="/tienda">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <input name="q" defaultValue={q} placeholder="Buscar carta o set…" className="input" aria-label="Buscar" />
        </form>
      </div>

      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-400">No encontramos productos con ese filtro.</p>
      )}
    </div>
  );
}
