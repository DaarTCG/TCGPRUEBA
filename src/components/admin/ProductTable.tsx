"use client";
import { useState } from "react";
import { secureFetch } from "@/lib/csrf-client";
import { formatClp, usdToClp } from "@/lib/pricing";

type Row = { id: string; name: string; category: string; priceUsd: number; costUsd: number; stock: number; enabled: boolean; available: boolean; imageUrl: string | null };

const CAT: Record<string, string> = { SINGLE: "Single", SEALED: "Sellado", GRADED: "Graduada" };

export default function ProductTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>("");

  const patch = (id: string, data: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...data } : x)));

  async function save(row: Row, override?: Partial<Row>) {
    const next = { ...row, ...override };
    setSaving(row.id);
    setMsg("");
    const res = await secureFetch(`/api/admin/products/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceUsd: Number(next.priceUsd), stock: Number(next.stock), enabled: next.enabled, available: next.available, imageUrl: next.imageUrl || "" }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(null);
    if (res.ok) {
      patch(row.id, data.product);
      setMsg(`✓ ${row.name} actualizado`);
    } else setMsg(`✗ ${data.error ?? "Error al guardar"}`);
  }

  return (
    <div className="panel overflow-hidden">
      <p className="min-h-[2.25rem] px-5 pt-3 text-sm text-slate-300" aria-live="polite">{msg}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-2.5">Producto</th><th className="px-4 py-2.5">Precio USD</th><th className="px-4 py-2.5">Precio CLP</th>
              <th className="px-4 py-2.5">Stock</th><th className="px-4 py-2.5">Habilitado</th><th className="px-4 py-2.5">Disponible</th><th className="px-4 py-2.5">Imagen (URL https)</th><th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.id} className={r.enabled ? "" : "opacity-60"}>
                <td className="px-4 py-2.5"><span className="font-medium">{r.name}</span><span className="block text-xs text-slate-500">{CAT[r.category]}</span></td>
                <td className="px-4 py-2.5"><input aria-label={`Precio USD de ${r.name}`} type="number" min={0} step="0.01" value={r.priceUsd} onChange={(e) => patch(r.id, { priceUsd: Number(e.target.value) })} className="input w-28 py-1.5" /></td>
                <td className="price px-4 py-2.5">{r.priceUsd > 0 ? formatClp(usdToClp(r.priceUsd || 0)) : "—"}</td>
                <td className="px-4 py-2.5"><input aria-label={`Stock de ${r.name}`} type="number" min={0} value={r.stock} onChange={(e) => patch(r.id, { stock: Number(e.target.value) })} className={`input w-20 py-1.5 ${r.stock <= 2 ? "border-rayquaza-gold/60" : ""}`} /></td>
                <td className="px-4 py-2.5"><Toggle label="Habilitado" on={r.enabled} onChange={(v) => { patch(r.id, { enabled: v }); save(r, { enabled: v }); }} /></td>
                <td className="px-4 py-2.5"><Toggle label="Disponible" on={r.available} onChange={(v) => { patch(r.id, { available: v }); save(r, { available: v }); }} /></td>
                <td className="px-4 py-2.5"><input aria-label={`Imagen de ${r.name}`} type="url" placeholder="https://…" value={r.imageUrl ?? ""} onChange={(e) => patch(r.id, { imageUrl: e.target.value })} className="input w-48 py-1.5" /></td>
                <td className="px-4 py-2.5"><button onClick={() => save(r)} disabled={saving === r.id} className="btn-primary py-1.5">{saving === r.id ? "…" : "Guardar"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-rayquaza" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
