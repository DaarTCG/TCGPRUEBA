import { CardGridSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="container-x py-10" aria-busy="true" aria-label="Cargando productos">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-white/5" />
      <div className="mt-8"><CardGridSkeleton /></div>
    </div>
  );
}
