import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { productSelect } from "@/lib/products";
import { trackVisit } from "@/lib/metrics";
import ProductCard from "@/components/ProductCard";
import CardArt from "@/components/CardArt";
import { USD_TO_CLP } from "@/lib/pricing";

export default async function Home() {
  await trackVisit();
  const [singles, sealed, graded] = await Promise.all([
    prisma.product.findMany({ where: { enabled: true, category: "SINGLE" }, select: productSelect, orderBy: { priceUsd: "desc" } }),
    prisma.product.findMany({ where: { enabled: true, category: "SEALED" }, select: productSelect, orderBy: { priceUsd: "desc" }, take: 4 }),
    prisma.product.findMany({ where: { enabled: true, category: "GRADED" }, select: productSelect }),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="container-x grid items-center gap-10 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
        <div>
          <p className="badge mb-4 bg-white/5 text-slate-300 ring-1 ring-white/10">Latios · Latias · Rayquaza</p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
            Cartas legendarias de <span className="holo-text">Hoenn</span>, al precio justo.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Singles, sellados y graduadas de Pokémon TCG con precios en pesos chilenos calculados desde TCGPlayer
            (1 USD = ${USD_TO_CLP} CLP).
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tienda?cat=singles" className="btn-primary px-6 py-3 text-base">Explorar singles</Link>
            <Link href="/vende-tus-cartas" className="btn-secondary px-6 py-3 text-base">Vende tu colección</Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
            <div><dt className="text-slate-400">Envíos</dt><dd className="font-semibold">Todo Chile</dd></div>
            <div><dt className="text-slate-400">Pagos</dt><dd className="font-semibold">Seguros</dd></div>
            <div><dt className="text-slate-400">Autenticidad</dt><dd className="font-semibold text-rayquaza">Verificada</dd></div>
          </dl>
        </div>
        <div className="relative mx-auto grid w-full max-w-md grid-cols-3 items-end gap-3">
          {singles.slice(0, 3).map((p, i) => (
            <div key={p.id} className={i === 1 ? "-translate-y-6 scale-110" : "opacity-90"}>
              <CardArt {...p} />
            </div>
          ))}
        </div>
      </section>

      <Section title="Singles destacados" href="/tienda?cat=singles" accent="text-latios-glow">
        {singles.map((p) => <ProductCard key={p.id} p={p} />)}
      </Section>

      <Section title="Sellados" href="/tienda?cat=sellados" accent="text-rayquaza">
        {sealed.map((p) => <ProductCard key={p.id} p={p} />)}
      </Section>

      <Section title="Graduadas · alta gama" href="/tienda?cat=graduadas" accent="text-rayquaza-gold">
        {graded.map((p) => <ProductCard key={p.id} p={p} />)}
      </Section>

      {/* CTA venta */}
      <section className="container-x mt-16">
        <div className="panel relative overflow-hidden p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-latias/25 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold">¿Tienes una colección? <span className="text-latias">La compramos.</span></h2>
            <p className="mt-3 text-slate-300">Binders, sellados o graduadas. Envíanos fotos y tu valor estimado, y te contactamos con una oferta.</p>
            <Link href="/vende-tus-cartas" className="btn-secondary mt-6 px-6 py-3">Cotizar mi colección</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, href, accent, children }: { title: string; href: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="container-x mt-14">
      <div className="mb-5 flex items-end justify-between">
        <h2 className={`font-display text-2xl font-bold ${accent}`}>{title}</h2>
        <Link href={href} className="text-sm text-slate-400 hover:text-white">Ver todo →</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </section>
  );
}
