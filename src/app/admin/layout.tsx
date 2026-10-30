import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const tabs = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/colecciones", label: "Colecciones" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defensa en profundidad: el middleware ya filtra, aquí se revalida contra la BD
  if (!(await requireAdmin())) redirect("/");
  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Panel de control <span className="text-rayquaza-gold">Admin</span></h1>
        <nav className="flex flex-wrap gap-1 rounded-xl bg-white/5 p-1" aria-label="Admin">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white">{t.label}</Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
