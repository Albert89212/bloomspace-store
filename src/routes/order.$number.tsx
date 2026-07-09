import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Send, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrders, type Order } from "@/lib/orders-store";
import { formatPrice } from "@/lib/products";
import { useCurrentUser } from "@/lib/auth-store";
import { company } from "@/lib/company";

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
  const pruneOldMessages = useOrders((s) => s.pruneOldMessages);

  // Авто-удаление переписки старше 30 дней при каждом визите.
  useEffect(() => {
    pruneOldMessages();
  }, [pruneOldMessages]);

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
        initial={false}
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
          {new Date(order.createdAt).toLocaleDateString("ru-RU")} между{" "}
          {company.shortName} (Продавец) и {order.customer.name} (Покупатель)
          на условиях публичной оферты.
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

      <OrderChat orderId={order.id} />

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

function OrderChat({ orderId }: { orderId: string }) {
  const user = useCurrentUser();
  const order = useOrders((s) => s.items.find((o) => o.id === orderId));
  const addMessage = useOrders((s) => s.addMessage);
  const [text, setText] = useState("");

  if (!order) return null;

  const isOwner = user && order.userId && user.id === order.userId;
  const isStaff =
    user && (user.role === "owner" || user.role === "admin" ||
      user.role === "moderator" || user.role === "support");

  if (!user) {
    return (
      <div className="mt-6 rounded-3xl bg-surface p-6 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <ShieldAlert className="h-4 w-4" /> Переписка с поддержкой
        </div>
        <p className="mt-2">
          <Link to="/auth" className="underline">Войдите</Link>, чтобы связаться с менеджером
          по этому заказу.
        </p>
      </div>
    );
  }

  if (!isOwner && !isStaff) {
    return (
      <div className="mt-6 rounded-3xl bg-surface p-6 text-[13px] text-muted-foreground">
        Переписка по этому заказу доступна только покупателю и модераторам магазина.
      </div>
    );
  }

  function send() {
    if (!text.trim() || !user) return;
    addMessage(orderId, {
      author: isStaff ? "staff" : "client",
      authorName: user.name,
      text: text.trim().slice(0, 2000),
    });
    setText("");
  }

  return (
    <div className="mt-6 rounded-3xl bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-medium">Переписка по заказу</div>
        <div className="text-[11px] text-muted-foreground">
          Автоудаление через 30 дней
        </div>
      </div>
      <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
        {order.messages.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Сообщений пока нет. Задайте вопрос менеджеру — ответим в рабочее время.
          </p>
        ) : (
          order.messages.map((m) => {
            const mine = user && m.authorName === user.name;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl p-3 text-[13px] ${
                  mine
                    ? "ml-auto bg-foreground text-background"
                    : "bg-background"
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest opacity-70">
                  {m.author === "staff" ? "Поддержка" : "Покупатель"} · {m.authorName}
                </div>
                <div className="mt-1 whitespace-pre-wrap">{m.text}</div>
                <div className="mt-1 text-[10px] opacity-60">
                  {new Date(m.createdAt).toLocaleString("ru-RU")}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={isStaff ? "Ответ покупателю…" : "Сообщение менеджеру…"}
          className="h-11 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground"
          maxLength={2000}
        />
        <button
          onClick={send}
          className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 text-[13px] font-medium text-background"
        >
          <Send className="h-3.5 w-3.5" /> Отправить
        </button>
      </div>
    </div>
  );
}

function renderContractHtml(order: Order) {
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
  .req{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px;font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7}
  .row{display:flex;justify-content:space-between;margin-top:32px;gap:24px}
  .col{flex:1;font-size:13px}
  .sig{margin-top:60px;border-top:1px solid #111;padding-top:8px;font-size:12px}
</style></head><body>
<h1>Договор купли-продажи № ${order.number}</h1>
<p style="text-align:center;color:#666">от ${new Date(order.createdAt).toLocaleDateString("ru-RU")}</p>

<p>Настоящий Договор заключается на условиях публичной оферты, размещённой на ${company.siteUrl}/legal/offer, в соответствии со ст. 437, 438 Гражданского кодекса РФ. Согласие Покупателя с условиями оферты подтверждено действием — оформлением и оплатой заказа. IP акцепта: ${escapeHtml(order.contractIp || "—")}.</p>

<h2>1. Стороны</h2>
<p><b>Продавец:</b> ${escapeHtml(company.legalName)}, ИНН ${company.inn}, ОГРНИП ${company.ogrnip}, адрес: ${escapeHtml(company.address)}.<br>
<b>Покупатель:</b> ${escapeHtml(c.name)}, email: ${escapeHtml(c.email)}, тел.: ${escapeHtml(c.phone)}.</p>

<h2>2. Предмет договора</h2>
<table><thead><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="text-align:right;margin-top:12px"><b>Итого к оплате: ${formatPrice(order.total)}</b></p>

<h2>3. Доставка</h2>
<p>Способ: ${escapeHtml(order.delivery.toUpperCase())}. Адрес: ${escapeHtml(c.city)}, ${escapeHtml(c.address)}.</p>

<h2>4. Оплата</h2>
<p>Способ оплаты: ${escapeHtml(order.payment.toUpperCase())}. Расчёты в рублях РФ. Продавец применяет УСН, НДС не облагается.</p>

<h2>5. Персональные данные</h2>
<p>Покупатель подтверждает согласие на обработку персональных данных согласно 152-ФЗ «О персональных данных» от 27.07.2006.</p>

<h2>6. Реквизиты Продавца</h2>
<div class="req">
  ${escapeHtml(company.legalName)}<br>
  ИНН: ${company.inn}<br>
  ОГРНИП: ${company.ogrnip}<br>
  Адрес: ${escapeHtml(company.address)}<br>
  Р/с: ${company.account}<br>
  Банк: ${escapeHtml(company.bank)}<br>
  БИК: ${company.bik} · К/с: ${company.corrAccount}<br>
  ИНН банка: ${company.bankInn} · КПП банка: ${company.bankKpp}<br>
  Email: ${company.supportEmail}
</div>

<div class="row">
  <div class="col"><b>Продавец</b><div class="sig">${escapeHtml(company.shortName)} / Тогашев А. Д.</div></div>
  <div class="col"><b>Покупатель</b><div class="sig">${escapeHtml(c.name)}</div></div>
</div>
</body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}