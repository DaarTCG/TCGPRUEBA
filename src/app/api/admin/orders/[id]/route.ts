import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { csrfGuard, jsonError, rateGuard } from "@/lib/api";
import { orderStatusSchema } from "@/lib/validation";
import { sendMail } from "@/lib/mail";
import { orderStatusEmail } from "@/lib/emails";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const csrf = csrfGuard(req);
  if (csrf) return csrf;
  const limited = rateGuard(req, "admin");
  if (limited) return limited;
  if (!(await requireAdmin())) return jsonError("Prohibido", 403);
  const parsed = orderStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  try {
    const before = await prisma.order.findUnique({ where: { id: params.id }, select: { status: true } });
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status, trackingCode: parsed.data.trackingCode || null },
      include: { user: { select: { email: true } } },
    });
    // Notifica al cliente solo si el estado cambió
    let notified = false;
    if (before && before.status !== order.status) {
      const mail = orderStatusEmail({ id: order.id, customerName: order.shippingName, status: order.status, trackingCode: order.trackingCode });
      if (mail) {
        await sendMail({ to: order.user.email, ...mail }).then(() => (notified = true)).catch((e) => console.error("Correo de estado no enviado:", e));
      }
    }
    return NextResponse.json({ ok: true, notified });
  } catch {
    return jsonError("Pedido no encontrado", 404);
  }
}
