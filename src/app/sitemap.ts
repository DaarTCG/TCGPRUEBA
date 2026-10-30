import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ where: { enabled: true }, select: { slug: true, updatedAt: true } });
  const pages = ["", "/tienda", "/tienda?cat=singles", "/tienda?cat=sellados", "/tienda?cat=graduadas", "/vende-tus-cartas"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/producto/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
