import Link from "next/link";
import CardArt from "./CardArt";
import { formatClp, formatUsd, usdToClp } from "@/lib/pricing";

export type ProductView = {
  id: string;
  slug: string;
  name: string;
  category: string;
  setName: string;
  number: string | null;
  rarity: string | null;
  priceUsd: number;
  stock: number;
  available: boolean;
  theme: string;
  isSecret: boolean;
  imageUrl: string | null;
  grade: string | null;
  referenceNote: string | null;
};

export default function ProductCard({ p }: { p: ProductView }) {
  const soldOut = !p.available || p.stock <= 0;
  return (
    <Link href={`/producto/${p.slug}`} className="group panel flex flex-col p-3 transition hover:-translate-y-1 hover:shadow-neon-blue">
      <CardArt {...p} />
      <div className="mt-3 flex flex-1 flex-col">
        <div className="flex flex-wrap gap-1.5">
          {p.rarity && (
            <span className={`badge ${p.isSecret ? "bg-rayquaza-gold/15 text-rayquaza-gold" : "bg-latios/20 text-blue-300"}`}>{p.rarity}</span>
          )}
          {soldOut ? (
            <span className="badge bg-latias/15 text-latias">{p.available ? "Sin stock" : "No disponible"}</span>
          ) : (
            <span className="badge bg-rayquaza/15 text-rayquaza">✓ Stock: {p.stock}</span>
          )}
        </div>
        <h3 className="mt-2 font-semibold leading-snug text-slate-100 group-hover:text-white">{p.name}</h3>
        <p className="text-xs text-slate-400">{p.setName}{p.number ? ` · ${p.number}` : ""}</p>
        <div className="mt-auto pt-3">
          {p.priceUsd > 0 ? (
            <>
              <p className={`price text-lg ${soldOut ? "text-slate-400" : ""}`}>{formatClp(usdToClp(p.priceUsd))}</p>
              <p className="text-xs text-slate-500">{soldOut && !p.available ? "Referencia " : "TCGPlayer avg "}{formatUsd(p.priceUsd)}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400">{p.referenceNote ?? "Consultar"}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
