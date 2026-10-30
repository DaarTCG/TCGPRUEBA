"use client";
import { useState } from "react";
import { secureFetch } from "@/lib/csrf-client";
import { ORDER_LABEL } from "@/lib/orders";

export default function OrderStatus({ id, status, trackingCode }: { id: string; status: string; trackingCode: string | null }) {
  const [s, setS] = useState(status);
  const [t, setT] = useState(trackingCode ?? "");
  const [state, setState] = useState<"" | "saving" | "ok" | "err">("");

  async function save() {
    setState("saving");
    const res = await secureFetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s, trackingCode: t }),
    });
    setState(res.ok ? "ok" : "err");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Estado" value={s} onChange={(e) => setS(e.target.value)} className="input w-36 py-1.5">
        {Object.entries(ORDER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input aria-label="Código de seguimiento" value={t} onChange={(e) => setT(e.target.value)} placeholder="Tracking" maxLength={40} className="input w-32 py-1.5" />
      <button onClick={save} className="btn-primary py-1.5">Guardar</button>
      <span className="text-xs" aria-live="polite">{state === "ok" ? "✓" : state === "err" ? "✗ Error" : state === "saving" ? "…" : ""}</span>
    </div>
  );
}
