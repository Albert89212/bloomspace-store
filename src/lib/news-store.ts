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
  create: (p: Omit<NewsPost, "id" | "createdAt" | "likes" | "comments">) => NewsPost;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<NewsPost>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, c: Omit<NewsComment, "id" | "createdAt">) => void;
  removeComment: (postId: string, commentId: string) => void;
  pin: (id: string, v: boolean) => void;
}

const push = (items: NewsPost[]) => {
  void saveCollection({ data: { name: "news", items } }).catch((error) => {
    console.error("Не удалось сохранить новости в БД", error);
  });
};

export const useNews = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        try {
          const remote = (await fetchCollection({ data: { name: "news" } })) as NewsPost[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch (error) {
          console.error("Не удалось загрузить новости из БД", error);
          /* keep local cache */
        } finally {
          set({ _hydrated: true });
        }
      },
      create: (p) => {
        const post: NewsPost = {
          ...p,
          id: createId("news"),
          createdAt: Date.now(),
          likes: [],
          comments: [],
        };
        set((s) => {
          const items = [post, ...s.items];
          push(items);
          return { items, _hydrated: true };
        });
        return post;
      },
      remove: (id) =>
        set((s) => {
          const items = s.items.filter((x) => x.id !== id);
          push(items);
          return { items, _hydrated: true };
        }),
      update: (id, patch) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, ...patch } : x));
          push(items);
          return { items, _hydrated: true };
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
          return { items, _hydrated: true };
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
          return { items, _hydrated: true };
        }),
      removeComment: (postId, commentId) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.id === postId
              ? { ...x, comments: x.comments.filter((c) => c.id !== commentId) }
              : x,
          );
          push(items);
          return { items, _hydrated: true };
        }),
      pin: (id, v) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, pinned: v } : x));
          push(items);
          return { items, _hydrated: true };
        }),
    }),
    { name: "sadova-news", partialize: (state) => ({ items: state.items }) },
  ),
);