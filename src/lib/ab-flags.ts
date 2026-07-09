// Простые A/B-флаги: детерминированное распределение по userId/anon-id.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FlagKey = "hero-copy" | "checkout-cta" | "price-anchor";

interface State {
  anonId: string;
  overrides: Partial<Record<FlagKey, "A" | "B">>;
  variant: (key: FlagKey) => "A" | "B";
  setOverride: (key: FlagKey, v: "A" | "B" | null) => void;
}

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const useAB = create<State>()(
  persist(
    (set, get) => ({
      anonId: crypto.randomUUID(),
      overrides: {},
      variant: (key) => {
        const o = get().overrides[key];
        if (o) return o;
        return hash(get().anonId + ":" + key) % 2 === 0 ? "A" : "B";
      },
      setOverride: (key, v) =>
        set((s) => {
          const next = { ...s.overrides };
          if (v === null) delete next[key];
          else next[key] = v;
          return { overrides: next };
        }),
    }),
    { name: "sadova-ab" },
  ),
);