import Link from "next/link";
import { redirect } from "next/navigation";
import { consumeVerification } from "@/lib/verification";

export default async function Verificar({ searchParams }: { searchParams: { token?: string } }) {
  const ok = await consumeVerification(String(searchParams.token ?? ""));
  if (ok) redirect("/login?verified=1");
  return (
    <div className="container-x py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-latias">Enlace inválido o vencido</h1>
      <p className="mt-2 text-slate-400">Regístrate de nuevo para recibir un enlace nuevo.</p>
      <Link href="/registro" className="btn-primary mt-6">Volver al registro</Link>
    </div>
  );
}
