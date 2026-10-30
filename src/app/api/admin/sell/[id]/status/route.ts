import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csrfGuard, jsonError, rateGuard } from "@/lib/api";

const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"]) });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  const limited = rateGuard(req, "admin");
  if (limited) return limited;
  if (!(await requireAdmin())) return jsonError("Prohibido", 403);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Estado inválido");
  try {
    await prisma.sellRequest.update({ where: { id: params.id }, data: { status: parsed.data.status } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Solicitud no encontrada", 404);
  }
}
