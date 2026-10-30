export const ORDER_STEPS = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;
export const ORDER_LABEL: Record<string, string> = {
  PAID: "Pagado",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};
export const ORDER_COLOR: Record<string, string> = {
  PAID: "bg-latios/20 text-blue-300",
  PREPARING: "bg-rayquaza-gold/15 text-rayquaza-gold",
  SHIPPED: "bg-latias/15 text-latias",
  DELIVERED: "bg-rayquaza/15 text-rayquaza",
  CANCELLED: "bg-white/10 text-slate-400",
};
