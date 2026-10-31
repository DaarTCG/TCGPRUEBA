/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/prisma";
import { formatClp, formatUsd } from "@/lib/pricing";
import SellStatus, { SELL_LABEL } from "@/components/admin/SellStatus";

export const metadata = { title: "Colecciones · Admin" };

export default async function AdminColecciones(props: { searchParams: Promise<{ estado?: string }> }) {
  const searchParams = await props.searchParams;
  const estado = searchParams.estado && SELL_LABEL[searchParams.estado] ? searchParams.estado : undefined;
  const reqs = await prisma.sellRequest.findMany({ where: estado ? { status: estado } : {}, orderBy: { createdAt: "desc" }, take: 100 });
  const filters = (
    <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filtrar por estado">
      <a href="/admin/colecciones" className={`badge px-3 py-1.5 text-sm ${!estado ? "bg-latios text-white" : "bg-white/5 text-slate-300"}`}>Todas</a>
      {Object.entries(SELL_LABEL).map(([k, v]) => (
        <a key={k} href={`/admin/colecciones?estado=${k}`} className={`badge px-3 py-1.5 text-sm ${estado === k ? "bg-latios text-white" : "bg-white/5 text-slate-300"}`}>{v}</a>
      ))}
    </nav>
  );
  if (!reqs.length) return <>{filters}<p className="panel p-8 text-center text-slate-400">No hay solicitudes{estado ? " con ese estado" : " de compra de colecciones todavía"}.</p></>;
  return (
    <>
    {filters}
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <SellStatus id={r.id} status={r.status} />
              <p className="text-xs text-slate-500">{r.createdAt.toLocaleString("es-CL")}</p>
            </div>
          </li>
        );
      })}
    </ul>
    </>
  );
}
