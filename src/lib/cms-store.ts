import { create } from "zustand";
import { persist } from "zustand/middleware";

// Простое хранилище «правок владельца» для инлайн-редактирования контента.
// Ключ — стабильный id блока (например "home.hero.title"), значение — текст
// или URL. В проде заменяется на REST/GraphQL к БД (Prisma/MySQL).

export type CmsKind = "text" | "image" | "video";

interface CmsState {
  editMode: boolean;
  values: Record<string, string>;
  setEditMode: (v: boolean) => void;
  set: (key: string, value: string) => void;
  reset: (key: string) => void;
  get: (key: string, fallback: string) => string;
}

export const useCms = create<CmsState>()(
  persist(
    (set, get) => ({
      editMode: false,
      values: {},
      setEditMode: (v) => set({ editMode: v }),
      set: (key, value) => set((s) => ({ values: { ...s.values, [key]: value } })),
      reset: (key) =>
        set((s) => {
          const { [key]: _drop, ...rest } = s.values;
          return { values: rest };
        }),
      get: (key, fallback) => get().values[key] ?? fallback,
    }),
    { name: "sadova-cms", partialize: (s) => ({ values: s.values }) },
  ),
);