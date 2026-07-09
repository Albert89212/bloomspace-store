import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Download } from "lucide-react";
import { useOrders } from "@/lib/orders-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/order/$number")({
  head: () => ({
    meta: [
      { title: "Заказ оформлен — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { number } = Route.useParams();
  const order = useOrders((s) => s.items.find((o) => o.number === number));

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Заказ не найден</h1>
        <Link to="/" className="mt-6 inline-flex text-[13px] underline">
          На главную
        </Link>
      </div>
    );
  }

  function downloadContract() {
    if (!order) return;
    const html = renderContractHtml(order);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dogovor-${order.number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center"
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      </motion.div>
      <h1 className="mt-6 text-center text-4xl font-semibold tracking-tight md:text-5xl">
        Заказ {order.number}
      </h1>
      <p className="mt-4 text-center text-[15px] text-muted-foreground">
        Спасибо! Мы отправили детали на {order.customer.email}. Договор сформирован автоматически.
      </p>

      <div className="mt-10 rounded-3xl bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-medium">Ваш договор</div>
          <button
            onClick={downloadContract}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[12px] font-medium text-background"
          >
            <Download className="h-3.5 w-3.5" /> Скачать
          </button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          Договор купли-продажи № {order.number} от{" "}
          {new Date(order.createdAt).toLocaleDateString("ru-RU")} между ООО «Садова» (Продавец)
          и {order.customer.name} (Покупатель) на условиях публичной оферты.
        </p>
      </div>

      <div className="mt-6 rounded-3xl bg-surface p-6">
        <div className="text-[15px] font-medium">Состав заказа</div>
        <ul className="mt-4 divide-y divide-hairline">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-3 text-[13px]">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span className="tabular-nums">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
          <div className="text-[13px] text-muted-foreground">Итого</div>
          <div className="text-xl font-semibold tabular-nums">{formatPrice(order.total)}</div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/catalog"
          className="inline-flex rounded-full border border-hairline px-6 py-3 text-[13px] font-medium hover:bg-secondary"
        >
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
}

function renderContractHtml(order: ReturnType<typeof useOrders.getState>["items"][number]) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>${formatPrice(
          i.price,
        )}</td><td>${formatPrice(i.price * i.quantity)}</td></tr>`,
    )
    .join("");
  const c = order.customer;
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Договор ${order.number}</title>
<style>
  body{font-family:-apple-system,Inter,sans-serif;max-width:720px;margin:40px auto;padding:0 24px;color:#111;line-height:1.6}
  h1{font-size:22px;font-weight:600;text-align:center}
  h2{font-size:15px;margin-top:32px;text-transform:uppercase;letter-spacing:.08em;color:#666}
  table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
  td,th{border:1px solid #ddd;padding:8px;text-align:left}
  th{background:#f5f5f5}
  .row{display:flex;justify-content:space-between;margin-top:32px;gap:24px}
  .col{flex:1;font-size:13px}
  .sig{margin-top:60px;border-top:1px solid #111;padding-top:8px;font-size:12px}
</style></head><body>
<h1>Договор купли-продажи № ${order.number}</h1>
<p style="text-align:center;color:#666">от ${new Date(order.createdAt).toLocaleDateString("ru-RU")}</p>

<p>Настоящий Договор заключается на условиях публичной оферты, размещённой на sadova.example/legal/offer, в соответствии со ст. 437, 438 Гражданского кодекса РФ. Согласие Покупателя с условиями оферты подтверждено действием — оформлением и оплатой заказа.</p>

<h2>1. Стороны</h2>
<p><b>Продавец:</b> ООО «Садова», ИНН 0000000000, г. Москва.<br>
<b>Покупатель:</b> ${escapeHtml(c.name)}, email: ${escapeHtml(c.email)}, тел.: ${escapeHtml(c.phone)}.</p>

<h2>2. Предмет договора</h2>
<table><thead><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="text-align:right;margin-top:12px"><b>Итого к оплате: ${formatPrice(order.total)}</b></p>

<h2>3. Доставка</h2>
<p>Способ: ${escapeHtml(order.delivery)}. Адрес: ${escapeHtml(c.city)}, ${escapeHtml(c.address)}.</p>

<h2>4. Оплата</h2>
<p>Способ оплаты: ${escapeHtml(order.payment.toUpperCase())}. Расчёты в рублях РФ.</p>

<h2>5. Персональные данные</h2>
<p>Покупатель подтверждает согласие на обработку персональных данных согласно 152-ФЗ.</p>

<div class="row">
  <div class="col"><b>Продавец</b><div class="sig">ООО «Садова»</div></div>
  <div class="col"><b>Покупатель</b><div class="sig">${escapeHtml(c.name)}</div></div>
</div>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}