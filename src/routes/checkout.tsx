import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, CreditCard, Package, Truck } from "lucide-react";
import { useState } from "react";
import { useCart, selectCartTotal } from "@/lib/cart-store";
import { useOrders, type DeliveryMethod, type PaymentMethod } from "@/lib/orders-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Оформление заказа — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart(selectCartTotal);
  const clear = useCart((s) => s.clear);
  const createOrder = useOrders((s) => s.create);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("cdek");
  const [payment, setPayment] = useState<PaymentMethod>("sbp");
  const [offerAccepted, setOfferAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const deliveryPrice = delivery === "courier" ? 990 : 490;
  const grandTotal = total + deliveryPrice;
  const canSubmit =
    items.length > 0 &&
    name.trim() &&
    /\S+@\S+\.\S+/.test(email) &&
    phone.trim() &&
    city.trim() &&
    address.trim() &&
    offerAccepted &&
    privacyAccepted;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    // Simulated payment gateway roundtrip
    await new Promise((r) => setTimeout(r, 800));
    const order = createOrder({
      items,
      total: grandTotal,
      customer: { name, email, phone, city, address },
      payment,
      delivery,
      contractAccepted: true,
      contractIp: "0.0.0.0",
    });
    clear();
    navigate({ to: "/order/$number", params: { number: order.number } });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Корзина пуста</h1>
        <Link
          to="/catalog"
          className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-[14px] font-medium text-background"
        >
          К каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-semibold tracking-tight md:text-5xl"
      >
        Оформление заказа
      </motion.h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <Block title="Контакты" step={1}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ФИО" value={name} onChange={setName} required />
              <Field label="Телефон" value={phone} onChange={setPhone} type="tel" required />
              <Field label="Email" value={email} onChange={setEmail} type="email" required />
            </div>
          </Block>

          <Block title="Доставка" step={2}>
            <div className="grid gap-3">
              {[
                { id: "cdek" as const, name: "СДЭК до ПВЗ", price: 490, icon: Package },
                { id: "boxberry" as const, name: "Boxberry", price: 490, icon: Package },
                { id: "courier" as const, name: "Курьер до двери", price: 990, icon: Truck },
              ].map((d) => (
                <label
                  key={d.id}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors ${
                    delivery === d.id ? "border-foreground bg-secondary" : "border-hairline"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      className="sr-only"
                      checked={delivery === d.id}
                      onChange={() => setDelivery(d.id)}
                    />
                    <d.icon className="h-4 w-4" />
                    <span className="text-[14px] font-medium">{d.name}</span>
                  </div>
                  <span className="text-[13px] tabular-nums">{formatPrice(d.price)}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Город" value={city} onChange={setCity} required />
              <Field label="Адрес / ПВЗ" value={address} onChange={setAddress} required />
            </div>
          </Block>

          <Block title="Оплата" step={3}>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "sbp" as const, name: "СБП" },
                { id: "card" as const, name: "Картой" },
                { id: "yookassa" as const, name: "ЮKassa" },
              ].map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border p-4 transition-colors ${
                    payment === p.id ? "border-foreground bg-secondary" : "border-hairline"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={payment === p.id}
                    onChange={() => setPayment(p.id)}
                  />
                  <CreditCard className="h-4 w-4" />
                  <span className="text-[13px] font-medium">{p.name}</span>
                </label>
              ))}
            </div>
          </Block>

          <Block title="Согласия" step={4}>
            <div className="space-y-3 text-[13px]">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={offerAccepted}
                  onChange={(e) => setOfferAccepted(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Согласен с условиями{" "}
                  <Link to="/legal/offer" className="underline">
                    публичной оферты
                  </Link>
                  . Оформляя заказ, я заключаю договор купли-продажи с ООО «Садова»
                  на условиях оферты (ст. 437, 438 ГК РФ).
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Даю согласие на обработку персональных данных согласно{" "}
                  <Link to="/legal/privacy" className="underline">
                    152-ФЗ
                  </Link>
                  .
                </span>
              </label>
            </div>
          </Block>
        </div>

        <aside className="h-fit rounded-3xl bg-surface p-6 lg:sticky lg:top-20">
          <div className="text-[15px] font-medium">Ваш заказ</div>
          <ul className="mt-4 divide-y divide-hairline">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <img
                  src={i.image}
                  alt={i.name}
                  className="h-12 w-12 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="flex-1 text-[13px]">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-muted-foreground">× {i.quantity}</div>
                </div>
                <div className="text-[13px] tabular-nums">
                  {formatPrice(i.price * i.quantity)}
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Товары</dt>
              <dd className="tabular-nums">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Доставка</dt>
              <dd className="tabular-nums">{formatPrice(deliveryPrice)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-hairline pt-4">
            <div className="text-[13px] text-muted-foreground">К оплате</div>
            <div className="text-2xl font-semibold tabular-nums">{formatPrice(grandTotal)}</div>
          </div>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={!canSubmit || submitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-medium text-background disabled:opacity-40"
          >
            {submitting ? "Обработка…" : <>Оплатить {formatPrice(grandTotal)}</>}
          </motion.button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            После оплаты автоматически сформируем договор и отправим на {email || "ваш email"}.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Block({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          {step}
        </span>
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px] outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}

// Success icon reference to satisfy tree-shaking hint
export const _icons = { Check };