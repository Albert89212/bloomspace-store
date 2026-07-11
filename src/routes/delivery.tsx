import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Truck, Package, MapPin, CreditCard, Smartphone, Wallet, ShieldCheck, Clock, Home, Building2, Sparkles, RefreshCcw } from "lucide-react";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Доставка и оплата — SADOVA" },
      {
        name: "description",
        content:
          "Доставка только через ПВЗ Ozon по всей России. Оплата: СБП, SberPay, T-Pay, банковская карта.",
      },
      { property: "og:title", content: "Доставка и оплата — SADOVA" },
      {
        property: "og:description",
        content: "Прозрачные условия доставки и оплаты по всей России.",
      },
    ],
  }),
  component: DeliveryPage,
});

const delivery = [
  {
    icon: MapPin,
    title: "ПВЗ Ozon",
    desc: "Единственный способ доставки. Более 45 000 пунктов выдачи Ozon по всей России. 2–6 дней. Цена рассчитывается автоматически на карте по расстоянию от склада.",
    price: "от 249 ₽",
    tint: "#005BFF",
    tintSoft: "oklch(0.95 0.04 250)",
  },
];

const payment = [
  {
    icon: Smartphone,
    title: "СБП",
    desc: "QR-код или ссылка из мобильного банка. Зачисление за 5 секунд, без комиссии для покупателя.",
    tint: "var(--brand)",
    tintSoft: "var(--brand-soft)",
  },
  {
    icon: Wallet,
    title: "SberPay",
    desc: "Оплата в один клик через СберБанк Онлайн. Подтверждение по SberID / Push.",
    tint: "oklch(0.55 0.16 145)",
    tintSoft: "oklch(0.95 0.04 145)",
  },
  {
    icon: Wallet,
    title: "T-Pay",
    desc: "Оплата через Т-Банк (Tinkoff Pay) по кнопке — без ввода данных карты.",
    tint: "oklch(0.55 0.16 55)",
    tintSoft: "oklch(0.95 0.05 55)",
  },
  {
    icon: CreditCard,
    title: "Банковская карта",
    desc: "МИР, Visa, Mastercard. Приём через Т-Кассу с 3-D Secure 2.0. PCI DSS Level 1.",
    tint: "var(--accent-cool)",
    tintSoft: "oklch(0.95 0.04 235)",
  },
];

function DeliveryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
          Условия
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Доставка и оплата
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Доставляем только через ПВЗ Ozon — 45 000 точек по всей России. Курьером не возим.
          Оплата: СБП, SberPay, T-Pay, банковская карта. PCI DSS Level 1.
        </p>
      </motion.div>

      <section className="mt-14">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
          <Truck className="h-3.5 w-3.5" /> Доставка
        </div>
        <div className="mt-4 grid gap-3">
          {delivery.map((d, i) => (
            <motion.div
              key={d.title}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex items-start gap-4 rounded-2xl border border-hairline bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: d.tintSoft, color: d.tint }}
              >
                <d.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] font-medium">{d.title}</div>
                  <div
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: d.tintSoft, color: d.tint }}
                  >
                    {d.price}
                  </div>
                </div>
                <div className="mt-1 text-[13px] text-muted-foreground">{d.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Сроки отсчитываются от момента отгрузки со склада (1–2 рабочих дня после оплаты).
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" /> Оплата
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {payment.map((p, i) => (
            <motion.div
              key={p.title}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group rounded-2xl border border-hairline bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: p.tintSoft, color: p.tint }}
              >
                <p.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-[14px] font-medium">{p.title}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{p.desc}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Приём платежей — ПАО «Т-Банк» (лицензия ЦБ РФ №2673) и НСПК (СБП).
        </div>
      </section>

      <section className="mt-14 rounded-3xl bg-surface p-8">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <RefreshCcw className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Возврат и обмен</h2>
        </div>
        <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          <p>
            В соответствии со ст. 26.1 Закона РФ «О защите прав потребителей» вы вправе отказаться от товара
            в течение 7 дней после получения без объяснения причин, если сохранён товарный вид.
          </p>
          <p>Возврат денежных средств производится в течение 10 дней на карту или счёт покупателя.</p>
          <p>Мебель, изготовленная по индивидуальному заказу, обмену и возврату не подлежит (ст. 25 ЗоЗПП).</p>
        </div>
        <Link
          to="/legal/offer"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[12px] transition-colors hover:bg-background"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Публичная оферта
        </Link>
      </section>
    </div>
  );
}