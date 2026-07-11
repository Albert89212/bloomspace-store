import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

export interface Review {
  id: string;
  productSlug: string;
  userId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: number;
  approved: boolean;
  verifiedPurchase: boolean;
  photos?: string[]; // dataURL или https URL
  video?: string; // dataURL / URL — короткое видео до 30 сек
}

interface ReviewsState {
  items: Review[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (r: Omit<Review, "id" | "createdAt" | "approved">) => void;
  approve: (id: string, approved: boolean) => void;
  remove: (id: string) => void;
}

const push = (items: Review[]) => {
  void saveCollection({ data: { name: "reviews", items } }).catch(() => {});
};

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (useReviews.getState()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "reviews" } })) as Review[];
          if (Array.isArray(remote) && remote.length) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      add: (r) =>
        set((s) => {
          const items = [
            {
              ...r,
              id: createId("review"),
              createdAt: Date.now(),
              // Верифицированные покупки публикуем сразу, остальные — на модерацию
              approved: r.verifiedPurchase,
            },
            ...s.items,
          ];
          push(items);
          return { items };
        }),
      approve: (id, approved) =>
        set((s) => {
          const items = s.items.map((r) => (r.id === id ? { ...r, approved } : r));
          push(items);
          return { items };
        }),
      remove: (id) =>
        set((s) => {
          const items = s.items.filter((r) => r.id !== id);
          push(items);
          return { items };
        }),
    }),
    { name: "sadova-reviews-v2" },
  ),
);