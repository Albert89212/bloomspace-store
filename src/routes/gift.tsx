import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Copy } from "lucide-react";
import { useGifts, type GiftCertificate } from "@/lib/gift-store";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/gift")({
  head: () => ({
    meta: [
      { title: "Подарочные сертификаты — SADOVA" },
      {
        name: "description",
        content: "Подарочные сертификаты SADOVA номиналом 5 000, 10 000, 25 000 и 50 000 ₽.",
      },
    ],
  }),
  component: GiftPage,
});

const amounts = [5_000, 10_000, 25_000, 50_000, 100_000];

function GiftPage() {
  const issue = useGifts((s) => s.issue);
  const [amount, setAmount] = useState(10_000);
  const [form, setForm] = useState({ fromName: "", toName: "", toEmail: "", message: "" });
  const [issued, setIssued] = useState<GiftCertificate | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const gc = issue({ ...form, amount });
    setIssued(gc);
  }

  if (issued) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <Gift className="mx-auto h-10 w-10" />
        <h1 className="mt-4 text-2xl font-semibold">Сертификат оформлен</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Номинал: <b className="text-foreground">{formatPrice(issued.amount)}</b>. Отправьте код получателю.
        </p>
        <div className="mt-6 rounded-2xl bg-surface p-6">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Код</div>
          <div className="mt-2 font-mono text-2xl tracking-widest">{issued.code}</div>
          <button
            onClick={() => navigator.clipboard?.writeText(issued.code)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[12px]"
          >
            <Copy className="h-3.5 w-3.5" /> Скопировать
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
        <Gift className="h-3.5 w-3.5" /> Подарок
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Подарочный сертификат
      </h1>
      <p className="mt-4 text-[15px] text-muted-foreground">
        Красивый способ подарить свободу выбора. Действует 12 месяцев с даты покупки.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {amounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-full px-5 py-2 text-[13px] transition-all ${
              amount === a
                ? "bg-foreground text-background"
                : "border border-hairline hover:bg-secondary"
            }`}
          >
            {formatPrice(a)}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-8 grid gap-3 md:grid-cols-2">
        <input required placeholder="От кого"
          value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })}
          className="h-11 rounded-full border border-hairline bg-background px-4 text-[13px]" />
        <input required placeholder="Кому (имя)"
          value={form.toName} onChange={(e) => setForm({ ...form, toName: e.target.value })}
          className="h-11 rounded-full border border-hairline bg-background px-4 text-[13px]" />
        <input required type="email" placeholder="Email получателя" className="h-11 rounded-full border border-hairline bg-background px-4 text-[13px] md:col-span-2"
          value={form.toEmail} onChange={(e) => setForm({ ...form, toEmail: e.target.value })} />
        <textarea rows={3} placeholder="Пожелание (необязательно)" className="rounded-2xl border border-hairline bg-background px-4 py-3 text-[13px] md:col-span-2"
          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <button type="submit" className="mt-2 h-12 rounded-full bg-foreground text-[14px] font-medium text-background md:col-span-2">
          Оформить · {formatPrice(amount)}
        </button>
      </form>
    </div>
  );
}