import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";
import type { StaffRole } from "./admin-store";

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
  send: (m: Omit<StaffMessage, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useStaffChat = create<State>()(
  persist(
    (set) => ({
      messages: [],
      send: (m) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { ...m, id: createId("smsg"), createdAt: Date.now() },
          ],
        })),
      remove: (id) =>
        set((s) => ({ messages: s.messages.filter((x) => x.id !== id) })),
      clear: () => set({ messages: [] }),
    }),
    { name: "sadova-staff-chat" },
  ),
);