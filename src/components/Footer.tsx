import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-night-900/60">
      <div className="container-x grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold"><Logo className="h-7 w-7" /> Hoenn TCG</div>
          <p className="mt-3 max-w-xs text-sm text-slate-400">Singles, sellados y cartas graduadas de Pokémon TCG en Chile. Precios en CLP (1 USD = $900).</p>
        </div>
        <div className="text-sm">
          <h3 className="mb-3 font-semibold text-slate-200">Tienda</h3>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/tienda?cat=singles" className="hover:text-white">Singles</Link></li>
            <li><Link href="/tienda?cat=sellados" className="hover:text-white">Sellados</Link></li>
            <li><Link href="/tienda?cat=graduadas" className="hover:text-white">Graduadas</Link></li>
            <li><Link href="/vende-tus-cartas" className="hover:text-white">Compramos tus cartas</Link></li>
          </ul>
        </div>
        <div className="text-sm text-slate-400">
          <h3 className="mb-3 font-semibold text-slate-200">Seguridad</h3>
          <p>Contraseñas con bcrypt, sesiones firmadas, protección CSRF y headers de seguridad en cada página.</p>
        </div>
      </div>
      <p className="border-t border-white/5 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Hoenn TCG · Pokémon y sus nombres son marcas de Nintendo, Creatures Inc. y GAME FREAK inc. Sitio no afiliado.
      </p>
    </footer>
  );
}
