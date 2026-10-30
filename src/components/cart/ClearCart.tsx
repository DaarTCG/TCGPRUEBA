"use client";
import { useEffect } from "react";
import { useCart } from "./CartContext";

/** Vacía el carrito al volver de un pago exitoso. */
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
