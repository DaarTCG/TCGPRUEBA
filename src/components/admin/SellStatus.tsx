"use client";
import { useState } from "react";
import { secureFetch } from "@/lib/csrf-client";

export const SELL_LABEL: Record<string, string> = { NEW: "Nueva", CONTACTED: "Contactado", CLOSED: "Cerrada" };
const COLOR: Record<string, string> = {
  NEW: "bg-latias/15 text-latias",
  CONTACTED: "bg-rayquaza-gold/15 text-rayquaza-gold",
  CLOSED: "bg-rayquaza/15 text-rayquaza",
};

export default function SellStatus({ id, status }: { id: string; status: string }) {
  const [s, setS] = useState(status);
  const [err, setErr] = useState(false);

  async function change(next: string) {
    const prev = s;
    setS(next);
    setErr(false);
    const res = await secureFetch(`/api/admin/sell/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setS(prev);
      setErr(true);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`badge ${COLOR[s]}`}>{SELL_LABEL[s]}</span>
      <select aria-label="Cambiar estado" value={s} onChange={(e) => change(e.target.value)} className="input w-auto py-1 text-xs">
        {Object.entries(SELL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {err && <span className="text-xs text-latias" role="alert">Error</span>}
    </div>
  );
}
