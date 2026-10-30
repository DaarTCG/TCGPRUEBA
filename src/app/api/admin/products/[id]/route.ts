import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csrfGuard, jsonError, rateGuard } from "@/lib/api";
import { productUpdateSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  const limited = rateGuard(req, "admin");
  if (limited) return limited;
  if (!(await requireAdmin())) return jsonError("Prohibido", 403);

  const parsed = productUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  const { imageUrl, ...rest } = parsed.data;

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { ...rest, ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}) },
      select: { id: true, priceUsd: true, stock: true, enabled: true, available: true, imageUrl: true },
    });
    return NextResponse.json({ product });
  } catch {
    return jsonError("Producto no encontrado", 404);
  }
}
