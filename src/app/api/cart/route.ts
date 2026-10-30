import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usdToClp } from "@/lib/pricing";

/** Precio y stock actuales de los productos del carrito (solo lectura, datos públicos). */
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9]{10,40}$/i.test(s))
    .slice(0, 30);
  if (!ids.length) return NextResponse.json({ products: [] });
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, priceUsd: true, stock: true, enabled: true, available: true },
  });
  return NextResponse.json({
    products: rows.map((p) => ({
      id: p.id,
      priceClp: p.priceUsd > 0 ? usdToClp(p.priceUsd) : 0,
      stock: p.stock,
      purchasable: p.enabled && p.available && p.priceUsd > 0 && p.stock > 0,
    })),
  });
}
