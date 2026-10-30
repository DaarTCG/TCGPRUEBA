/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import { formatClp, formatUsd } from "@/lib/pricing";

export const metadata = { title: "Colecciones · Admin" };

export default async function AdminColecciones() {
  const reqs = await prisma.sellRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  if (!reqs.length) return <p className="panel p-8 text-center text-slate-400">Aún no llegan solicitudes de compra de colecciones.</p>;
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {reqs.map((r) => {
        const files: string[] = JSON.parse(r.files || "[]");
        return (
          <li key={r.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{r.fullName}</p>
                <p className="text-sm text-slate-400"><a href={`mailto:${r.email}`} className="hover:underline">{r.email}</a> · {r.phone}</p>
              </div>
              <p className="price text-lg">{r.currency === "USD" ? formatUsd(r.estimatedValue) : formatClp(r.estimatedValue)}</p>
            </div>
            {/* React escapa el texto: no hay HTML inyectable */}
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{r.description}</p>
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((f) => (
                  <a key={f} href={`/api/admin/sell/${r.id}/${f}`} target="_blank" rel="noopener noreferrer">
                    <img src={`/api/admin/sell/${r.id}/${f}`} alt={`Foto ${f}`} className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10" />
                  </a>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">{r.createdAt.toLocaleString("es-CL")}</p>
          </li>
        );
      })}
    </ul>
  );
}
