import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cart-store";

export type PaymentMethod = "card" | "sbp" | "yookassa";
export type DeliveryMethod = "cdek" | "boxberry" | "ozon" | "pochta" | "courier";
export type OrderStatus = "new" | "paid" | "shipping" | "done" | "cancelled";

export interface OrderMessage {
  id: string;
  author: "client" | "staff";
  authorName: string;
  text: string;
  createdAt: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: number;
  userId?: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
  };
  payment: PaymentMethod;
  delivery: DeliveryMethod;
  status: OrderStatus;
  contractAccepted: boolean;
  contractIp: string;
  messages: OrderMessage[];
}

interface OrdersState {
  items: Order[];
  create: (o: Omit<Order, "id" | "number" | "createdAt" | "status" | "messages">) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  addMessage: (
    orderId: string,
    m: Omit<OrderMessage, "id" | "createdAt">,
  ) => void;
  pruneOldMessages: () => void;
}

const MESSAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней — авто-удаление переписки

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      items: [],
      create: (o) => {
        const id = crypto.randomUUID();
        const number = `SD-${String(get().items.length + 1001).padStart(5, "0")}`;
        const order: Order = {
          ...o,
          id,
          number,
          createdAt: Date.now(),
          status: "new",
          messages: [],
        };
        set((s) => ({ items: [order, ...s.items] }));
        return order;
      },
      setStatus: (id, status) =>
        set((s) => ({ items: s.items.map((o) => (o.id === id ? { ...o, status } : o)) })),
      addMessage: (orderId, m) =>
        set((s) => ({
          items: s.items.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  messages: [
                    ...(o.messages ?? []),
                    { ...m, id: crypto.randomUUID(), createdAt: Date.now() },
                  ],
                }
              : o,
          ),
        })),
      pruneOldMessages: () => {
        const now = Date.now();
        set((s) => ({
          items: s.items.map((o) => ({
            ...o,
            messages: (o.messages ?? []).filter((m) => now - m.createdAt < MESSAGE_TTL_MS),
          })),
        }));
      },
    }),
    {
      name: "sadova-orders-v2",
      // Гарантируем наличие поля messages для заказов из старой версии.
      migrate: (persisted: unknown) => {
        const p = persisted as { items?: Order[] } | undefined;
        if (p?.items) p.items = p.items.map((o) => ({ ...o, messages: o.messages ?? [] }));
        return p as OrdersState;
      },
      version: 2,
    },
  ),
);