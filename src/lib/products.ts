export const CATEGORY_SLUGS: Record<string, { db: string; label: string; desc: string }> = {
  singles: { db: "SINGLE", label: "Singles", desc: "Cartas sueltas: alt-arts, illustration rares y secretas." },
  sellados: { db: "SEALED", label: "Sellados", desc: "Booster boxes y Elite Trainer Boxes selladas de fábrica." },
  graduadas: { db: "GRADED", label: "Graduadas", desc: "Piezas de alta gama certificadas por PSA." },
};

export const productSelect = {
  id: true, slug: true, name: true, category: true, setName: true, number: true, rarity: true,
  priceUsd: true, stock: true, available: true, theme: true, isSecret: true, imageUrl: true,
  grade: true, referenceNote: true,
} as const;
