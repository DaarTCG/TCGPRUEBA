import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { csrfGuard, jsonError, rateGuard } from "@/lib/api";

const body = z.object({ productId: z.string().min(1).max(40) });

async function handle(req: Request, add: boolean) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  const limited = rateGuard(req, "wishlist");
  if (limited) return limited;
  const session = await getSession();
  if (!session?.user?.id) return jsonError("Debes iniciar sesión", 401);
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Datos inválidos");
  const { productId } = parsed.data;
  const userId = session.user.id;
  if (add) {
    if (!(await prisma.product.findUnique({ where: { id: productId } }))) return jsonError("Producto no existe", 404);
    await prisma.wishlistItem.upsert({ where: { userId_productId: { userId, productId } }, update: {}, create: { userId, productId } });
  } else {
    await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
  }
  return NextResponse.json({ ok: true });
}

export const POST = (req: Request) => handle(req, true);
export const DELETE = (req: Request) => handle(req, false);
