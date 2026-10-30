import { prisma } from "@/lib/prisma";
import ProductTable from "@/components/admin/ProductTable";
import { USD_TO_CLP } from "@/lib/pricing";

export const metadata = { title: "Productos · Admin" };

export default async function AdminProductos() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "desc" }, { priceUsd: "desc" }],
    select: { id: true, name: true, category: true, priceUsd: true, costUsd: true, stock: true, enabled: true, available: true, imageUrl: true },
  });
  return (
    <div>
      <p className="mb-4 text-sm text-slate-400">Edita el precio en USD: el precio en CLP se calcula automáticamente (1 USD = ${USD_TO_CLP}). Los interruptores se guardan al instante.</p>
      <ProductTable initial={products} />
    </div>
  );
}
