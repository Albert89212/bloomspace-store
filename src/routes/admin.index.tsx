import { createFileRoute } from "@tanstack/react-router";
import { useOrders } from "@/lib/orders-store";
import { useReviews } from "@/lib/reviews-store";
import { useTickets } from "@/lib/tickets-store";
import { useLifePosts } from "@/lib/life-posts-store";
import { useProducts } from "@/lib/products-store";
import { usePromocodes } from "@/lib/promocodes-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const orders = useOrders((s) => s.items);
  const products = useProducts((s) => s.items);
  const promos = usePromocodes((s) => s.items);
  const reviews = useReviews((s) => s.items);
  const tickets = useTickets((s) => s.items);
  const posts = useLifePosts((s) => s.items);

  const revenue = orders.reduce((n, o) => n + o.total, 0);
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;

  const stats = [
    { label: "Заказов", value: orders.length },
    { label: "Выручка", value: formatPrice(revenue) },
    { label: "Товаров", value: products.length },
    { label: "Промокодов", value: promos.length },
    { label: "Отзывов на модерации", value: pendingReviews },
    { label: "Открытых тикетов", value: openTickets },
    { label: "Постов «Жизнь»", value: posts.length },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl bg-surface p-6">
          <div className="text-[12px] uppercase tracking-widest text-muted-foreground">
            {s.label}
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}