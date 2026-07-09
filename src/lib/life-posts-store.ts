import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LifePost {
  id: string;
  author: string;
  role: string;
  caption: string;
  poster: string;
  video?: string;
  createdAt: number;
}

interface LifeState {
  items: LifePost[];
  add: (p: Omit<LifePost, "id" | "createdAt">) => void;
  remove: (id: string) => void;
}

export const useLifePosts = create<LifeState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => ({
          items: [{ ...p, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.items],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((p) => p.id !== id) })),
    }),
    { name: "sadova-life-posts" },
  ),
);