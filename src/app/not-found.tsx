import Link from "next/link";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="font-display text-8xl font-bold">
        <span className="text-latios-glow">4</span>
        <span className="text-latias">0</span>
        <span className="text-rayquaza">4</span>
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold">Esta carta se fue volando</h1>
      <p className="mt-2 max-w-md text-slate-400">La página que buscas no existe o el producto ya no está disponible.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/tienda" className="btn-primary">Ir a la tienda</Link>
        <Link href="/" className="btn-ghost">Volver al inicio</Link>
      </div>
    </div>
  );
}
