import type { Config } from "tailwindcss";

// Paleta inspirada en el trío legendario de Hoenn
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        latios: { DEFAULT: "#0052D4", light: "#3B82F6", glow: "#4C8DFF" },
        latias: { DEFAULT: "#FF2A54", light: "#FF5C7C" },
        rayquaza: { DEFAULT: "#00C853", light: "#34E07B", gold: "#FFD700" },
        night: { DEFAULT: "#0F172A", 900: "#0B1120", 800: "#111C33", 700: "#1E293B", 600: "#334155" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        "neon-blue": "0 0 0 1px rgba(76,141,255,.35), 0 0 24px -4px rgba(0,82,212,.55)",
        "neon-red": "0 0 0 1px rgba(255,42,84,.35), 0 0 24px -4px rgba(255,42,84,.5)",
        "neon-green": "0 0 0 1px rgba(0,200,83,.35), 0 0 24px -4px rgba(0,200,83,.45)",
        "neon-gold": "0 0 0 1px rgba(255,215,0,.55), 0 0 28px -4px rgba(255,215,0,.5)",
      },
      keyframes: {
        holo: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
      },
      animation: { holo: "holo 6s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
