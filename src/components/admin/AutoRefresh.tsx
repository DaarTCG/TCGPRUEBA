"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Refresca los datos del dashboard cada N segundos (visión en tiempo real). */
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [at, setAt] = useState<string>("");
  useEffect(() => {
    setAt(new Date().toLocaleTimeString("es-CL"));
    const id = setInterval(() => {
      router.refresh();
      setAt(new Date().toLocaleTimeString("es-CL"));
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return (
    <p className="flex items-center gap-2 text-xs text-slate-400" aria-live="polite">
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rayquaza opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-rayquaza" /></span>
      En vivo · actualizado {at} · cada {seconds}s
    </p>
  );
}
