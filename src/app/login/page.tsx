import Link from "next/link";
import { oauthProviders } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import OAuthButtons from "@/components/OAuthButtons";

export const metadata = { title: "Ingresar" };

function safeCallback(url?: string) {
  // Evita open-redirect: solo rutas internas
  return url && url.startsWith("/") && !url.startsWith("//") ? url : "/cuenta";
}

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string; verified?: string } }) {
  const cb = safeCallback(searchParams.callbackUrl);
  return (
    <div className="container-x flex justify-center py-14">
      <div className="panel w-full max-w-md p-7">
        <h1 className="font-display text-2xl font-bold">Ingresar</h1>
        <p className="mt-1 text-sm text-slate-400">¿No tienes cuenta? <Link href="/registro" className="text-latios-glow hover:underline">Regístrate</Link></p>
        {searchParams.verified && <p className="mt-4 rounded-lg bg-rayquaza/10 px-3 py-2 text-sm text-rayquaza">✓ Correo verificado. Ya puedes ingresar.</p>}
        <div className="mt-6"><OAuthButtons google={oauthProviders.google} facebook={oauthProviders.facebook} callbackUrl={cb} /></div>
        <div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />o con tu correo<span className="h-px flex-1 bg-white/10" /></div>
        <LoginForm callbackUrl={cb} initialError={searchParams.error} />
      </div>
    </div>
  );
}
