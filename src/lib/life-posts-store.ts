import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

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
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (p: Omit<LifePost, "id" | "createdAt" | "likes" | "comments">) => void;
  remove: (id: string) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, c: Omit<LifeComment, "id" | "createdAt">) => void;
  removeComment: (postId: string, commentId: string) => void;
}

const push = (items: LifePost[]) => {
  void saveCollection({ data: { name: "life-posts", items } }).catch(() => {});
};

export const useLifePosts = create<LifeState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "life-posts" } })) as LifePost[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      add: (p) =>
        set((s) => {
          const items = [
            { ...p, id: createId("life"), createdAt: Date.now(), likes: [], comments: [] },
            ...s.items,
          ];
          push(items);
          return { items };
        }),
      remove: (id) => set((s) => {
        const items = s.items.filter((p) => p.id !== id);
        push(items);
        return { items };
      }),
      toggleLike: (postId, userId) =>
        set((s) => {
          const items = s.items.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: p.likes.includes(userId)
                    ? p.likes.filter((x) => x !== userId)
                    : [...p.likes, userId],
                }
              : p,
          );
          push(items);
          return { items };
        }),
      addComment: (postId, c) =>
        set((s) => {
          const items = s.items.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    { ...c, id: createId("comment"), createdAt: Date.now() },
                  ],
                }
              : p,
          );
          push(items);
          return { items };
        }),
      removeComment: (postId, commentId) =>
        set((s) => {
          const items = s.items.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
              : p,
          );
          push(items);
          return { items };
        }),
    }),
    { name: "sadova-life-posts-v2" },
  ),
);