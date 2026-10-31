import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { detectImage } from "@/lib/upload";

/** Sirve fotos de colecciones solo a administradores (las fotos no están en /public). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string; file: string }> }) {
  const params = await ctx.params;
  if (!(await requireAdmin())) return jsonError("Prohibido", 403);
  // Anti path-traversal: solo UUID + nombres generados por el servidor
  if (!/^[0-9a-f-]{36}$/.test(params.id) || !/^foto-\d{1,2}\.(jpg|png|webp)$/.test(params.file)) return jsonError("No encontrado", 404);
  try {
    const buf = await readFile(path.join(process.cwd(), "uploads", "sell", params.id, params.file));
    const kind = detectImage(buf);
    if (!kind) return jsonError("No encontrado", 404);
    return new Response(buf, { headers: { "Content-Type": kind.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return jsonError("No encontrado", 404);
  }
}
