"use client";
import { signIn } from "next-auth/react";

export default function OAuthButtons({ google, facebook, callbackUrl }: { google: boolean; facebook: boolean; callbackUrl: string }) {
  if (!google && !facebook) {
    return <p className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400">Google y Facebook se activan al configurar sus credenciales en <code>.env</code>.</p>;
  }
  return (
    <div className="grid gap-2">
      {google && (
        <button type="button" onClick={() => signIn("google", { callbackUrl })} className="btn-ghost w-full py-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 01-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 010-4.3V7.1H2.1a11 11 0 000 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 002.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
          Continuar con Google
        </button>
      )}
      {facebook && (
        <button type="button" onClick={() => signIn("facebook", { callbackUrl })} className="btn w-full bg-[#1877F2] py-3 text-white hover:bg-[#166FE5]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0024 12z"/></svg>
          Continuar con Facebook
        </button>
      )}
    </div>
  );
}
