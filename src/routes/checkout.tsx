import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, CreditCard, MapPin, Package, Tag, Truck, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart, selectCartTotal } from "@/lib/cart-store";
import { useOrders, type DeliveryMethod, type PaymentMethod } from "@/lib/orders-store";
import { usePromocodes } from "@/lib/promocodes-store";
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

const deliveryOptions: {
  id: DeliveryMethod;
  name: string;
  price: number;
  hint: string;
  pvz: boolean;
  icon: typeof Package;
}[] = [
  { id: "ozon", name: "Ozon — ПВЗ", price: 290, hint: "2–4 дня. Более 45 000 пунктов выдачи Ozon по всей РФ.", pvz: true, icon: Package },
  { id: "pochta", name: "Почта России", price: 350, hint: "3–14 дней. Отделения в любой населённый пункт РФ.", pvz: false, icon: MapPin },
  { id: "courier", name: "Курьер до двери", price: 990, hint: "1–2 дня по крупным городам.", pvz: false, icon: Truck },
];

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const total = useCart(selectCartTotal);
  const clear = useCart((s) => s.clear);
  const createOrder = useOrders((s) => s.create);
  const applyPromo = usePromocodes((s) => s.apply);
  const incrementUse = usePromocodes((s) => s.incrementUse);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod>("ozon");
  const [payment, setPayment] = useState<PaymentMethod>("sbp");
  const [offerAccepted, setOfferAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ id: string; code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const selected = deliveryOptions.find((d) => d.id === delivery)!;
  const deliveryPrice = selected.price;
  const discount = promoApplied?.discount ?? 0;
  const grandTotal = Math.max(0, total + deliveryPrice - discount);

  const pvzMapUrl = useMemo(() => {
    if (!selected.pvz || !city.trim()) return null;
    const provider = delivery === "ozon" ? "Ozon" : "Почта России";
    const query = encodeURIComponent(`Пункт выдачи ${provider} ${city}`);
    return `https://yandex.ru/map-widget/v1/?text=${query}&z=12`;
  }, [selected.pvz, city, delivery]);

  function tryApplyPromo() {
    setPromoError(null);
    const res = applyPromo(promoCode, total);
    if (!res.ok) {
      setPromoError(res.reason);
      setPromoApplied(null);
      return;
    }
    setPromoApplied({ id: res.promo.id, code: res.promo.code, discount: res.discount });
  }

  function removePromo() {
    setPromoApplied(null);
    setPromoCode("");
    setPromoError(null);
  }

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
    await new Promise((r) => setTimeout(r, 800));
    if (promoApplied) incrementUse(promoApplied.id);
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
        initial={false}
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
              {deliveryOptions.map((d) => (
                <label
                  key={d.id}
                  className={`flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                    delivery === d.id ? "border-foreground bg-secondary" : "border-hairline hover:border-muted-foreground/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      className="sr-only"
                      checked={delivery === d.id}
                      onChange={() => setDelivery(d.id)}
                    />
                    <d.icon className="mt-0.5 h-4 w-4" />
                    <div>
                      <div className="text-[14px] font-medium">{d.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted-foreground">{d.hint}</div>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-[13px] tabular-nums">
                    {formatPrice(d.price)}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Город" value={city} onChange={setCity} required />
              <Field
                label={selected.pvz ? "Адрес ПВЗ" : "Адрес доставки"}
                value={address}
                onChange={setAddress}
                required
              />
            </div>
            {pvzMapUrl && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-hairline">
                <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Карта пунктов выдачи · {selected.name}
                  </span>
                  <a
                    href={pvzMapUrl.replace("map-widget/v1", "maps")}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Открыть на Яндекс.Картах
                  </a>
                </div>
                <iframe
                  title="Карта ПВЗ"
                  src={pvzMapUrl}
                  className="h-64 w-full"
                  loading="lazy"
                />
              </div>
            )}
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
                  . Оформляя заказ, я заключаю договор купли-продажи с ООО «Садова» (ст. 437, 438 ГК РФ).
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
                    Политике обработки ПДн (152-ФЗ)
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

          <div className="mt-4 border-t border-hairline pt-4">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
              <Tag className="h-3.5 w-3.5" /> Промокод
            </div>
            {promoApplied ? (
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2 text-[13px]">
                <span className="font-mono font-medium text-green-700">{promoApplied.code}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-green-700">
                    −{formatPrice(promoApplied.discount)}
                  </span>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="rounded-full p-1 text-green-700 hover:bg-green-100"
                    aria-label="Убрать промокод"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER10"
                    className="h-10 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px] uppercase outline-none focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={tryApplyPromo}
                    className="rounded-full bg-foreground px-4 text-[12px] font-medium text-background"
                  >
                    Применить
                  </button>
                </div>
                {promoError && (
                  <div className="mt-2 text-[12px] text-red-600">{promoError}</div>
                )}
              </div>
            )}
          </div>

          <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Товары</dt>
              <dd className="tabular-nums">{formatPrice(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Доставка</dt>
              <dd className="tabular-nums">{formatPrice(deliveryPrice)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Скидка по промокоду</dt>
                <dd className="tabular-nums">−{formatPrice(discount)}</dd>
              </div>
            )}
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
            {submitting ? "Обрабатываем…" : (
              <>
                <Check className="h-4 w-4" /> Оформить и оплатить
              </>
            )}
          </motion.button>
        </aside>
      </form>
    </div>
  );
}

function Block({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline text-[12px] tabular-nums text-muted-foreground">
          {step}
        </div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
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
      <span className="mb-1.5 block text-[12px] text-muted-foreground">{label}</span>
      <input
        value={value}
        type={type}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px] outline-none focus:border-foreground"
      />
    </label>
  );
}
