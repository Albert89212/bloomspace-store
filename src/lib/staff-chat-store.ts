import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import type { StaffRole } from "./admin-store";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

/**
 * Внутренний чат сотрудников (owner/admin/moderator/support/orders).
 * Клиенты сюда не имеют доступа.
 * Данные хранятся в БД (см. prisma/schema.prisma → StaffChatMessage).
 */

export interface StaffMessage {
  id: string;
  authorId: string;
  authorName: string;
  role: StaffRole;
  text: string;
  createdAt: number;
}

interface State {
  messages: StaffMessage[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  send: (m: Omit<StaffMessage, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useStaffChat = create<State>()(
  persist(
    (set, get) => ({
      messages: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "staff-chat" } })) as StaffMessage[];
          if (Array.isArray(remote)) {
            set({ messages: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      send: (m) =>
        set((s) => {
          const messages = [
            ...s.messages,
            { ...m, id: createId("smsg"), createdAt: Date.now() },
          ];
          void saveCollection({ data: { name: "staff-chat", items: messages } }).catch(() => {});
          return { messages };
        }),
      remove: (id) =>
        set((s) => {
          const messages = s.messages.filter((x) => x.id !== id);
          void saveCollection({ data: { name: "staff-chat", items: messages } }).catch(() => {});
          return { messages };
        }),
      clear: () => {
        void saveCollection({ data: { name: "staff-chat", items: [] } }).catch(() => {});
        set({ messages: [] });
      },
    }),
    { name: "sadova-staff-chat" },
  ),
);