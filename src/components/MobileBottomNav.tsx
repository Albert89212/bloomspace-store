import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, MessageSquare, ShoppingBag, User } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/cart-store";
import { useSupportChat } from "@/lib/support-chat-store";
import { useCurrentUser } from "@/lib/auth-store";

const items = [
  { to: "/", label: "Главная", icon: Home, exact: true },
  { to: "/catalog", label: "Каталог", icon: LayoutGrid },
  { to: "/cart", label: "Корзина", icon: ShoppingBag },
  { to: "/chats", label: "Чаты", icon: MessageSquare },
  { to: "/auth", label: "Профиль", icon: User },
] as const;

const HIDDEN_PREFIXES = ["/admin", "/checkout", "/order"];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const cart = useCart(selectCartCount);
  const user = useCurrentUser();
  const unread = useSupportChat((s) => {
    if (!user) return 0;
    const t = s.threads.find((x) => x.userId === user.id);
    return t?.unreadForUser ?? 0;
  });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Мобильная навигация"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const badge =
            it.to === "/cart" ? cart : it.to === "/chats" ? unread : 0;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <it.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
                  {badge > 0 && (
                    <span
                      className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-semibold text-background"
                      style={{ backgroundColor: "var(--brand)" }}
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span className="leading-none">{it.label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-4 top-0 h-[2px] rounded-full"
                    style={{ backgroundColor: "var(--brand)" }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}