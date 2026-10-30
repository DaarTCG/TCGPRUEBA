"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "./cart/CartContext";
import { secureFetch } from "@/lib/csrf-client";

type Props = { productId: string; slug: string; name: string; priceClp: number; stock: number; canBuy: boolean; inWishlist: boolean };

export default function ProductActions({ productId, slug, name, priceClp, stock, canBuy, inWishlist }: Props) {
  const { add } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wish, setWish] = useState(inWishlist);
  const [busy, setBusy] = useState(false);

  async function toggleWish() {
    if (!session) return router.push(`/login?callbackUrl=/producto/${slug}`);
    setBusy(true);
    const res = await secureFetch("/api/wishlist", {
      method: wish ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) setWish(!wish);
    setBusy(false);
  }

  return (
    <div className="mt-6 space-y-3">
      {canBuy ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="qty">Cantidad</label>
          <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input w-24">
            {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <button
            className="btn-primary flex-1 py-3 text-base sm:flex-none sm:px-8"
            onClick={() => {
              add({ productId, slug, name, priceClp, maxStock: stock }, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
          >
            {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-latias/40 bg-latias/10 px-4 py-3 text-sm font-semibold text-latias" role="status">
          Sin stock / No disponible por ahora
        </div>
      )}
      <button onClick={toggleWish} disabled={busy} className="btn-ghost" aria-pressed={wish}>
        <span className={wish ? "text-latias" : ""}>{wish ? "♥" : "♡"}</span> {wish ? "En tu wishlist" : "Agregar a wishlist"}
      </button>
    </div>
  );
}
