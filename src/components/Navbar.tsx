"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "./cart/CartContext";
import Logo from "./Logo";

const links = [
  { href: "/tienda?cat=singles", label: "Singles" },
  { href: "/tienda?cat=sellados", label: "Sellados" },
  { href: "/tienda?cat=graduadas", label: "Graduadas" },
  { href: "/vende-tus-cartas", label: "Vende tus cartas" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-night/80 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-bold">
          <Logo />
          <span>
            Hoenn <span className="text-rayquaza-gold">TCG</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin" className="badge hidden bg-rayquaza-gold/15 text-rayquaza-gold ring-1 ring-rayquaza-gold/40 sm:inline-flex">
              Admin
            </Link>
          )}
          {session ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/cuenta" className="btn-ghost py-2">Mi cuenta</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-slate-400 hover:text-white">Salir</button>
            </div>
          ) : (
            <Link href="/login" className="btn-ghost hidden py-2 sm:inline-flex">Ingresar</Link>
          )}
          <Link href="/carrito" className="btn-primary relative py-2" aria-label={`Carrito, ${count} productos`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h2l2.4 11.2a2 2 0 002 1.8h7.7a2 2 0 002-1.6L21 8H6" /><circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-latias px-1 text-[11px] font-bold">{count}</span>
            )}
          </Link>
          <button className="btn-ghost px-3 py-2 md:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            Menú
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-white/10 md:hidden" aria-label="Móvil">
          <div className="container-x flex flex-col py-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-200 hover:bg-white/5">{l.label}</Link>
            ))}
            {session ? (
              <>
                <Link href="/cuenta" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-200 hover:bg-white/5">Mi cuenta</Link>
                {isAdmin && <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-rayquaza-gold hover:bg-white/5">Panel admin</Link>}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-lg px-3 py-2.5 text-left text-slate-400 hover:bg-white/5">Salir</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-slate-200 hover:bg-white/5">Ingresar / Registrarse</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
