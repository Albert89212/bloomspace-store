import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, type Category } from "@/lib/products";
import { useProducts } from "@/lib/products-store";

export const Route = createFileRoute("/catalog/")({
  head: () => ({
    meta: [
      { title: "Каталог садовой мебели: скамейки, столы, боковины — SADOVA" },
      {
        name: "description",
        content:
          "Скамейки, боковины для скамеек, садовые столы, кресла и шезлонги из тика и стали. Доставка СДЭК, Boxberry, Почта России, ПВЗ Ozon по всей РФ.",
      },
      {
        name: "keywords",
        content:
          "садовая мебель, скамейки, боковины для скамеек, чугунные боковины, садовые столы, купить скамейку, мебель для дачи",
      },
      { property: "og:title", content: "Каталог садовой мебели SADOVA" },
      {
        property: "og:description",
        content: "Скамейки, боковины, садовые столы и кресла из тика и стали.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/catalog" },
    ],
    links: [{ rel: "canonical", href: "/catalog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Каталог садовой мебели SADOVA",
          description:
            "Скамейки, боковины для скамеек, столы, кресла и шезлонги для сада и дачи.",
        }),
      },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [active, setActive] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const products = useProducts((s) => s.items);
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = active === "all" || p.category === active;
        const matchQ =
          q.trim() === "" ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.tagline.toLowerCase().includes(q.toLowerCase());
        return matchCat && matchQ;
      }),
    [active, q, products],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Каталог
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">Все модели</h1>
      </motion.div>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            Все
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={active === c.id}
              onClick={() => setActive(c.id)}
              color={catColor[c.id]}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск"
            className="h-10 w-full rounded-full border border-hairline bg-surface pl-9 pr-4 text-[13px] outline-none transition-all focus:border-foreground"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-[14px] text-muted-foreground">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}

const catColor: Record<string, string> = {
  benches: "var(--brand)",
  sides: "var(--accent-cool)",
  chairs: "var(--brand)",
  tables: "var(--accent-warm)",
  sofas: "var(--accent-cool)",
  loungers: "var(--brand)",
  accessories: "var(--accent-warm)",
};

function FilterChip({
  active,
  onClick,
  children,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] transition-all active:scale-[0.97] ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-hairline bg-surface text-muted-foreground hover:text-foreground"
      }`}
    >
      {color && (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      {children}
    </button>
  );
}