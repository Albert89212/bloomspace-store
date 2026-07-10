import { create } from "zustand";
import { persist } from "zustand/middleware";

// Общий чат поддержки (виджет на всех страницах).
export interface SupportMessage {
  id: string;
  author: "user" | "bot" | "staff";
  authorName: string;
  text: string;
  createdAt: number;
}

interface State {
  open: boolean;
  messages: SupportMessage[];
  toggle: () => void;
  setOpen: (v: boolean) => void;
  send: (text: string, userName?: string) => void;
  reset: () => void;
}

const WELCOME: SupportMessage = {
  id: "welcome",
  author: "bot",
  authorName: "SADOVA Bot",
  text:
    "Здравствуйте! Я помогу с выбором, доставкой и оплатой. Опишите вопрос — свободный оператор ответит в течение 10 минут.",
  createdAt: Date.now(),
};

export const useSupportChat = create<State>()(
  persist(
    (set, get) => ({
      open: false,
      messages: [WELCOME],
      toggle: () => set((s) => ({ open: !s.open })),
      setOpen: (v) => set({ open: v }),
      send: (text, userName = "Вы") => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: crypto.randomUUID(),
              author: "user",
              authorName: userName,
              text: trimmed,
              createdAt: Date.now(),
            },
          ],
        }));
        // Демо-автоответ. В проде — WebSocket с оператором.
        setTimeout(() => {
          const auto = pickAutoReply(trimmed);
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: crypto.randomUUID(),
                author: "bot",
                authorName: "SADOVA Bot",
                text: auto,
                createdAt: Date.now(),
              },
            ],
          }));
          void get();
        }, 900);
      },
      reset: () => set({ messages: [WELCOME] }),
    }),
    { name: "sadova-support-chat" },
  ),
);

function pickAutoReply(q: string) {
  const l = q.toLowerCase();
  if (l.includes("достав")) return "Доставляем через ПВЗ Ozon и Почтой России, есть курьер по крупным городам. Подробности на /delivery.";
  if (l.includes("оплат")) return "Принимаем карты, СБП и ЮMoney через ЮKassa. Все платежи с 3-D Secure.";
  if (l.includes("возврат") || l.includes("гарант"))
    return "Возврат в течение 7 дней по ст. 26.1 ЗоЗПП. Заявление можно оформить в личном кабинете.";
  return "Спасибо за обращение! Оператор подключится в течение 10 минут. Средний ответ — 3 минуты.";
}