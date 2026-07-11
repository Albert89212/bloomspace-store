import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart, selectCartCount, selectCartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";

const HIDDEN_PREFIXES = ["/cart", "/checkout", "/admin", "/auth", "/order"];

export function MobileCartBar() {
  const count = useCart(selectCartCount);
  const total = useCart(selectCartTotal);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <AnimatePresence>
      {count > 0 && !hidden && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-40 md:hidden"
          style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }}
        >
          <Link
            to="/cart"
            className="flex h-14 w-full items-center justify-between gap-3 rounded-full bg-foreground px-5 text-background shadow-2xl"
          >
            <span className="inline-flex items-center gap-2 text-[13px] font-medium">
              <ShoppingBag className="h-4 w-4" />
              Корзина · {count}
            </span>
            <span className="text-[14px] font-semibold tracking-tight">
              {formatPrice(total)}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}