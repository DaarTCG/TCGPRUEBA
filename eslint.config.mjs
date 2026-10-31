import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** ESLint 9 (flat config nativa de eslint-config-next 16). */
export default defineConfig([
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "coverage/**"]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Variables con _ al inicio se permiten sin usar (p. ej. _req)
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["info", "warn", "error"] }],
    },
  },
]);
