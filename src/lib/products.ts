// Types & helpers only. Products themselves live in `products-store.ts`
// so they can be added/edited/deleted from the admin panel.
export type Category = "chairs" | "tables" | "sofas" | "loungers" | "accessories";

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  rating: number;
  specs: { label: string; value: string }[];
  material?: string;
  color?: string;
  collection?: string;
  wholesalePrice?: number;
  stock?: number;
}

export const categories: { id: Category; label: string }[] = [
  { id: "chairs", label: "Кресла" },
  { id: "tables", label: "Столы" },
  { id: "sofas", label: "Диваны" },
  { id: "loungers", label: "Шезлонги" },
  { id: "accessories", label: "Аксессуары" },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
