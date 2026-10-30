"use client";
import { useState } from "react";
import { getCsrfToken } from "@/lib/csrf-client";

const MAX_FILES = 6;
const MAX_MB = 5;

export default function SellForm() {
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    const valid = list.filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    if (valid.length !== list.length) setStatus({ ok: false, text: `Solo JPG, PNG o WEBP de hasta ${MAX_MB} MB.` });
    setFiles(valid.slice(0, MAX_FILES));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("photos");
    files.forEach((f) => fd.append("photos", f));
    const res = await fetch("/api/sell", { method: "POST", body: fd, headers: { "x-csrf-token": getCsrfToken() } });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setStatus({ ok: true, text: "¡Recibimos tu colección! Te contactaremos por correo o teléfono en menos de 48 horas." });
      (e.target as HTMLFormElement).reset();
      setFiles([]);
    } else {
      setStatus({ ok: false, text: data.error ?? "No se pudo enviar el formulario." });
    }
  }

  if (status?.ok) return <div className="panel p-8 text-center text-rayquaza" role="status"><p className="text-4xl">✓</p><p className="mt-2 text-lg">{status.text}</p></div>;

  return (
    <form onSubmit={onSubmit} className="panel grid gap-4 p-6 sm:grid-cols-2" encType="multipart/form-data">
      <div className="sm:col-span-2"><label className="label" htmlFor="fullName">Nombre completo *</label><input id="fullName" name="fullName" required minLength={3} maxLength={100} autoComplete="name" className="input" /></div>
      <div><label className="label" htmlFor="email">Correo electrónico *</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
      <div><label className="label" htmlFor="phone">Teléfono *</label><input id="phone" name="phone" required placeholder="+56 9 1234 5678" autoComplete="tel" className="input" /></div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="description">Descripción de la colección *</label>
        <textarea id="description" name="description" required minLength={20} maxLength={4000} rows={6} className="input" placeholder="Cartas destacadas, estado (binder / sellado / graduadas), cantidad aproximada, idioma…" />
      </div>
      <div><label className="label" htmlFor="estimatedValue">Valor estimado *</label><input id="estimatedValue" name="estimatedValue" type="number" min={0} step="any" required className="input" /></div>
      <div><label className="label" htmlFor="currency">Moneda</label><select id="currency" name="currency" className="input"><option value="CLP">CLP</option><option value="USD">USD</option></select></div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="photos">Fotos de las cartas / binder (hasta {MAX_FILES}, {MAX_MB} MB c/u)</label>
        <input id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onFiles} className="input file:mr-3 file:rounded-lg file:border-0 file:bg-latios file:px-3 file:py-1.5 file:text-white" />
        {files.length > 0 && <p className="mt-1 text-xs text-slate-400">{files.length} archivo(s): {files.map((f) => f.name).join(", ")}</p>}
      </div>
      {status && !status.ok && <p className="rounded-lg bg-latias/10 px-3 py-2 text-sm text-latias sm:col-span-2" role="alert">{status.text}</p>}
      <button disabled={busy} className="btn-secondary py-3 text-base sm:col-span-2">{busy ? "Enviando…" : "Enviar mi colección"}</button>
    </form>
  );
}
