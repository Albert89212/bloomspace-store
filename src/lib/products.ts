import chair from "@/assets/hero-chair.jpg";
import table from "@/assets/product-table.jpg";
import sofa from "@/assets/product-sofa.jpg";
import lounger from "@/assets/product-lounger.jpg";
import coffee from "@/assets/product-coffee.jpg";
import hammock from "@/assets/product-hammock.jpg";

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
}

export const categories: { id: Category; label: string }[] = [
  { id: "chairs", label: "Кресла" },
  { id: "tables", label: "Столы" },
  { id: "sofas", label: "Диваны" },
  { id: "loungers", label: "Шезлонги" },
  { id: "accessories", label: "Аксессуары" },
];

export const products: Product[] = [
  {
    id: "1",
    slug: "aero-lounge",
    name: "Aero Lounge",
    tagline: "Кресло из алюминия",
    description:
      "Лаконичное лаунж-кресло из анодированного алюминия и текстилена. Устойчиво к дождю, солнцу и морскому воздуху.",
    price: 89900,
    category: "chairs",
    image: chair,
    rating: 4.9,
    specs: [
      { label: "Материал", value: "Алюминий, текстилен" },
      { label: "Габариты", value: "78 × 82 × 74 см" },
      { label: "Вес", value: "8.4 кг" },
      { label: "Гарантия", value: "5 лет" },
    ],
  },
  {
    id: "2",
    slug: "teak-dining",
    name: "Teak Dining",
    tagline: "Обеденный стол из тика",
    description: "Массив тика с натуральным маслом. Естественная патина и максимальная влагостойкость.",
    price: 149900,
    category: "tables",
    image: table,
    rating: 4.8,
    specs: [
      { label: "Материал", value: "Массив тика" },
      { label: "Габариты", value: "220 × 100 × 74 см" },
      { label: "Мест", value: "6–8" },
      { label: "Гарантия", value: "7 лет" },
    ],
  },
  {
    id: "3",
    slug: "rattan-sofa",
    name: "Rattan Sofa",
    tagline: "Модульный диван",
    description: "Искусственный ротанг премиум-класса с водоотталкивающими подушками Sunbrella®.",
    price: 189900,
    category: "sofas",
    image: sofa,
    rating: 4.9,
    specs: [
      { label: "Материал", value: "PE-ротанг, Sunbrella" },
      { label: "Габариты", value: "220 × 90 × 72 см" },
      { label: "Мест", value: "3" },
      { label: "Гарантия", value: "5 лет" },
    ],
  },
  {
    id: "4",
    slug: "steel-chaise",
    name: "Steel Chaise",
    tagline: "Шезлонг из стали",
    description: "Порошковая окраска, эргономичный изгиб, регулировка спинки в 5 положений.",
    price: 64900,
    category: "loungers",
    image: lounger,
    rating: 4.7,
    specs: [
      { label: "Материал", value: "Сталь с полимерным покрытием" },
      { label: "Габариты", value: "195 × 65 × 90 см" },
      { label: "Нагрузка", value: "до 150 кг" },
      { label: "Гарантия", value: "3 года" },
    ],
  },
  {
    id: "5",
    slug: "stone-coffee",
    name: "Stone Coffee",
    tagline: "Кофейный столик",
    description: "Композитный камень на литом основании. Не боится перепадов температуры.",
    price: 42900,
    category: "tables",
    image: coffee,
    rating: 4.8,
    specs: [
      { label: "Материал", value: "Кварцевый композит" },
      { label: "Диаметр", value: "80 см" },
      { label: "Высота", value: "42 см" },
      { label: "Гарантия", value: "10 лет" },
    ],
  },
  {
    id: "6",
    slug: "sky-hammock",
    name: "Sky Hammock",
    tagline: "Подвесное кресло",
    description: "Плетение вручную из натурального хлопка. В комплекте — крепёж и подушка.",
    price: 34900,
    category: "accessories",
    image: hammock,
    rating: 4.9,
    specs: [
      { label: "Материал", value: "Хлопок, бук" },
      { label: "Габариты", value: "120 × 80 см" },
      { label: "Нагрузка", value: "до 120 кг" },
      { label: "Гарантия", value: "2 года" },
    ],
  },
];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);