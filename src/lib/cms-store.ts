import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

// Простое хранилище «правок владельца» для инлайн-редактирования контента.
// Ключ — стабильный id блока (например "home.hero.title"), значение — текст
// или URL. В проде заменяется на REST/GraphQL к БД (Prisma/MySQL).

export type CmsKind = "text" | "image" | "video";

interface CmsState {
  editMode: boolean;
  values: Record<string, string>;
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  setEditMode: (v: boolean) => void;
  set: (key: string, value: string) => void;
  reset: (key: string) => void;
  get: (key: string, fallback: string) => string;
}

type CmsEntryDto = { id: string; key: string; value: string; kind: CmsKind };

function toEntries(values: Record<string, string>): CmsEntryDto[] {
  return Object.entries(values).map(([key, value]) => ({ id: key, key, value, kind: "text" }));
}

function push(values: Record<string, string>) {
  void saveCollection({ data: { name: "cms", items: toEntries(values) } }).catch(() => {});
}

export const useCms = create<CmsState>()(
  persist(
    (set, get) => ({
      editMode: false,
      values: {},
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const remote = (await fetchCollection({ data: { name: "cms" } })) as CmsEntryDto[];
          if (Array.isArray(remote)) {
            const values = remote.reduce<Record<string, string>>((acc, item) => {
              if (item?.key && typeof item.value === "string") acc[item.key] = item.value;
              return acc;
            }, {});
            set({ values, _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      setEditMode: (v) => set({ editMode: v }),
      set: (key, value) =>
        set((s) => {
          const values = { ...s.values, [key]: value };
          push(values);
          return { values };
        }),
      reset: (key) =>
        set((s) => {
          const { [key]: _drop, ...rest } = s.values;
          push(rest);
          return { values: rest };
        }),
      get: (key, fallback) => get().values[key] ?? fallback,
    }),
    { name: "sadova-cms", partialize: (s) => ({ values: s.values }) },
  ),
);