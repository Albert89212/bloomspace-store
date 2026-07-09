import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShoppingBag, User } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/cart-store";
import { useAdmin } from "@/lib/admin-store";
import { PushBell } from "./PushBell";
import { useCurrentUser } from "@/lib/auth-store";

const nav = [
  { to: "/", label: "Главная" },
  { to: "/catalog", label: "Каталог" },
  { to: "/life", label: "Жизнь магазина" },
  { to: "/blog", label: "Блог" },
  { to: "/about", label: "О бренде" },
  { to: "/support", label: "Поддержка" },
] as const;

export function SiteHeader() {
  const count = useCart(selectCartCount);
  const isAdmin = useAdmin((s) => s.isAdmin);
  const user = useCurrentUser();

  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-[15px] font-semibold tracking-tight">
          SADOVA
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {user && <PushBell />}
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Админка"
            >
              <ShieldCheck className="h-[18px] w-[18px]" />
            </Link>
          )}
          <Link
            to="/auth"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Профиль"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link
            to="/cart"
            className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Корзина"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  key={count}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </header>
  );
}