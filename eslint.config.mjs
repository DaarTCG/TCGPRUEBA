import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** ESLint 9 (flat config). */
const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "coverage/**"] },
  ...compat.extends("next/core-web-vitals"),
];

export default config;
