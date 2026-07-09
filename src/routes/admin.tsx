import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Админка — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Обзор" },
  { to: "/admin/products", label: "Товары" },
  { to: "/admin/orders", label: "Заказы" },
  { to: "/admin/reviews", label: "Отзывы" },
  { to: "/admin/tickets", label: "Тикеты" },
  { to: "/admin/life", label: "Жизнь" },
] as const;

function AdminLayout() {
  const isAdmin = useAdmin((s) => s.isAdmin);
  const setAdmin = useAdmin((s) => s.setAdmin);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <ShieldCheck className="h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold">Вход для администратора</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Демо-режим: авторизация локальная. На боевом бэкенде — JWT + роль ADMIN.
        </p>
        <button
          onClick={() => setAdmin(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[13px] font-medium text-background"
        >
          <LogIn className="h-4 w-4" /> Войти как админ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Админ-панель
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">SADOVA</h1>
        </div>
        <button
          onClick={() => setAdmin(false)}
          className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[12px] hover:bg-secondary"
        >
          <LogOut className="h-3.5 w-3.5" /> Выйти
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-1 rounded-full border border-hairline p-1">
        {tabs.map((t) => {
          const active =
            t.to === "/admin" ? pathname === "/admin" : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`relative rounded-full px-4 py-2 text-[13px] transition-colors ${
                active ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}