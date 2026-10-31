import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** ESLint 9 (flat config). */
const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "coverage/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Variables con _ al inicio se permiten sin usar (p. ej. _req)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
    },
  },
];

export default config;
