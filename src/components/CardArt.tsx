/* eslint-disable @next/next/no-img-element */
type Props = {
  name: string;
  category: string;
  theme: string;
  isSecret?: boolean;
  imageUrl?: string | null;
  setName?: string;
  number?: string | null;
  grade?: string | null;
  size?: "sm" | "lg";
};

const themes: Record<string, string> = {
  latios: "from-[#0052D4] via-[#1E3A8A] to-[#0B1120]",
  latias: "from-[#FF2A54] via-[#7F1D3A] to-[#0B1120]",
  rayquaza: "from-[#00C853] via-[#065F46] to-[#0B1120]",
  duo: "from-[#0052D4] via-[#7C2D5A] to-[#FF2A54]",
};

/**
 * Arte de producto. Si el admin define `imageUrl` (imagen oficial), se muestra esa imagen.
 * Si no, se dibuja una carta "holo" original con los colores del tema.
 */
export default function CardArt({ name, category, theme, isSecret, imageUrl, setName, number, grade, size = "sm" }: Props) {
  const frame = isSecret ? "ring-2 ring-rayquaza-gold shadow-neon-gold" : "ring-1 ring-white/15";
  const sealed = category === "SEALED";
  const graded = category === "GRADED";

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-night-900 ${frame} ${sealed ? "aspect-square" : "aspect-[63/88]"}`}>
        <img src={imageUrl} alt={name} className="h-full w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${themes[theme] ?? themes.latios} ${frame} ${sealed ? "aspect-square" : "aspect-[63/88]"}`} role="img" aria-label={name}>
      <div className="holo-sheen absolute inset-0 mix-blend-screen" />
      {/* Siluetas abstractas */}
      <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
        <defs>
          <radialGradient id={`g-${theme}`} cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="55" r="38" fill={`url(#g-${theme})`} />
        {theme === "rayquaza" ? (
          <path d="M8 110 C30 70, 45 120, 60 80 S 85 40, 95 20" stroke="#FFD700" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".8" />
        ) : (
          <>
            <path d="M15 70 L50 40 L85 70 L50 58 Z" fill="#fff" opacity=".35" />
            <path d="M28 84 L50 64 L72 84 L50 76 Z" fill="#fff" opacity=".25" />
          </>
        )}
      </svg>

      {graded && (
        <div className="absolute inset-x-3 top-3 rounded-md bg-white/90 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-latias">
          {grade ?? "Graduada"}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className={`font-display font-bold leading-tight text-white ${size === "lg" ? "text-xl" : "text-sm"}`}>{name}</p>
        <p className="mt-0.5 text-[11px] text-white/70">
          {setName}
          {number ? ` · ${number}` : ""}
        </p>
      </div>
      {sealed && (
        <div className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">Sellado</div>
      )}
    </div>
  );
}
