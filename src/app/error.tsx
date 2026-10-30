"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // En producción no se muestran detalles internos al usuario
    console.error(error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-x flex flex-col items-center py-24 text-center" role="alert">
      <h1 className="font-display text-3xl font-bold text-latias">Algo salió mal</h1>
      <p className="mt-2 max-w-md text-slate-400">Tuvimos un problema al cargar esta página. Intenta de nuevo en unos segundos.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-slate-500">Código: {error.digest}</p>}
      <button onClick={reset} className="btn-primary mt-8">Reintentar</button>
    </div>
  );
}
