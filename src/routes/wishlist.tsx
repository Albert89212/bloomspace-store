import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist-store";
import { useProducts } from "@/lib/products-store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Избранное — SADOVA" },
      { name: "description", content: "Ваши избранные модели садовой мебели SADOVA." },
      { property: "og:title", content: "Избранное — SADOVA" },
      { property: "og:description", content: "Сохранённые модели SADOVA." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);
  const products = useProducts((s) => s.items);
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Избранное
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">
            Сохранённые модели
          </h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="text-[13px] text-muted-foreground underline hover:text-foreground"
          >
            Очистить
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-surface p-12 text-center">
          <Heart className="h-8 w-8 text-muted-foreground" />
          <p className="text-[14px] text-muted-foreground">
            Пока пусто. Нажмите сердечко на карточке товара, чтобы сохранить его сюда.
          </p>
          <Link
            to="/catalog"
            className="mt-2 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-[13px] font-medium text-background"
          >
            В каталог
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}