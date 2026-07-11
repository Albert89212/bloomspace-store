import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

export type TicketStatus = "open" | "in_progress" | "resolved";

export interface TicketMessage {
  id: string;
  author: "client" | "support";
  authorName?: string;
  authorRole?: string; // отображается клиенту: "Техподдержка", "Модератор" и т.п.
  text: string;
  createdAt: number;
}

export interface Ticket {
  id: string;
  subject: string;
  email: string;
  userId?: string; // если тикет создал зарегистрированный пользователь
  status: TicketStatus;
  createdAt: number;
  messages: TicketMessage[];
}

interface TicketsState {
  items: Ticket[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  create: (t: { subject: string; email: string; text: string; userId?: string; authorName?: string }) => string;
  reply: (
    id: string,
    author: "client" | "support",
    text: string,
    meta?: { authorName?: string; authorRole?: string },
  ) => void;
  setStatus: (id: string, status: TicketStatus) => void;
}

const push = (items: Ticket[]) => {
  void saveCollection({ data: { name: "tickets", items } }).catch(() => {});
};

export const useTickets = create<TicketsState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "tickets" } })) as Ticket[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      create: (t) => {
        const id = createId("ticket");
        const ticket: Ticket = {
          id,
          subject: t.subject,
          email: t.email,
          userId: t.userId,
          status: "open",
          createdAt: Date.now(),
          messages: [
            {
              id: createId("message"),
              author: "client",
              authorName: t.authorName ?? t.email,
              text: t.text,
              createdAt: Date.now(),
            },
          ],
        };
        set((s) => {
          const items = [ticket, ...s.items];
          push(items);
          return { items };
        });
        return id;
      },
      reply: (id, author, text, meta) =>
        set((s) => {
          const items = s.items.map((t) =>
            t.id === id
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    {
                      id: createId("message"),
                      author,
                      authorName: meta?.authorName,
                      authorRole: meta?.authorRole,
                      text,
                      createdAt: Date.now(),
                    },
                  ],
                }
              : t,
          );
          push(items);
          return { items };
        }),
      setStatus: (id, status) =>
        set((s) => {
          const items = s.items.map((t) => (t.id === id ? { ...t, status } : t));
          push(items);
          return { items };
        }),
    }),
    { name: "sadova-tickets" },
  ),
);