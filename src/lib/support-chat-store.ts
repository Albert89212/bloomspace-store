import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";

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
        set((s) => ({ threads: [t, ...s.threads] }));
        return t;
      },
      getThread: (userId) => get().threads.find((t) => t.userId === userId),
      sendAsUser: (userId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          threads: s.threads.map((t) =>
            t.userId === userId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      id: createId("msg"),
                      author: "user",
                      authorName: t.userName,
                      text: trimmed,
                      createdAt: Date.now(),
                    },
                  ],
                  updatedAt: Date.now(),
                  unreadForStaff: t.unreadForStaff + 1,
                }
              : t,
          ),
        }));
      },
      sendAsStaff: (threadId, text, staff) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      id: createId("msg"),
                      author: "staff",
                      authorName: staff.name,
                      text: trimmed,
                      createdAt: Date.now(),
                    },
                  ],
                  updatedAt: Date.now(),
                  unreadForUser: t.unreadForUser + 1,
                }
              : t,
          ),
        }));
      },
      markReadByUser: (userId) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.userId === userId ? { ...t, unreadForUser: 0 } : t,
          ),
        })),
      markReadByStaff: (threadId) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, unreadForStaff: 0 } : t,
          ),
        })),
      closeThread: (threadId) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, closedAt: Date.now() } : t,
          ),
        })),
      removeThread: (threadId) =>
        set((s) => ({ threads: s.threads.filter((t) => t.id !== threadId) })),
    }),
    { name: "sadova-support-threads" },
  ),
);