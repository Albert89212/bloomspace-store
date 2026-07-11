import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cart-store";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

export type PaymentMethod = "card" | "sbp" | "yookassa";
export type DeliveryMethod = "ozon" | "pochta" | "courier";
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
  deleteRequest?: {
    by: "client" | "staff";
    byName: string;
    at: number;
  } | null;
}

interface OrdersState {
  items: Order[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  create: (o: Omit<Order, "id" | "number" | "createdAt" | "status" | "messages">) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
  addMessage: (
    orderId: string,
    m: Omit<OrderMessage, "id" | "createdAt">,
  ) => void;
  requestDeleteMessages: (
    orderId: string,
    by: "client" | "staff",
    byName: string,
  ) => void;
  cancelDeleteRequest: (orderId: string) => void;
  confirmDeleteMessages: (
    orderId: string,
    by: "client" | "staff",
  ) => void;
  pruneOldMessages: () => void;
}

const MESSAGE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 дней — авто-удаление переписки

const push = (items: Order[]) => {
  void saveCollection({ data: { name: "orders", items } }).catch(() => {});
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "orders" } })) as Order[];
          if (Array.isArray(remote) && remote.length) {
            set({ items: remote.map((o) => ({ ...o, messages: o.messages ?? [] })), _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      create: (o) => {
        const id = createId("order");
        const number = `SD-${String(get().items.length + 1001).padStart(5, "0")}`;
        const order: Order = {
          ...o,
          id,
          number,
          createdAt: Date.now(),
          status: "new",
          messages: [],
        };
        set((s) => {
          const items = [order, ...s.items];
          push(items);
          return { items };
        });
        return order;
      },
      setStatus: (id, status) =>
        set((s) => {
          const items = s.items.map((o) => (o.id === id ? { ...o, status } : o));
          push(items);
          return { items };
        }),
      addMessage: (orderId, m) =>
        set((s) => {
          const items = s.items.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  messages: [
                    ...(o.messages ?? []),
                    { ...m, id: createId("message"), createdAt: Date.now() },
                  ],
                }
              : o,
          );
          push(items);
          return { items };
        }),
      requestDeleteMessages: (orderId, by, byName) =>
        set((s) => {
          const items = s.items.map((o) =>
            o.id === orderId
              ? { ...o, deleteRequest: { by, byName, at: Date.now() } }
              : o,
          );
          push(items);
          return { items };
        }),
      cancelDeleteRequest: (orderId) =>
        set((s) => {
          const items = s.items.map((o) =>
            o.id === orderId ? { ...o, deleteRequest: null } : o,
          );
          push(items);
          return { items };
        }),
      confirmDeleteMessages: (orderId, by) =>
        set((s) => {
          const items = s.items.map((o) => {
            if (o.id !== orderId) return o;
            if (!o.deleteRequest || o.deleteRequest.by === by) return o;
            return { ...o, messages: [], deleteRequest: null };
          });
          push(items);
          return { items };
        }),
      pruneOldMessages: () => {
        const now = Date.now();
        set((s) => {
          const items = s.items.map((o) => ({
            ...o,
            messages: (o.messages ?? []).filter((m) => now - m.createdAt < MESSAGE_TTL_MS),
          }));
          push(items);
          return { items };
        });
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