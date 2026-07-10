import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag, ExternalLink, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { WishlistButton } from "./WishlistButton";

export function QuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    setAdded(false);
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  function handleAdd() {
    if (!product) return;
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-4xl -translate-y-1/2 overflow-hidden rounded-3xl bg-background shadow-2xl md:inset-x-6"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 backdrop-blur hover:bg-secondary"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid max-h-[85vh] overflow-auto md:grid-cols-2 md:overflow-hidden">
              <div className="relative aspect-square bg-surface">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <WishlistButton productId={product.id} className="absolute left-3 top-3" />
              </div>
              <div className="flex flex-col p-6 md:p-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {product.tagline}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  {product.name}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground line-clamp-4">
                  {product.description}
                </p>
                <div className="mt-5 text-2xl font-semibold tracking-tight">
                  {formatPrice(product.price)}
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleAdd}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-[13px] font-medium text-background transition-transform active:scale-[0.98]"
                  >
                    {added ? (
                      <>
                        <Check className="h-4 w-4" /> Добавлено
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" /> В корзину
                      </>
                    )}
                  </button>
                  <Link
                    to="/catalog/$slug"
                    params={{ slug: product.slug }}
                    onClick={onClose}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-hairline px-5 text-[13px] font-medium hover:bg-surface"
                  >
                    Подробнее <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
                {product.specs?.length > 0 && (
                  <dl className="mt-6 divide-y divide-hairline border-t border-hairline text-[13px]">
                    {product.specs.slice(0, 4).map((s) => (
                      <div key={s.label} className="flex justify-between py-2.5">
                        <dt className="text-muted-foreground">{s.label}</dt>
                        <dd className="font-medium">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}