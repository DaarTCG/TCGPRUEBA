"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refresca los datos del dashboard cada N segundos (visión en tiempo real).
 * `updatedAt` lo calcula el servidor en cada render, así siempre coincide con los datos mostrados.
 */
export default function AutoRefresh({ seconds = 30, updatedAt }: { seconds?: number; updatedAt: string }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return (
    <p className="flex items-center gap-2 text-xs text-slate-400" aria-live="polite">
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rayquaza opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-rayquaza" /></span>
      En vivo · actualizado {updatedAt} · cada {seconds}s
    </p>
  );
}
