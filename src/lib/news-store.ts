import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

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
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  create: (p: Omit<NewsPost, "id" | "createdAt" | "likes" | "comments">) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<NewsPost>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, c: Omit<NewsComment, "id" | "createdAt">) => void;
  removeComment: (postId: string, commentId: string) => void;
  pin: (id: string, v: boolean) => void;
}

const push = (items: NewsPost[]) => {
  void saveCollection({ data: { name: "news", items } }).catch(() => {});
};

export const useNews = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "news" } })) as NewsPost[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        } finally {
          set({ _hydrated: true });
        }
      },
      create: (p) =>
        set((s) => {
          const items = [
            {
              ...p,
              id: createId("news"),
              createdAt: Date.now(),
              likes: [],
              comments: [],
            },
            ...s.items,
          ];
          push(items);
          return { items };
        }),
      remove: (id) =>
        set((s) => {
          const items = s.items.filter((x) => x.id !== id);
          push(items);
          return { items };
        }),
      update: (id, patch) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, ...patch } : x));
          push(items);
          return { items };
        }),
      toggleLike: (postId, userId) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.id === postId
              ? {
                  ...x,
                  likes: x.likes.includes(userId)
                    ? x.likes.filter((u) => u !== userId)
                    : [...x.likes, userId],
                }
              : x,
          );
          push(items);
          return { items };
        }),
      addComment: (postId, c) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.id === postId
              ? {
                  ...x,
                  comments: [
                    ...x.comments,
                    { ...c, id: createId("comment"), createdAt: Date.now() },
                  ],
                }
              : x,
          );
          push(items);
          return { items };
        }),
      removeComment: (postId, commentId) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.id === postId
              ? { ...x, comments: x.comments.filter((c) => c.id !== commentId) }
              : x,
          );
          push(items);
          return { items };
        }),
      pin: (id, v) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, pinned: v } : x));
          push(items);
          return { items };
        }),
    }),
    { name: "sadova-news" },
  ),
);