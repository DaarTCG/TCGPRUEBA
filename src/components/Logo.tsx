export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  // Logo original: tres "alas" con los colores del trío de Hoenn
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg-b" x1="0" x2="1"><stop offset="0" stopColor="#0052D4" /><stop offset="1" stopColor="#4C8DFF" /></linearGradient>
        <linearGradient id="lg-r" x1="0" x2="1"><stop offset="0" stopColor="#FF2A54" /><stop offset="1" stopColor="#FF8BA1" /></linearGradient>
        <linearGradient id="lg-g" x1="0" x2="1"><stop offset="0" stopColor="#00C853" /><stop offset="1" stopColor="#FFD700" /></linearGradient>
      </defs>
      <path d="M20 3 L35 20 L20 16 Z" fill="url(#lg-b)" />
      <path d="M20 3 L5 20 L20 16 Z" fill="url(#lg-r)" />
      <path d="M5 20 L20 37 L35 20 L20 24 Z" fill="url(#lg-g)" />
    </svg>
  );
}
