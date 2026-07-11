import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "./id";

export interface GiftCertificate {
  id: string;
  code: string;
  amount: number;
  fromName: string;
  toName: string;
  toEmail: string;
  message: string;
  createdAt: number;
  redeemed: boolean;
}

interface State {
  items: GiftCertificate[];
  issue: (c: Omit<GiftCertificate, "id" | "code" | "createdAt" | "redeemed">) => GiftCertificate;
  redeem: (code: string) => GiftCertificate | null;
}

function code() {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return (
    "GC-" +
    Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => s[Math.floor(Math.random() * s.length)]).join(""),
    ).join("-")
  );
}

export const useGifts = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      issue: (c) => {
        const gc: GiftCertificate = {
          ...c,
          id: createId("gift"),
          code: code(),
          createdAt: Date.now(),
          redeemed: false,
        };
        set((s) => ({ items: [gc, ...s.items] }));
        return gc;
      },
      redeem: (input) => {
        const gc = get().items.find((x) => x.code === input && !x.redeemed);
        if (!gc) return null;
        set((s) => ({
          items: s.items.map((x) => (x.id === gc.id ? { ...x, redeemed: true } : x)),
        }));
        return gc;
      },
    }),
    { name: "sadova-gifts" },
  ),
);