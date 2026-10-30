"use client";
import { useState } from "react";
import { secureFetch } from "@/lib/csrf-client";

export default function RegisterForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("confirm")) {
      setBusy(false);
      return setMsg({ ok: false, text: "Las contraseñas no coinciden." });
    }
    const res = await secureFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: data.message } : { ok: false, text: data.error ?? "Error al registrar" });
  }

  if (msg?.ok) return <p className="rounded-lg bg-rayquaza/10 px-4 py-3 text-rayquaza" role="status">✓ {msg.text}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label className="label" htmlFor="name">Nombre</label><input id="name" name="name" required minLength={2} maxLength={80} autoComplete="name" className="input" /></div>
      <div><label className="label" htmlFor="email">Correo</label><input id="email" name="email" type="email" required autoComplete="email" className="input" /></div>
      <div>
        <label className="label" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={10} maxLength={128} autoComplete="new-password" className="input" />
        <p className="mt-1 text-xs text-slate-500">Mínimo 10 caracteres, con mayúscula, minúscula, número y símbolo.</p>
      </div>
      <div><label className="label" htmlFor="confirm">Repite la contraseña</label><input id="confirm" name="confirm" type="password" required autoComplete="new-password" className="input" /></div>
      {msg && <p className="rounded-lg bg-latias/10 px-3 py-2 text-sm text-latias" role="alert">{msg.text}</p>}
      <button disabled={busy} className="btn-primary w-full py-3">{busy ? "Creando cuenta…" : "Crear cuenta"}</button>
    </form>
  );
}
