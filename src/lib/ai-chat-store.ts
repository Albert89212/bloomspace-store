import { create } from "zustand";
import { persist } from "zustand/middleware";

// UIMessage-совместимый минимум для локального хранения.
export interface AiMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

interface State {
  messages: AiMessage[];
  add: (m: Omit<AiMessage, "id" | "createdAt">) => AiMessage;
  appendToLast: (chunk: string) => void;
  reset: () => void;
  setLastError: (msg: string) => void;
}

export const useAiChat = create<State>()(
  persist(
    (set) => ({
      messages: [],
      add: (m) => {
        const msg: AiMessage = {
          ...m,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
        return msg;
      },
      appendToLast: (chunk) =>
        set((s) => {
          if (s.messages.length === 0) return s;
          const last = s.messages[s.messages.length - 1];
          if (last.role !== "assistant") return s;
          const updated = { ...last, content: last.content + chunk };
          return { messages: [...s.messages.slice(0, -1), updated] };
        }),
      reset: () => set({ messages: [] }),
      setLastError: (msg) =>
        set((s) => {
          if (s.messages.length === 0) return s;
          const last = s.messages[s.messages.length - 1];
          if (last.role !== "assistant") return s;
          const updated = { ...last, content: msg };
          return { messages: [...s.messages.slice(0, -1), updated] };
        }),
    }),
    { name: "sadova-ai-chat" },
  ),
);