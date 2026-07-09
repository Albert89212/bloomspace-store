import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

interface ReviewsState {
  items: Review[];
  add: (r: Omit<Review, "id" | "createdAt" | "approved">) => void;
  approve: (id: string, approved: boolean) => void;
  remove: (id: string) => void;
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      items: [],
      add: (r) =>
        set((s) => ({
          items: [
            {
              ...r,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              // Верифицированные покупки публикуем сразу, остальные — на модерацию
              approved: r.verifiedPurchase,
            },
            ...s.items,
          ],
        })),
      approve: (id, approved) =>
        set((s) => ({
          items: s.items.map((r) => (r.id === id ? { ...r, approved } : r)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((r) => r.id !== id) })),
    }),
    { name: "sadova-reviews-v2" },
  ),
);