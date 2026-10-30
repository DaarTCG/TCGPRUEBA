import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csrfGuard, jsonError } from "@/lib/api";
import { orderStatusSchema } from "@/lib/validation";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  if (!(await requireAdmin())) return jsonError("Prohibido", 403);
  const parsed = orderStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  try {
    await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status, trackingCode: parsed.data.trackingCode || null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Pedido no encontrado", 404);
  }
}
