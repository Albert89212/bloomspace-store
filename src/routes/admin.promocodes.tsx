import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { usePromocodes, type PromoType } from "@/lib/promocodes-store";

export const Route = createFileRoute("/admin/promocodes")({
  component: AdminPromocodes,
});

function AdminPromocodes() {
  const items = usePromocodes((s) => s.items);
  const create = usePromocodes((s) => s.create);
  const update = usePromocodes((s) => s.update);
  const remove = usePromocodes((s) => s.remove);

  const [code, setCode] = useState("");
  const [type, setType] = useState<PromoType>("percent");
  const [value, setValue] = useState("10");
  const [minTotal, setMinTotal] = useState("0");
  const [limit, setLimit] = useState("");

  function add() {
    if (!code.trim() || !Number(value)) return;
    create({
      code,
      type,
      value: Number(value),
      minTotal: Number(minTotal) || 0,
      usageLimit: limit ? Number(limit) : null,
      active: true,
      expiresAt: null,
    });
    setCode("");
    setValue("10");
    setMinTotal("0");
    setLimit("");
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-hairline bg-surface p-6">
        <h2 className="text-lg font-semibold">Новый промокод</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[12px] text-muted-foreground">Код</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER10"
              className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px] uppercase outline-none focus:border-foreground"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-muted-foreground">Тип</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromoType)}
              className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px]"
            >
              <option value="percent">Процент</option>
              <option value="fixed">Фикс. ₽</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-muted-foreground">
              Скидка ({type === "percent" ? "%" : "₽"})
            </span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="number"
              className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px]"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-muted-foreground">Мин. сумма, ₽</span>
            <input
              value={minTotal}
              onChange={(e) => setMinTotal(e.target.value)}
              type="number"
              className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px]"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[12px] text-muted-foreground">Лимит применений (пусто = без лимита)</span>
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              type="number"
              className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px]"
            />
          </label>
          <div className="flex items-end justify-end sm:col-span-3">
            <button
              onClick={add}
              className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background"
            >
              Создать промокод
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-hairline p-12 text-center text-[13px] text-muted-foreground">
          Промокоды пока не созданы.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hairline">
          <table className="w-full text-[13px]">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4">Код</th>
                <th className="p-4">Скидка</th>
                <th className="p-4">Мин.</th>
                <th className="p-4">Использовано</th>
                <th className="p-4">Статус</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="p-4 font-mono font-medium">{p.code}</td>
                  <td className="p-4">
                    {p.type === "percent" ? `${p.value}%` : `${p.value.toLocaleString("ru-RU")} ₽`}
                  </td>
                  <td className="p-4 tabular-nums">
                    {p.minTotal ? `${p.minTotal.toLocaleString("ru-RU")} ₽` : "—"}
                  </td>
                  <td className="p-4 tabular-nums">
                    {p.used}
                    {p.usageLimit ? ` / ${p.usageLimit}` : ""}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => update(p.id, { active: !p.active })}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        p.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.active ? "Активен" : "Отключён"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { if (confirm(`Удалить промокод ${p.code}?`)) remove(p.id); }}
                      className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-[12px] text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
