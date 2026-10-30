export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true" aria-label="Cargando panel">
      {Array.from({ length: 4 }, (_, i) => <div key={i} className="panel h-28 animate-pulse" />)}
      <div className="panel col-span-2 h-72 animate-pulse lg:col-span-4" />
    </div>
  );
}
