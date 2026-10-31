import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_SLUGS, productSelect } from "@/lib/products";
import { trackVisit } from "@/lib/metrics";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Tienda" };

const SORTS: Record<string, { label: string; orderBy: Record<string, "asc" | "desc"> }> = {
  destacados: { label: "Destacados", orderBy: { priceUsd: "desc" } },
  "precio-asc": { label: "Precio: menor a mayor", orderBy: { priceUsd: "asc" } },
  "precio-desc": { label: "Precio: mayor a menor", orderBy: { priceUsd: "desc" } },
  nombre: { label: "Nombre A-Z", orderBy: { name: "asc" } },
  recientes: { label: "Más recientes", orderBy: { createdAt: "desc" } },
};

export default async function Tienda(props: { searchParams: Promise<{ cat?: string; q?: string; orden?: string }> }) {
  const searchParams = await props.searchParams;
  await trackVisit();
  const cat = searchParams.cat && CATEGORY_SLUGS[searchParams.cat] ? searchParams.cat : undefined;
  const q = (searchParams.q ?? "").slice(0, 60);
  const orden = searchParams.orden && SORTS[searchParams.orden] ? searchParams.orden : "destacados";
  const products = await prisma.product.findMany({
    where: {
      enabled: true,
      ...(cat ? { category: CATEGORY_SLUGS[cat].db } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { setName: { contains: q } }] } : {}),
    },
    select: productSelect,
    orderBy: [{ available: "desc" }, SORTS[orden].orderBy],
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
        <form className="ml-auto flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap" action="/tienda">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <input name="q" defaultValue={q} placeholder="Buscar carta o set…" className="input basis-full sm:basis-auto sm:w-56" aria-label="Buscar" />
          <select name="orden" defaultValue={orden} className="input min-w-0 flex-1 sm:w-auto sm:flex-none" aria-label="Ordenar por">
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button className="btn-ghost">Aplicar</button>
        </form>
      </div>

      <p className="mt-4 text-sm text-slate-500" aria-live="polite">{products.length} producto(s){q ? ` para "${q}"` : ""}</p>

      {products.length ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      ) : (
        <p className="mt-16 text-center text-slate-400">No encontramos productos con ese filtro.</p>
      )}
    </div>
  );
}
