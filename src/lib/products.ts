// Types & helpers only. Products themselves live in `products-store.ts`
// so they can be added/edited/deleted from the admin panel.
export type Category =
  | "benches"
  | "sides"
  | "chairs"
  | "tables"
  | "sofas"
  | "loungers"
  | "accessories";

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
  { id: "benches", label: "Скамейки" },
  { id: "sides", label: "Боковины для скамеек" },
  { id: "tables", label: "Столы" },
  { id: "chairs", label: "Кресла" },
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
