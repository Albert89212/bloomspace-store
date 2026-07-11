import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Category } from "./products";
import { fetchCollection, saveCollection } from "./shared-collection.functions";
import { seedProducts } from "./seed-products";

interface ProductsState {
  items: Product[];
  _hydrated: boolean;
  _dbAvailable: boolean;
  hydrate: () => Promise<void>;
  create: (p: Omit<Product, "id" | "rating">) => Promise<Product>;
  update: (id: string, patch: Partial<Product>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  findBySlug: (slug: string) => Product | undefined;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
        з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[c] ?? "";
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const useProducts = create<ProductsState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,
      _dbAvailable: true,
      hydrate: async () => {
        try {
          const remote = (await fetchCollection({ data: { name: "products" } })) as Product[];
          if (Array.isArray(remote)) {
            if (remote.length === 0) {
              // БД пустая — засеиваем стартовыми объявлениями
              set({ items: seedProducts, _hydrated: true, _dbAvailable: true });
              try {
                await saveCollection({ data: { name: "products", items: seedProducts } });
              } catch {}
              return;
            }
            set({ items: remote, _hydrated: true, _dbAvailable: true });
            return;
          }
        } catch (error) {
          console.warn("БД недоступна — работаем с локальным кэшем объявлений", error);
          set({ _dbAvailable: false });
        } finally {
          set({ _hydrated: true });
        }
        // Fallback: если стор всё ещё пуст (нет БД и нет локального кэша) — используем seed
        if (get().items.length === 0) {
          set({ items: seedProducts });
        }
      },
      create: async (p) => {
        const base = p.slug?.trim() ? slugify(p.slug) : slugify(p.name);
        let slug = base || uid();
        let n = 2;
        while (get().items.some((x) => x.slug === slug)) slug = `${base}-${n++}`;
        const product: Product = { ...p, slug, id: uid(), rating: 5 };
        const items = [product, ...get().items];
        set({ items, _hydrated: true });
        if (get()._dbAvailable) {
          try {
            await saveCollection({ data: { name: "products", items } });
          } catch (error) {
            console.warn("БД недоступна — объявление сохранено локально", error);
            set({ _dbAvailable: false });
          }
        }
        return product;
      },
      update: async (id, patch) => {
        const items = get().items.map((x) => (x.id === id ? { ...x, ...patch } : x));
        set({ items, _hydrated: true });
        if (get()._dbAvailable) {
          try {
            await saveCollection({ data: { name: "products", items } });
          } catch (error) {
            console.warn("БД недоступна — правка сохранена локально", error);
            set({ _dbAvailable: false });
          }
        }
      },
      remove: async (id) => {
        const items = get().items.filter((x) => x.id !== id);
        set({ items, _hydrated: true });
        if (get()._dbAvailable) {
          try {
            await saveCollection({ data: { name: "products", items } });
          } catch (error) {
            console.warn("БД недоступна — удаление сохранено локально", error);
            set({ _dbAvailable: false });
          }
        }
      },
      findBySlug: (slug) => get().items.find((x) => x.slug === slug),
    }),
    { name: "sadova-products", partialize: (state) => ({ items: state.items }) },
  ),
);

export type { Category };
