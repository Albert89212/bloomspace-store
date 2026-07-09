import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatPrice, type Product } from "@/lib/products";

const catAccent: Record<string, string> = {
  benches: "var(--brand)",
  sides: "var(--accent-cool)",
  chairs: "var(--brand)",
  tables: "var(--accent-warm)",
  sofas: "var(--accent-cool)",
  loungers: "var(--brand)",
  accessories: "var(--accent-warm)",
};
const catLabel: Record<string, string> = {
  benches: "Скамейка",
  sides: "Боковина",
  chairs: "Кресло",
  tables: "Стол",
  sofas: "Диван",
  loungers: "Шезлонг",
  accessories: "Аксессуар",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const accent = catAccent[product.category] ?? "var(--brand)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link
        to="/catalog/$slug"
        params={{ slug: product.slug }}
        className="group block"
      >
        <div
          className="relative aspect-square overflow-hidden rounded-3xl bg-surface transition-shadow duration-500 group-hover:shadow-xl"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(60% 40% at 50% 100%, color-mix(in oklab, ${accent} 35%, transparent), transparent 70%)`,
            }}
          />
          <span
            className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {catLabel[product.category] ?? "Модель"}
          </span>
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[15px] font-medium tracking-tight">{product.name}</div>
            <div className="mt-0.5 truncate text-[13px] text-muted-foreground">{product.tagline}</div>
          </div>
          <div className="shrink-0 text-[15px] font-semibold tracking-tight">
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}