import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

/**
 * Персональные треды клиент ↔ техподдержка.
 * Каждый пользователь видит ТОЛЬКО свой чат.
 * Сотрудники (support/admin/owner) видят список всех тредов.
 * На проде — синхронизация с MySQL через /api/support (server/src/routes).
 */

export interface SupportMessage {
  id: string;
  author: "user" | "staff";
  authorName: string;
  text: string;
  createdAt: number;
}

export interface SupportThread {
  id: string;
  /** Владелец треда. Для гостей — session:<random>. */
  userId: string;
  userName: string;
  userEmail?: string;
  messages: SupportMessage[];
  createdAt: number;
  updatedAt: number;
  unreadForStaff: number;
  unreadForUser: number;
  closedAt?: number;
}

interface State {
  open: boolean;
  threads: SupportThread[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  toggle: () => void;
  setOpen: (v: boolean) => void;
  ensureThread: (user: { id: string; name: string; email?: string }) => SupportThread;
  getThread: (userId: string) => SupportThread | undefined;
  sendAsUser: (userId: string, text: string) => void;
  sendAsStaff: (
    threadId: string,
    text: string,
    staff: { name: string },
  ) => void;
  markReadByUser: (userId: string) => void;
  markReadByStaff: (threadId: string) => void;
  closeThread: (threadId: string) => void;
  removeThread: (threadId: string) => void;
}

function guestId() {
  if (typeof window === "undefined") return "guest:server";
  let g = window.localStorage.getItem("sadova-guest-id");
  if (!g) {
    g = "guest:" + createId("g");
    window.localStorage.setItem("sadova-guest-id", g);
  }
  return g;
}

export function getGuestId() {
  return guestId();
}

export const useSupportChat = create<State>()(
  persist(
    (set, get) => ({
      open: false,
      threads: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        await get().refresh();
        set({ _hydrated: true });
      },
      refresh: async () => {
        try {
          const remote = (await fetchCollection({ data: { name: "support-threads" } })) as SupportThread[] | null;
          if (!Array.isArray(remote)) return;
          const local = get().threads;
          const byId = new Map<string, SupportThread>();
          for (const t of [...local, ...remote]) {
            const prev = byId.get(t.userId);
            if (!prev) { byId.set(t.userId, t); continue; }
            // merge messages by id, keep newest counters
            const seen = new Set(prev.messages.map((m) => m.id));
            const merged = [...prev.messages];
            for (const m of t.messages) if (!seen.has(m.id)) merged.push(m);
            merged.sort((a, b) => a.createdAt - b.createdAt);
            const newer = t.updatedAt >= prev.updatedAt ? t : prev;
            byId.set(t.userId, {
              ...newer,
              messages: merged,
              unreadForStaff: Math.max(prev.unreadForStaff, t.unreadForStaff),
              unreadForUser: Math.max(prev.unreadForUser, t.unreadForUser),
            });
          }
          const merged = [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt);
          const same = merged.length === local.length &&
            merged.every((t, i) => local[i]?.id === t.id && local[i]?.messages.length === t.messages.length && local[i]?.updatedAt === t.updatedAt);
          if (!same) set({ threads: merged });
        } catch {
          /* offline */
        }
      },
      toggle: () => set((s) => ({ open: !s.open })),
      setOpen: (v) => set({ open: v }),
      ensureThread: (user) => {
        const existing = get().threads.find((t) => t.userId === user.id);
        if (existing) return existing;
        const t: SupportThread = {
          id: createId("thread"),
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          messages: [
            {
              id: createId("msg"),
              author: "staff",
              authorName: "Техподдержка SADOVA",
              text: `Здравствуйте, ${user.name.split(" ")[0] || "друг"}! Опишите ваш вопрос — оператор ответит в течение 10 минут.`,
              createdAt: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          unreadForStaff: 0,
          unreadForUser: 1,
        };
        set((s) => {
          const threads = [t, ...s.threads];
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        });
        return t;
      },
      getThread: (userId) => get().threads.find((t) => t.userId === userId),
      sendAsUser: (userId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const message: SupportMessage = {
          id: createId("msg"),
          author: "user",
          authorName: "",
          text: trimmed,
          createdAt: Date.now(),
        };
        set((s) => {
          const threads = s.threads.map((t) =>
            t.userId === userId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { ...message, authorName: t.userName },
                  ],
                  updatedAt: Date.now(),
                  unreadForStaff: t.unreadForStaff + 1,
                }
              : t,
          );
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        });
      },
      sendAsStaff: (threadId, text, staff) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const message: SupportMessage = {
          id: createId("msg"),
          author: "staff",
          authorName: staff.name,
          text: trimmed,
          createdAt: Date.now(),
        };
        set((s) => {
          const threads = s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, message],
                  updatedAt: Date.now(),
                  unreadForUser: t.unreadForUser + 1,
                }
              : t,
          );
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        });
      },
      markReadByUser: (userId) =>
        set((s) => {
          const threads = s.threads.map((t) =>
            t.userId === userId ? { ...t, unreadForUser: 0 } : t,
          );
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        }),
      markReadByStaff: (threadId) =>
        set((s) => {
          const threads = s.threads.map((t) =>
            t.id === threadId ? { ...t, unreadForStaff: 0 } : t,
          );
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        }),
      closeThread: (threadId) =>
        set((s) => {
          const threads = s.threads.map((t) =>
            t.id === threadId ? { ...t, closedAt: Date.now() } : t,
          );
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        }),
      removeThread: (threadId) =>
        set((s) => {
          const threads = s.threads.filter((t) => t.id !== threadId);
          void saveCollection({ data: { name: "support-threads", items: threads } }).catch(() => {});
          return { threads };
        }),
    }),
    { name: "sadova-support-threads" },
  ),
);