import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background:
                "conic-gradient(from 210deg, var(--brand), var(--accent-warm), var(--accent-cool), var(--brand))",
            }}
          />
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
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-background"
                  style={{ backgroundColor: "var(--brand)" }}
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Меню"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>

    <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[84%] max-w-sm flex-col bg-background md:hidden"
            >
              <div className="flex h-14 items-center justify-between border-b border-hairline px-5">
                <span className="text-[15px] font-semibold">Меню</span>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 hover:bg-secondary"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-4">
                {nav.map((item, i) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-surface"
                    activeProps={{ className: "bg-surface" }}
                  >
                    <span>{item.label}</span>
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: [
                          "var(--brand)",
                          "var(--accent-warm)",
                          "var(--accent-cool)",
                          "var(--brand)",
                          "var(--accent-warm)",
                          "var(--accent-cool)",
                        ][i % 6],
                      }}
                    />
                  </Link>
                ))}
              </nav>
              <div className="border-t border-hairline p-4 text-[12px] text-muted-foreground">
                SADOVA — садовая мебель, скамейки и лаунж
              </div>
            </motion.aside>
          </>
        )}
    </AnimatePresence>
    </>
  );
}