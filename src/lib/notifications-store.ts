import { create } from "zustand";
import { persist } from "zustand/middleware";

// Веб-пуши: демо-версия. В проде — Push API + service worker + FCM.
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  link?: string;
}

interface State {
  items: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotifications = create<State>()(
  persist(
    (set) => ({
      items: [],
      push: (n) =>
        set((s) => ({
          items: [
            { ...n, id: crypto.randomUUID(), createdAt: Date.now(), read: false },
            ...s.items,
          ].slice(0, 50),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((x) => ({ ...x, read: true })) })),
      clear: () => set({ items: [] }),
    }),
    { name: "sadova-notifications" },
  ),
);