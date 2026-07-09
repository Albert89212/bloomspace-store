import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  text: string;
  createdAt: number;
  approved: boolean;
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
      items: [
        {
          id: "seed-1",
          productSlug: "aero-lounge",
          author: "Мария К.",
          rating: 5,
          text: "Пережило две зимы под открытым небом — как новое. Очень довольна.",
          createdAt: Date.now() - 14 * 86400000,
          approved: true,
        },
        {
          id: "seed-2",
          productSlug: "teak-dining",
          author: "Игорь В.",
          rating: 5,
          text: "Массивный, солидный. Сборка минут 15. Стоит своих денег.",
          createdAt: Date.now() - 7 * 86400000,
          approved: true,
        },
      ],
      add: (r) =>
        set((s) => ({
          items: [
            {
              ...r,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              approved: false,
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
    { name: "sadova-reviews" },
  ),
);