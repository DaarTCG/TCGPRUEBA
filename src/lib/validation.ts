import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Mínimo 10 caracteres")
  .max(128)
  .regex(/[a-z]/, "Debe incluir una minúscula")
  .regex(/[A-Z]/, "Debe incluir una mayúscula")
  .regex(/[0-9]/, "Debe incluir un número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir un símbolo");

/** Correo normalizado (trim + minúsculas) validado con el formato nativo de Zod 4. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Correo inválido" }).max(254));

/** Solo URLs https (bloquea http:, javascript:, data:). */
export const httpsUrlSchema = z.url({ protocol: /^https$/, error: "La URL debe empezar con https://" }).max(500);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const sellRequestSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa tu nombre completo").max(100),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{8,20}$/, "Teléfono inválido"),
  description: z.string().trim().min(20, "Describe tu colección (mínimo 20 caracteres)").max(4000),
  estimatedValue: z.coerce.number().min(0, "Valor inválido").max(10_000_000_000),
  currency: z.enum(["USD", "CLP"]),
});

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(10) }))
    .min(1, "El carrito está vacío")
    .max(30),
  shippingName: z.string().trim().min(3).max(100),
  shippingAddress: z.string().trim().min(5).max(200),
  shippingCity: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{8,20}$/, "Teléfono inválido"),
});

export const productUpdateSchema = z
  .object({
    priceUsd: z.number().min(0).max(1_000_000),
    stock: z.number().int().min(0).max(100_000),
    enabled: z.boolean(),
    available: z.boolean(),
    imageUrl: httpsUrlSchema.or(z.literal("")).nullable(),
  })
  .partial();

export const orderStatusSchema = z.object({
  status: z.enum(["PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingCode: z.string().trim().max(40).regex(/^[A-Za-z0-9-]*$/).optional(),
});
