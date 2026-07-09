import { createFileRoute } from "@tanstack/react-router";
import { products, formatPrice } from "@/lib/products";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Товары</h2>
        <button className="rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background">
          + Добавить
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-hairline">
        <table className="w-full text-[13px]">
          <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="p-4">Товар</th>
              <th className="p-4">Категория</th>
              <th className="p-4">Цена</th>
              <th className="p-4">Рейтинг</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{p.category}</td>
                <td className="p-4 tabular-nums">{formatPrice(p.price)}</td>
                <td className="p-4 tabular-nums">{p.rating.toFixed(1)}</td>
                <td className="p-4 text-right">
                  <button className="text-[12px] text-muted-foreground hover:text-foreground">
                    Изменить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[12px] text-muted-foreground">
        Демо-каталог. Создание/редактирование сохранится в БД после подключения бэкенда
        (server/src/routes/products.ts).
      </p>
    </div>
  );
}