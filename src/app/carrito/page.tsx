"use client";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/cart/CartContext";
import { formatClp } from "@/lib/pricing";
import { secureFetch } from "@/lib/csrf-client";

const PAGO_MSG: Record<string, string> = {
  cancelado: "Cancelaste el pago en Webpay. Tu carrito sigue aquí.",
  rechazado: "El pago fue rechazado. Puedes intentar con otra tarjeta.",
  error: "No pudimos verificar el pago. Si se hizo un cargo, contáctanos.",
};

/** Envía el token a Webpay con un formulario POST (requisito de Transbank). */
function redirectToWebpay(url: string, token: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "token_ws";
  input.value = token;
  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
}

export default function CartPage() {
  return (
    <Suspense>
      <CartView />
    </Suspense>
  );
}

function CartView() {
  const pago = useSearchParams().get("pago");
  const { items, totalClp, setQty, remove, clear, sync } = useCart();
  const [notes, setNotes] = useState<string[]>([]);
  const synced = useRef(false);

  // Al abrir el carrito, sincroniza precios y stock con el servidor una vez
  useEffect(() => {
    if (synced.current || !items.length) return;
    synced.current = true;
    sync().then(setNotes).catch(() => {});
  }, [items.length, sync]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function checkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await secureFetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingName: fd.get("shippingName"),
        shippingAddress: fd.get("shippingAddress"),
        shippingCity: fd.get("shippingCity"),
        phone: fd.get("phone"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "No se pudo procesar el pedido");
    if (data.redirect) {
      setBusy(true);
      return redirectToWebpay(data.redirect.url, data.redirect.token);
    }
    clear();
    router.push(`/cuenta?pedido=${data.orderId}`);
  }

  if (!items.length) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Tu carrito está vacío</h1>
        <Link href="/tienda" className="btn-primary mt-6">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Carrito</h1>
          <button onClick={clear} className="text-sm text-slate-400 hover:text-latias">Vaciar carrito</button>
        </div>
        {pago && PAGO_MSG[pago] && (
          <p className="mt-4 rounded-xl border border-latias/40 bg-latias/10 px-4 py-3 text-sm text-latias" role="alert">{PAGO_MSG[pago]}</p>
        )}
        {notes.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-xl border border-rayquaza-gold/40 bg-rayquaza-gold/10 px-4 py-3 text-sm text-rayquaza-gold" role="status">
            {notes.map((n) => <li key={n}>⚠ {n}</li>)}
          </ul>
        )}
        <ul className="mt-6 divide-y divide-white/10 panel">
          {items.map((i) => (
            <li key={i.productId} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/producto/${i.slug}`} className="font-semibold hover:underline">{i.name}</Link>
                <p className="price text-sm">{formatClp(i.priceClp)}</p>
              </div>
              <select aria-label={`Cantidad de ${i.name}`} value={i.quantity} onChange={(e) => setQty(i.productId, Number(e.target.value))} className="input w-20">
                {Array.from({ length: Math.min(i.maxStock, 10) }, (_, n) => n + 1).map((n) => <option key={n}>{n}</option>)}
              </select>
              <p className="w-28 text-right font-semibold">{formatClp(i.priceClp * i.quantity)}</p>
              <button onClick={() => remove(i.productId)} className="text-sm text-latias hover:underline">Quitar</button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">Los precios y el stock se validan nuevamente en el servidor al confirmar.</p>
      </section>

      <aside className="panel h-fit p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-300">Total</span>
          <span className="price text-3xl">{formatClp(totalClp)}</span>
        </div>
        {status === "loading" ? null : !session ? (
          <Link href="/login?callbackUrl=/carrito" className="btn-primary mt-6 w-full py-3">Inicia sesión para pagar</Link>
        ) : (
          <form onSubmit={checkout} className="mt-6 space-y-3">
            <div><label className="label" htmlFor="shippingName">Nombre de quien recibe</label><input id="shippingName" name="shippingName" required minLength={3} maxLength={100} className="input" defaultValue={session.user.name ?? ""} /></div>
            <div><label className="label" htmlFor="shippingAddress">Dirección</label><input id="shippingAddress" name="shippingAddress" required minLength={5} maxLength={200} className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="shippingCity">Ciudad</label><input id="shippingCity" name="shippingCity" required maxLength={80} className="input" /></div>
              <div><label className="label" htmlFor="phone">Teléfono</label><input id="phone" name="phone" required className="input" placeholder="+56 9 ..." /></div>
            </div>
            {error && <p className="rounded-lg bg-latias/10 px-3 py-2 text-sm text-latias" role="alert">{error}</p>}
            <button disabled={busy} className="btn-primary w-full py-3 text-base">{busy ? "Procesando…" : "Confirmar y pagar"}</button>
            <p className="text-center text-xs text-slate-500">{process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "webpay" ? "Pagarás de forma segura en Webpay (Transbank)." : "Pago simulado para desarrollo."}</p>
          </form>
        )}
      </aside>
    </div>
  );
}
