import SellForm from "@/components/SellForm";

export const metadata = { title: "Compramos tus cartas" };

export default function VendePage() {
  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="badge bg-latias/15 text-latias">We buy your cards</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Compramos tu colección</h1>
        <p className="mt-4 text-slate-300">Cuéntanos qué tienes y envíanos fotos. Revisamos cada solicitud y te hacemos una oferta en menos de 48 horas.</p>
        <ol className="mt-8 space-y-4">
          {[
            ["1", "Completa el formulario", "Describe tus cartas destacadas y su estado.", "bg-latios"],
            ["2", "Sube fotos", "Del binder, sellados o certificados de grading.", "bg-latias"],
            ["3", "Recibe tu oferta", "Te contactamos por correo o teléfono.", "bg-rayquaza"],
          ].map(([n, t, d, c]) => (
            <li key={n} className="flex gap-4">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-bold ${c}`}>{n}</span>
              <div><p className="font-semibold">{t}</p><p className="text-sm text-slate-400">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-xs text-slate-500">Tus datos se usan solo para contactarte por esta solicitud. Todo el texto se sanitiza y las imágenes se validan antes de guardarse.</p>
      </div>
      <SellForm />
    </div>
  );
}
