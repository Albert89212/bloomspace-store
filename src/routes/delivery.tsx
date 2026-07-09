import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Truck, Package, MapPin, CreditCard, Smartphone, Wallet, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Доставка и оплата — SADOVA" },
      {
        name: "description",
        content:
          "Способы доставки по России: СДЭК, Boxberry, ПВЗ Ozon, Почта России, курьер. Оплата картой, СБП и ЮKassa.",
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
    icon: Truck,
    title: "СДЭК",
    desc: "Доставка в ПВЗ и до двери по всей России. 2–7 дней.",
    price: "от 350 ₽",
  },
  {
    icon: Package,
    title: "Boxberry",
    desc: "Пункты выдачи в 700+ городах. 3–8 дней.",
    price: "от 320 ₽",
  },
  {
    icon: MapPin,
    title: "ПВЗ Ozon",
    desc: "Более 45 000 точек выдачи по стране. 2–6 дней.",
    price: "от 290 ₽",
  },
  {
    icon: Package,
    title: "Почта России",
    desc: "Доставка в любой населённый пункт РФ. 5–14 дней.",
    price: "от 250 ₽",
  },
  {
    icon: Truck,
    title: "Курьер по Москве и МО",
    desc: "Доставка в удобный день и интервал. 1–2 дня.",
    price: "от 500 ₽",
  },
];

const payment = [
  {
    icon: CreditCard,
    title: "Банковская карта",
    desc: "Visa, Mastercard, МИР. Приём через ЮKassa с 3-D Secure.",
  },
  {
    icon: Smartphone,
    title: "СБП",
    desc: "Оплата по QR-коду из мобильного банка за 5 секунд. Без комиссии.",
  },
  {
    icon: Wallet,
    title: "ЮMoney / SberPay",
    desc: "Электронные кошельки и оплата в один клик через ЮKassa.",
  },
];

function DeliveryPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
          Условия
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Доставка и оплата
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Доставляем по всей России пятью способами и принимаем оплату всеми популярными методами.
          Все переводы защищены — сертификаты PCI DSS у платёжных партнёров.
        </p>
      </motion.div>

      <section className="mt-14">
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
          <Truck className="h-3.5 w-3.5" /> Доставка
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {delivery.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-4 rounded-2xl bg-surface p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline">
                <d.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] font-medium">{d.title}</div>
                  <div className="text-[12px] text-muted-foreground">{d.price}</div>
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
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {payment.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-surface p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline">
                <p.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-[14px] font-medium">{p.title}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{p.desc}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Все платежи проходят через ЮKassa (лицензия ЦБ РФ №3510-К).
        </div>
      </section>

      <section className="mt-14 rounded-3xl bg-surface p-8">
        <h2 className="text-xl font-semibold tracking-tight">Возврат и обмен</h2>
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
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[12px] hover:bg-background"
        >
          Публичная оферта
        </Link>
      </section>
    </div>
  );
}