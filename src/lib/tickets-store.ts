import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  create: (t: { subject: string; email: string; text: string }) => string;
  reply: (id: string, author: "client" | "support", text: string) => void;
  setStatus: (id: string, status: TicketStatus) => void;
}

export const useTickets = create<TicketsState>()(
  persist(
    (set) => ({
      items: [],
      create: (t) => {
        const id = crypto.randomUUID();
        set((s) => ({
          items: [
            {
              id,
              subject: t.subject,
              email: t.email,
              status: "open",
              createdAt: Date.now(),
              messages: [
                {
                  id: crypto.randomUUID(),
                  author: "client",
                  text: t.text,
                  createdAt: Date.now(),
                },
              ],
            },
            ...s.items,
          ],
        }));
        return id;
      },
      reply: (id, author, text) =>
        set((s) => ({
          items: s.items.map((t) =>
            t.id === id
              ? {
                  ...t,
                  messages: [
                    ...t.messages,
                    { id: crypto.randomUUID(), author, text, createdAt: Date.now() },
                  ],
                }
              : t,
          ),
        })),
      setStatus: (id, status) =>
        set((s) => ({ items: s.items.map((t) => (t.id === id ? { ...t, status } : t)) })),
    }),
    { name: "sadova-tickets" },
  ),
);