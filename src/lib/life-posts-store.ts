import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LifeComment {
  id: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface LifePost {
  id: string;
  author: string;
  role: string;
  caption: string;
  poster: string;
  video?: string;
  createdAt: number;
  likes: string[]; // userIds — только зарегистрированные пользователи
  comments: LifeComment[];
}

interface LifeState {
  items: LifePost[];
  add: (p: Omit<LifePost, "id" | "createdAt" | "likes" | "comments">) => void;
  remove: (id: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, c: Omit<LifeComment, "id" | "createdAt">) => void;
  removeComment: (postId: string, commentId: string) => void;
}

export const useLifePosts = create<LifeState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => ({
          items: [
            { ...p, id: crypto.randomUUID(), createdAt: Date.now(), likes: [], comments: [] },
            ...s.items,
          ],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((p) => p.id !== id) })),
      toggleLike: (postId, userId) =>
        set((s) => ({
          items: s.items.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: p.likes.includes(userId)
                    ? p.likes.filter((x) => x !== userId)
                    : [...p.likes, userId],
                }
              : p,
          ),
        })),
      addComment: (postId, c) =>
        set((s) => ({
          items: s.items.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    { ...c, id: crypto.randomUUID(), createdAt: Date.now() },
                  ],
                }
              : p,
          ),
        })),
      removeComment: (postId, commentId) =>
        set((s) => ({
          items: s.items.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
              : p,
          ),
        })),
    }),
    { name: "sadova-life-posts-v2" },
  ),
);