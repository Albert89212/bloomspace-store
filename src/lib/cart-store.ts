import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  reservedUntil?: number; // резерв стока на 20 мин
}

interface CartState {
  items: CartItem[];
  lastAddedId: string | null;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  extendReservation: () => void;
  pruneExpired: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      lastAddedId: null,
      add: (item, qty = 1) =>
        set((s) => {
          const reservedUntil = Date.now() + 20 * 60 * 1000;
          const existing = s.items.find((i) => i.id === item.id);
          const items = existing
            ? s.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + qty, reservedUntil }
                  : i,
              )
            : [...s.items, { ...item, quantity: qty, reservedUntil }];
          return { items, lastAddedId: item.id };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [], lastAddedId: null }),
      extendReservation: () =>
        set((s) => ({
          items: s.items.map((i) => ({ ...i, reservedUntil: Date.now() + 20 * 60 * 1000 })),
        })),
      pruneExpired: () =>
        set((s) => ({
          items: s.items.filter((i) => !i.reservedUntil || i.reservedUntil > Date.now()),
        })),
    }),
    { name: "sadova-cart" },
  ),
);

export const selectCartCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartTotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity * i.price, 0);