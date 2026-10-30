export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="panel p-3">
          <div className="aspect-[63/88] animate-pulse rounded-xl bg-white/5" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/5" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-white/5" />
          <div className="mt-4 h-5 w-1/3 animate-pulse rounded bg-rayquaza/10" />
        </div>
      ))}
    </div>
  );
}
