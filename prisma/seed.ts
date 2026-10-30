import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { USD_TO_CLP } from "../src/lib/pricing";

const prisma = new PrismaClient();

// Precios en USD: referencias TCGPlayer / eBay. Se convierten a CLP con la tasa fija 1 USD = $900.
// Los valores de sellados son referencias editables desde el panel admin.
const products = [
  // ── Singles ──
  {
    slug: "latios-latias-gx-alt-art-170-team-up",
    name: "Latios & Latias GX (Alternative Art)",
    category: "SINGLE",
    setName: "Team Up",
    number: "#170",
    rarity: "Alternative Art",
    description:
      "La carta Tag Team más icónica del dúo eón. Arte alternativo full-art de la expansión Team Up, una de las piezas más buscadas por coleccionistas de Hoenn.",
    priceUsd: 1200,
    costUsd: 950,
    stock: 1,
    theme: "duo",
    isSecret: true,
  },
  {
    slug: "latios-illustration-rare-203-surging-sparks",
    name: "Latios Illustration Rare",
    category: "SINGLE",
    setName: "Surging Sparks",
    number: "#203",
    rarity: "Illustration Rare",
    description:
      "Illustration Rare de Latios de Surging Sparks: ilustración a sangre completa con Latios surcando el cielo.",
    priceUsd: 25,
    costUsd: 16,
    stock: 8,
    theme: "latios",
    isSecret: false,
  },
  {
    slug: "rayquaza-vmax-alt-art-218-evolving-skies",
    name: "Rayquaza VMAX (Alternate Art)",
    category: "SINGLE",
    setName: "Evolving Skies",
    number: "#218",
    rarity: "Alternate Art Secret",
    description:
      "El 'chase' definitivo de Evolving Skies. Rayquaza VMAX con arte alternativo secreto, una de las cartas modernas más valoradas.",
    priceUsd: 400,
    costUsd: 310,
    stock: 2,
    theme: "rayquaza",
    isSecret: true,
  },
  // ── Sellados ──
  {
    slug: "booster-box-surging-sparks",
    name: "Booster Box Surging Sparks",
    category: "SEALED",
    setName: "Surging Sparks",
    rarity: "Sellado de fábrica",
    description: "Caja de 36 sobres de Surging Sparks, sellada de fábrica. Precio de referencia editable.",
    priceUsd: 150,
    costUsd: 115,
    stock: 6,
    theme: "latios",
  },
  {
    slug: "booster-box-cielos-evolutivos",
    name: "Booster Box Cielos Evolutivos",
    category: "SEALED",
    setName: "Evolving Skies",
    rarity: "Sellado de fábrica",
    description:
      "Caja de 36 sobres de Cielos Evolutivos (Evolving Skies), fuera de impresión. Precio de referencia editable.",
    priceUsd: 900,
    costUsd: 760,
    stock: 1,
    theme: "rayquaza",
  },
  {
    slug: "etb-cielos-evolutivos-rayquaza",
    name: "Elite Trainer Box Cielos Evolutivos (Rayquaza)",
    category: "SEALED",
    setName: "Evolving Skies",
    rarity: "ETB temática Dragón",
    description:
      "Elite Trainer Box temática de dragones con 8 sobres, fundas, dados y accesorios. Precio de referencia editable.",
    priceUsd: 250,
    costUsd: 195,
    stock: 3,
    theme: "rayquaza",
  },
  {
    slug: "etb-surging-sparks",
    name: "Elite Trainer Box Surging Sparks",
    category: "SEALED",
    setName: "Surging Sparks",
    rarity: "ETB",
    description: "Elite Trainer Box de Surging Sparks con 9 sobres y accesorios. Precio de referencia editable.",
    priceUsd: 55,
    costUsd: 40,
    stock: 12,
    theme: "latias",
  },
  // ── Graduadas (no disponibles) ──
  {
    slug: "latias-latios-gx-tag-team-psa-10",
    name: "Latias & Latios GX Tag Team PSA 10",
    category: "GRADED",
    setName: "Team Up",
    number: "#170",
    rarity: "Alternative Art",
    grade: "PSA 10",
    description: "Ejemplar Gem Mint PSA 10 del Tag Team alt-art. Pieza de alta gama, sin stock actualmente.",
    priceUsd: 3750,
    costUsd: 0,
    stock: 0,
    available: false,
    theme: "duo",
    isSecret: true,
    referenceNote: "Última venta referente eBay: ~$3,500 – $4,000 USD",
  },
  {
    slug: "rayquaza-gold-star-psa",
    name: "Rayquaza Gold Star PSA 9/10",
    category: "GRADED",
    setName: "EX Deoxys",
    rarity: "Gold Star",
    grade: "PSA 9/10",
    description: "Rayquaza Gold Star graduada, una leyenda de la era EX. Pieza de alta gama, sin stock actualmente.",
    priceUsd: 0,
    costUsd: 0,
    stock: 0,
    available: false,
    theme: "rayquaza",
    isSecret: true,
    referenceNote: "Referente histórico eBay (consultar)",
  },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log(`✔ ${products.length} productos (1 USD = $${USD_TO_CLP} CLP)`);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@hoenn.tcg").toLowerCase();
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "CambiaEsta#Clave2026";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Administrador",
      role: "ADMIN",
      emailVerified: new Date(),
      passwordHash: await bcrypt.hash(adminPass, 12),
    },
  });
  console.log(`✔ Admin: ${adminEmail}`);

  if (process.env.SEED_DEMO_DATA !== "false" && (await prisma.order.count()) === 0) {
    await seedDemo();
  }
}

async function seedDemo() {
  const names = ["Camila Rojas", "Matías Soto", "Valentina Díaz", "Benjamín Muñoz", "Fernanda Pérez", "Tomás Vega"];
  const users = [];
  for (const [i, name] of names.entries()) {
    users.push(
      await prisma.user.create({
        data: {
          name,
          email: `demo${i + 1}@cliente.cl`,
          emailVerified: new Date(),
          passwordHash: await bcrypt.hash("Demo#Cliente2026", 12),
        },
      }),
    );
  }
  const sellable = await prisma.product.findMany({ where: { available: true, priceUsd: { lt: 500 } } });
  const statuses = ["DELIVERED", "DELIVERED", "SHIPPED", "PREPARING", "PAID"];
  const cities = ["Santiago", "Valparaíso", "Concepción", "La Serena", "Temuco"];
  let seed = 7;
  const rnd = (n: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * n);
  };

  for (let d = 13; d >= 0; d--) {
    const ordersToday = 1 + rnd(3);
    for (let k = 0; k < ordersToday; k++) {
      const user = users[rnd(users.length)];
      const prod = sellable[rnd(sellable.length)];
      const qty = 1 + rnd(2);
      const unit = Math.round(prod.priceUsd * USD_TO_CLP);
      const unitCost = Math.round(prod.costUsd * USD_TO_CLP);
      const created = new Date(Date.now() - d * 86400000 - rnd(36000) * 1000);
      const status = d > 6 ? "DELIVERED" : statuses[rnd(statuses.length)];
      await prisma.order.create({
        data: {
          userId: user.id,
          status,
          totalClp: unit * qty,
          costClp: unitCost * qty,
          shippingName: user.name ?? "Cliente",
          shippingAddress: "Av. Demo 123",
          shippingCity: cities[rnd(cities.length)],
          phone: "+56900000000",
          trackingCode: status === "SHIPPED" || status === "DELIVERED" ? `CL${100000 + rnd(899999)}` : null,
          createdAt: created,
          items: { create: { productId: prod.id, quantity: qty, unitPriceClp: unit, unitCostClp: unitCost } },
        },
      });
    }
    const day = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
    await prisma.dailyVisit.upsert({
      where: { day },
      update: {},
      create: { day, count: 60 + rnd(90) },
    });
  }
  console.log("✔ Datos de demostración (6 clientes y pedidos de los últimos 14 días)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
