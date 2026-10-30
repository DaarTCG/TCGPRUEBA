/** URL pública del sitio (para sitemap, robots y metadatos). */
export const SITE_URL = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
