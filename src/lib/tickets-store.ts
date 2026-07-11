import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

export type TicketStatus = "open" | "in_progress" | "resolved";

export interface TicketMessage {
  id: string;
  author: "client" | "support";
  text: string;
  createdAt: number;
}

export interface Ticket {
  id: string;
  subject: string;
  email: string;
  status: TicketStatus;
  createdAt: number;
  messages: TicketMessage[];
}

interface TicketsState {
  items: Ticket[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  create: (t: { subject: string; email: string; text: string }) => string;
  reply: (id: string, author: "client" | "support", text: string) => void;
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
          status: "open",
          createdAt: Date.now(),
          messages: [
            {
              id: createId("message"),
              author: "client",
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
      reply: (id, author, text) =>
        set((s) => {
          const items = s.items.map((t) =>
            t.id === id
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { id: createId("message"), author, text, createdAt: Date.now() },
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