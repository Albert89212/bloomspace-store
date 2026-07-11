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
  _dbAvailable: boolean;
  hydrate: () => Promise<void>;
  create: (p: Omit<NewsPost, "id" | "createdAt" | "likes" | "comments">) => Promise<NewsPost>;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<NewsPost>) => void;
  toggleLike: (postId: string, userId: string) => void;
  addComment: (postId: string, c: Omit<NewsComment, "id" | "createdAt">) => void;
  removeComment: (postId: string, commentId: string) => void;
  pin: (id: string, v: boolean) => void;
}

export const useNews = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      _dbAvailable: true,
      // helpers defined inside so they can read/update dbAvailable flag
      hydrate: async () => {
        try {
          const remote = (await fetchCollection({ data: { name: "news" } })) as NewsPost[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true, _dbAvailable: true });
            return;
          }
        } catch (error) {
          console.warn("БД недоступна — работаем с локальным кэшем новостей", error);
          set({ _dbAvailable: false });
        } finally {
          set({ _hydrated: true });
        }
      },
      create: async (p) => {
        const post: NewsPost = {
          ...p,
          id: createId("news"),
          createdAt: Date.now(),
          likes: [],
          comments: [],
        };
        const items = [post, ...get().items];
        set({ items, _hydrated: true });
        if (get()._dbAvailable) {
          try {
            await saveCollection({ data: { name: "news", items } });
          } catch (error) {
            console.warn("БД недоступна — новость сохранена локально", error);
            set({ _dbAvailable: false });
          }
        }
        return post;
      },
      remove: (id) =>
        set((s) => {
          const items = s.items.filter((x) => x.id !== id);
          pushNews(items, s._dbAvailable, set);
          return { items, _hydrated: true };
        }),
      update: (id, patch) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, ...patch } : x));
          pushNews(items, s._dbAvailable, set);
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
          pushNews(items, s._dbAvailable, set);
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
          pushNews(items, s._dbAvailable, set);
          return { items, _hydrated: true };
        }),
      removeComment: (postId, commentId) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.id === postId
              ? { ...x, comments: x.comments.filter((c) => c.id !== commentId) }
              : x,
          );
          pushNews(items, s._dbAvailable, set);
          return { items, _hydrated: true };
        }),
      pin: (id, v) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, pinned: v } : x));
          pushNews(items, s._dbAvailable, set);
          return { items, _hydrated: true };
        }),
    }),
    { name: "sadova-news", partialize: (state) => ({ items: state.items }) },
  ),
);

function pushNews(
  items: NewsPost[],
  dbAvailable: boolean,
  set: (partial: Partial<State>) => void,
) {
  if (!dbAvailable) return;
  void saveCollection({ data: { name: "news", items } }).catch((error) => {
    console.warn("БД недоступна — новости сохранены локально", error);
    set({ _dbAvailable: false });
  });
}