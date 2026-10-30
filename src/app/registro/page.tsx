import Link from "next/link";
import { oauthProviders } from "@/lib/auth";
import RegisterForm from "@/components/RegisterForm";
import OAuthButtons from "@/components/OAuthButtons";

export const metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <div className="container-x flex justify-center py-14">
      <div className="panel w-full max-w-md p-7">
        <h1 className="font-display text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-400">¿Ya tienes cuenta? <Link href="/login" className="text-latios-glow hover:underline">Ingresa</Link></p>
        <div className="mt-6"><OAuthButtons google={oauthProviders.google} facebook={oauthProviders.facebook} callbackUrl="/cuenta" /></div>
        <div className="my-6 flex items-center gap-3 text-xs text-slate-500"><span className="h-px flex-1 bg-white/10" />o con tu correo<span className="h-px flex-1 bg-white/10" /></div>
        <RegisterForm />
      </div>
    </div>
  );
}
