import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

export type PromoType = "percent" | "fixed";

export interface Promocode {
  id: string;
  code: string;
  type: PromoType;
  value: number;
  minTotal: number;
  active: boolean;
  usageLimit: number | null;
  used: number;
  createdAt: number;
  expiresAt: number | null;
}

interface PromoState {
  items: Promocode[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  create: (p: Omit<Promocode, "id" | "used" | "createdAt">) => void;
  update: (id: string, patch: Partial<Promocode>) => void;
  remove: (id: string) => void;
  incrementUse: (id: string) => void;
  apply: (code: string, total: number) => { ok: true; promo: Promocode; discount: number } | { ok: false; reason: string };
}

const uid = () => Math.random().toString(36).slice(2, 10);
const push = (items: Promocode[]) => {
  void saveCollection({ data: { name: "promocodes", items } }).catch(() => {});
};

export const usePromocodes = create<PromoState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "promocodes" } })) as Promocode[];
          if (Array.isArray(remote)) {
            set({ items: remote, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      create: (p) =>
        set((s) => {
          const items = [
            {
              ...p,
              code: p.code.trim().toUpperCase(),
              id: uid(),
              used: 0,
              createdAt: Date.now(),
            },
            ...s.items,
          ];
          push(items);
          return { items };
        }),
      update: (id, patch) =>
        set((s) => {
          const items = s.items.map((x) =>
            x.id === id ? { ...x, ...patch, code: (patch.code ?? x.code).toUpperCase() } : x,
          );
          push(items);
          return { items };
        }),
      remove: (id) => set((s) => {
        const items = s.items.filter((x) => x.id !== id);
        push(items);
        return { items };
      }),
      incrementUse: (id) =>
        set((s) => {
          const items = s.items.map((x) => (x.id === id ? { ...x, used: x.used + 1 } : x));
          push(items);
          return { items };
        }),
      apply: (code, total) => {
        const c = code.trim().toUpperCase();
        const promo = get().items.find((x) => x.code === c);
        if (!promo) return { ok: false, reason: "Промокод не найден" };
        if (!promo.active) return { ok: false, reason: "Промокод отключён" };
        if (promo.expiresAt && Date.now() > promo.expiresAt)
          return { ok: false, reason: "Срок действия истёк" };
        if (promo.usageLimit && promo.used >= promo.usageLimit)
          return { ok: false, reason: "Лимит использований исчерпан" };
        if (total < promo.minTotal)
          return { ok: false, reason: `Минимальная сумма ${promo.minTotal.toLocaleString("ru-RU")} ₽` };
        const raw =
          promo.type === "percent" ? Math.round((total * promo.value) / 100) : promo.value;
        const discount = Math.min(raw, total);
        return { ok: true, promo, discount };
      },
    }),
    { name: "sadova-promocodes" },
  ),
);
