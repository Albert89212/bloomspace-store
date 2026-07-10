import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BackInStockRequest {
  id: string;
  productId: string;
  productName: string;
  contact: string; // email или телефон
  createdAt: number;
  notified: boolean;
}

interface State {
  items: BackInStockRequest[];
  request: (r: Omit<BackInStockRequest, "id" | "createdAt" | "notified">) => void;
  remove: (id: string) => void;
  markNotified: (productId: string) => void;
}

export const useBackInStock = create<State>()(
  persist(
    (set) => ({
      items: [],
      request: (r) =>
        set((s) => ({
          items: [
            { ...r, id: crypto.randomUUID(), createdAt: Date.now(), notified: false },
            ...s.items,
          ],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      markNotified: (productId) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.productId === productId ? { ...x, notified: true } : x,
          ),
        })),
    }),
    { name: "sadova-back-in-stock" },
  ),
);