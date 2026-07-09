import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./cart-store";

export type PaymentMethod = "card" | "sbp" | "yookassa";
export type DeliveryMethod = "cdek" | "boxberry" | "courier";
export type OrderStatus = "new" | "paid" | "shipping" | "done" | "cancelled";

export interface Order {
  id: string;
  number: string;
  createdAt: number;
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
}

interface OrdersState {
  items: Order[];
  create: (o: Omit<Order, "id" | "number" | "createdAt" | "status">) => Order;
  setStatus: (id: string, status: OrderStatus) => void;
}

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
        };
        set((s) => ({ items: [order, ...s.items] }));
        return order;
      },
      setStatus: (id, status) =>
        set((s) => ({ items: s.items.map((o) => (o.id === id ? { ...o, status } : o)) })),
    }),
    { name: "sadova-orders" },
  ),
);