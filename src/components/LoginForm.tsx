"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const ERRORS: Record<string, string> = {
  RATE_LIMIT: "Demasiados intentos. Espera un minuto antes de reintentar.",
  EMAIL_NOT_VERIFIED: "Debes verificar tu correo antes de ingresar. Revisa tu bandeja de entrada.",
  CredentialsSignin: "Correo o contraseña incorrectos.",
  NoEmail: "Tu cuenta social no compartió un correo. Usa otro método.",
};

export default function LoginForm({ callbackUrl, initialError }: { callbackUrl: string; initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError ? ERRORS[initialError] ?? "No se pudo iniciar sesión." : "");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", { email: fd.get("email"), password: fd.get("password"), redirect: false });
    setBusy(false);
    if (!res || res.error) return setError(ERRORS[res?.error ?? ""] ?? ERRORS.CredentialsSignin);
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label className="label" htmlFor="email">Correo</label><input id="email" name="email" type="email" autoComplete="email" required className="input" /></div>
      <div><label className="label" htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required maxLength={128} className="input" /></div>
      {error && <p className="rounded-lg bg-latias/10 px-3 py-2 text-sm text-latias" role="alert">{error}</p>}
      <button disabled={busy} className="btn-primary w-full py-3">{busy ? "Ingresando…" : "Ingresar"}</button>
    </form>
  );
}
