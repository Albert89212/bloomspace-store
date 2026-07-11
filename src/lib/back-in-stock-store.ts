import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

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
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  request: (r: Omit<BackInStockRequest, "id" | "createdAt" | "notified">) => void;
  remove: (id: string) => void;
  markNotified: (productId: string) => void;
}

const push = (items: BackInStockRequest[]) => {
  void saveCollection({ data: { name: "back-in-stock", items } }).catch(() => {});
};

export const useBackInStock = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "back-in-stock" } })) as BackInStockRequest[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      request: (r) =>
        set((s) => {
          const items = [
            { ...r, id: createId("stock"), createdAt: Date.now(), notified: false },
            ...s.items,
          ];
          push(items);
          return { items };
        }),
      remove: (id) => set((s) => {
        const items = s.items.filter((x) => x.id !== id);
        push(items);
        return { items };
      }),
      markNotified: (productId) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.productId === productId ? { ...x, notified: true } : x,
          );
          push(items);
          return { items };
        }),
    }),
    { name: "sadova-back-in-stock" },
  ),
);