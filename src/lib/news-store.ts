import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";

// Канал новостей магазина. Публикуют owner/admin.
// Пользователи могут лайкать и оставлять комментарии.
export interface NewsComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

export interface NewsPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  image?: string;
  createdAt: number;
  likes: string[]; // userIds
  comments: NewsComment[];
  pinned?: boolean;
}

interface State {
  items: NewsPost[];
  create: (p: Omit<NewsPost, "id" | "createdAt" | "likes" | "comments">) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<NewsPost>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, c: Omit<NewsComment, "id" | "createdAt">) => void;
  removeComment: (postId: string, commentId: string) => void;
  pin: (id: string, v: boolean) => void;
}

export const useNews = create<State>()(
  persist(
    (set) => ({
      items: [],
      create: (p) =>
        set((s) => ({
          items: [
            {
              ...p,
              id: createId("news"),
              createdAt: Date.now(),
              likes: [],
              comments: [],
            },
            ...s.items,
          ],
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      toggleLike: (postId, userId) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === postId
              ? {
                  ...x,
                  likes: x.likes.includes(userId)
                    ? x.likes.filter((u) => u !== userId)
                    : [...x.likes, userId],
                }
              : x,
          ),
        })),
      addComment: (postId, c) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === postId
              ? {
                  ...x,
                  comments: [
                    ...x.comments,
                    { ...c, id: createId("comment"), createdAt: Date.now() },
                  ],
                }
              : x,
          ),
        })),
      removeComment: (postId, commentId) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === postId
              ? { ...x, comments: x.comments.filter((c) => c.id !== commentId) }
              : x,
          ),
        })),
      pin: (id, v) =>
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, pinned: v } : x)),
        })),
    }),
    { name: "sadova-news" },
  ),
);