import { createFileRoute } from "@tanstack/react-router";
import { useOrders, type OrderStatus } from "@/lib/orders-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statuses: { id: OrderStatus; label: string }[] = [
  { id: "new", label: "Новый" },
  { id: "paid", label: "Оплачен" },
  { id: "shipping", label: "В доставке" },
  { id: "done", label: "Завершён" },
  { id: "cancelled", label: "Отменён" },
];

function AdminOrders() {
  const orders = useOrders((s) => s.items);
  const setStatus = useOrders((s) => s.setStatus);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Заказы</h2>
      {orders.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center text-[13px] text-muted-foreground">
          Пока нет заказов. Оформите тестовый через /catalog → /checkout.
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[15px] font-semibold">{o.number}</div>
                  <div className="text-[12px] text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString("ru-RU")} · {o.customer.name} ·{" "}
                    {o.customer.email}
                  </div>
                  <div className="mt-2 text-[13px]">
                    {o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold tabular-nums">
                    {formatPrice(o.total)}
                  </div>
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                    className="mt-2 rounded-full border border-hairline bg-background px-3 py-1.5 text-[12px]"
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}