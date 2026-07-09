import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useCart, selectCartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Корзина — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const total = useCart(selectCartTotal);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Корзина</h1>

      {items.length === 0 ? (
        <div className="mt-12 rounded-3xl bg-surface p-16 text-center">
          <div className="text-[15px] text-muted-foreground">Корзина пуста</div>
          <Link
            to="/catalog"
            className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-[14px] font-medium text-background"
          >
            К каталогу
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-hairline">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-5 py-6"
                >
                  <Link
                    to="/catalog/$slug"
                    params={{ slug: item.slug }}
                    className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="text-[15px] font-medium">{item.name}</div>
                    <div className="mt-1 text-[13px] text-muted-foreground">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-hairline">
                    <button
                      onClick={() => setQty(item.id, item.quantity - 1)}
                      className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Уменьшить"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-[13px]">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.id, item.quantity + 1)}
                      className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Увеличить"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="w-24 text-right text-[15px] font-medium tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Удалить"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <motion.aside
            layout
            className="h-fit rounded-3xl bg-surface p-6"
          >
            <div className="text-[15px] font-medium">Итого</div>
            <dl className="mt-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Товары</dt>
                <dd className="tabular-nums">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Доставка</dt>
                <dd className="text-muted-foreground">Рассчитаем при оформлении</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-hairline pt-5">
              <div className="text-[13px] text-muted-foreground">К оплате</div>
              <div className="text-2xl font-semibold tabular-nums">
                {formatPrice(total)}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate({ to: "/checkout" })}
              disabled={items.length === 0}
              className="mt-6 h-12 w-full rounded-full bg-foreground text-[14px] font-medium text-background"
            >
              Оформить заказ
            </motion.button>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Нажимая «Оформить», вы соглашаетесь с публичной офертой и обработкой персональных
              данных согласно 152-ФЗ.
            </p>
          </motion.aside>
        </div>
      )}
    </div>
  );
}