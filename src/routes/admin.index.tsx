import { createFileRoute } from "@tanstack/react-router";
import { useOrders } from "@/lib/orders-store";
import { useReviews } from "@/lib/reviews-store";
import { useTickets } from "@/lib/tickets-store";
import { useLifePosts } from "@/lib/life-posts-store";
import { useProducts } from "@/lib/products-store";
import { usePromocodes } from "@/lib/promocodes-store";
import { formatPrice } from "@/lib/products";
import { useAdmin } from "@/lib/admin-store";
import { useNews } from "@/lib/news-store";
import { useCurrentUser } from "@/lib/auth-store";
import { useState } from "react";
import { Megaphone, Percent, Send } from "lucide-react";

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
  const role = useAdmin((s) => s.role);

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
    <div className="space-y-8">
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
      {(role === "owner" || role === "admin") && (
        <div className="grid gap-4 lg:grid-cols-2">
          <QuickNews />
          <QuickPromo />
        </div>
      )}
    </div>
  );
}

function QuickNews() {
  const create = useNews((s) => s.create);
  const user = useCurrentUser();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      await create({
        authorId: user?.id ?? "owner",
        authorName: user?.name ?? "SADOVA",
        title: title.trim(),
        body: body.trim(),
      });
      setTitle("");
      setBody("");
      setStatus("Сохранено в БД и опубликовано");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить в БД");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-hairline bg-background p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <Megaphone className="h-4 w-4" /> Быстрое объявление
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Один клик — новость появится на странице «Чаты → Новости» и в ленте.
      </p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок" className="mt-3 h-10 w-full rounded-xl border border-hairline bg-surface px-3 text-[13px]" required />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Текст объявления (поддерживается markdown)" className="mt-2 w-full resize-none rounded-xl border border-hairline bg-surface p-3 text-[13px]" required />
      <button type="submit" disabled={saving} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[12px] font-medium text-background">
        <Send className="h-3.5 w-3.5" /> {saving ? "Сохраняю..." : "Опубликовать"}
      </button>
      {status && <div className="mt-2 text-center text-[11px]" style={{ color: "var(--brand)" }}>{status}</div>}
    </form>
  );
}

function QuickPromo() {
  const create = usePromocodes((s) => s.create);
  const [code, setCode] = useState("");
  const [value, setValue] = useState(10);
  const [minTotal, setMinTotal] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    create({
      code: code.trim(),
      type: "percent",
      value,
      minTotal,
      active: true,
      usageLimit: null,
      expiresAt: null,
    });
    setCode("");
    setStatus(`Промокод создан: скидка ${value}%`);
    setTimeout(() => setStatus(null), 3000);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-hairline bg-background p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <Percent className="h-4 w-4" /> Быстрая промоакция
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Мгновенный промокод. Доступен клиентам в оформлении заказа.
      </p>
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ПРОМОКОД (например LETO25)" className="mt-3 h-10 w-full rounded-xl border border-hairline bg-surface px-3 text-[13px]" required />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-[11px] text-muted-foreground">
          Скидка, %
          <input type="number" min={1} max={90} value={value} onChange={(e) => setValue(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-hairline bg-surface px-3 text-[13px]" />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Мин. сумма, ₽
          <input type="number" min={0} value={minTotal} onChange={(e) => setMinTotal(Number(e.target.value))} className="mt-1 h-10 w-full rounded-xl border border-hairline bg-surface px-3 text-[13px]" />
        </label>
      </div>
      <button type="submit" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[12px] font-medium text-background">
        <Send className="h-3.5 w-3.5" /> Активировать
      </button>
      {status && <div className="mt-2 text-center text-[11px]" style={{ color: "var(--brand)" }}>{status}</div>}
    </form>
  );
}