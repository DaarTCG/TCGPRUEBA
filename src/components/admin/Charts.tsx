"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const clp = (n: number) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
const compact = (n: number) => new Intl.NumberFormat("es-CL", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const axis = { stroke: "rgba(255,255,255,.12)", tick: { fill: "#94A3B8", fontSize: 12 }, tickLine: false };
const tooltipStyle = {
  contentStyle: { background: "#0B1120", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, color: "#E2E8F0" },
  labelStyle: { color: "#94A3B8" },
  itemStyle: { color: "#E2E8F0" },
};

/** Tabla oculta visualmente con los mismos datos, para lectores de pantalla. */
function DataTable({ caption, label, rows }: { caption: string; label: string; rows: [string, number][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr><th scope="col">{label}</th><th scope="col">Ventas (CLP)</th></tr></thead>
      <tbody>{rows.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{clp(v)}</td></tr>)}</tbody>
    </table>
  );
}

export function SalesChart({ data }: { data: { day: string; ventas: number }[] }) {
  return (
    <>
    <DataTable caption="Ventas diarias de los últimos 14 días" label="Día" rows={data.map((d) => [d.day, d.ventas])} />
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4C8DFF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4C8DFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
        <XAxis dataKey="day" {...axis} />
        <YAxis {...axis} width={56} tickFormatter={compact} />
        <Tooltip {...tooltipStyle} formatter={(v) => [clp(Number(v ?? 0)), "Ventas"]} cursor={{ stroke: "rgba(255,255,255,.25)" }} />
        <Area type="monotone" dataKey="ventas" stroke="#4C8DFF" strokeWidth={2} fill="url(#fillSales)" activeDot={{ r: 5, stroke: "#0B1120", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
    </>
  );
}

export function CategoryChart({ data }: { data: { categoria: string; ventas: number }[] }) {
  return (
    <>
    <DataTable caption="Ventas por categoría" label="Categoría" rows={data.map((d) => [d.categoria, d.ventas])} />
    <ResponsiveContainer width="100%" height={260}>
      <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
        <XAxis dataKey="categoria" {...axis} />
        <YAxis {...axis} width={56} tickFormatter={compact} />
        <Tooltip {...tooltipStyle} formatter={(v) => [clp(Number(v ?? 0)), "Ventas"]} cursor={{ fill: "rgba(255,255,255,.04)" }} />
        <Bar dataKey="ventas" fill="#00C853" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </>
  );
}
