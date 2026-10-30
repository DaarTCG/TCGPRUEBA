"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { productId: string; slug: string; name: string; priceClp: number; quantity: number; maxStock: number };

type CartCtx = {
  items: CartItem[];
  count: number;
  totalClp: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Actualiza precios y stock desde el servidor. Devuelve los avisos de cambios. */
  sync: () => Promise<string[]>;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "hoenn-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === item.productId);
      if (found) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + qty, item.maxStock, 10) } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.maxStock, 10) }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock, 10)) } : i)),
    );
  }, []);

  const remove = useCallback((productId: string) => setItems((p) => p.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const sync = useCallback(async () => {
    const current = items;
    if (!current.length) return [];
    const res = await fetch(`/api/cart?ids=${current.map((i) => i.productId).join(",")}`, { cache: "no-store" });
    if (!res.ok) return [];
    const { products } = (await res.json()) as { products: { id: string; priceClp: number; stock: number; purchasable: boolean }[] };
    const byId = new Map(products.map((p) => [p.id, p]));
    const notes: string[] = [];
    const next: CartItem[] = [];
    for (const it of current) {
      const p = byId.get(it.productId);
      if (!p || !p.purchasable) {
        notes.push(`${it.name} ya no está disponible y se quitó del carrito.`);
        continue;
      }
      let quantity = it.quantity;
      if (p.stock < quantity) {
        quantity = p.stock;
        notes.push(`${it.name}: solo quedan ${p.stock}, ajustamos la cantidad.`);
      }
      if (p.priceClp !== it.priceClp) notes.push(`${it.name} cambió de precio.`);
      next.push({ ...it, priceClp: p.priceClp, maxStock: p.stock, quantity });
    }
    setItems(next);
    return notes;
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((a, i) => a + i.quantity, 0),
      totalClp: items.reduce((a, i) => a + i.quantity * i.priceClp, 0),
      add,
      setQty,
      remove,
      clear,
      sync,
    }),
    [items, add, setQty, remove, clear, sync],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart fuera de CartProvider");
  return c;
}
