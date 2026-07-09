import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { useTickets } from "@/lib/tickets-store";

export const Route = createFileRoute("/b2b")({
  head: () => ({
    meta: [
      { title: "Корпоративные и оптовые заказы — SADOVA" },
      {
        name: "description",
        content:
          "Оптовые цены для дилеров, комплектация ресторанов и отелей, оформление с НДС. Заявка по ИНН.",
      },
    ],
  }),
  component: B2BPage,
});

function B2BPage() {
  const create = useTickets((s) => s.create);
  const [form, setForm] = useState({
    company: "",
    inn: "",
    contact: "",
    email: "",
    phone: "",
    scope: "restaurant",
    message: "",
  });
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10,12}$/.test(form.inn)) return alert("ИНН должен содержать 10 или 12 цифр");
    create({
      subject: `B2B · ${form.company} (ИНН ${form.inn})`,
      email: form.email,
      text: [
        `Контакт: ${form.contact}, ${form.phone}`,
        `Проект: ${form.scope}`,
        form.message,
      ].join("\n"),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-semibold">Заявка принята</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Менеджер свяжется в течение рабочего дня и вышлет оптовый прайс с НДС.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" /> B2B
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Корпоративные и оптовые заказы
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground">
        Комплектуем рестораны, отели и загородные клубы. Работаем с НДС, предоставляем УПД,
        рассрочку и оптовые цены дилерам.
      </p>

      <form onSubmit={submit} className="mt-10 grid gap-3 md:grid-cols-2">
        <TextField label="Юридическое название" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required />
        <TextField label="ИНН" value={form.inn} onChange={(v) => setForm({ ...form, inn: v.replace(/\D/g, "") })} required />
        <TextField label="Контактное лицо" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} required />
        <TextField label="Телефон" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <TextField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <label className="text-[13px]">
          <span className="mb-1 block text-muted-foreground">Тип проекта</span>
          <select
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            className="h-11 w-full rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground"
          >
            <option value="restaurant">Ресторан / кафе</option>
            <option value="hotel">Отель / глэмпинг</option>
            <option value="dealer">Дилер / шоурум</option>
            <option value="private">Частный объект</option>
          </select>
        </label>
        <label className="text-[13px] md:col-span-2">
          <span className="mb-1 block text-muted-foreground">Комментарий</span>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-2xl border border-hairline bg-background px-4 py-3 text-[13px] outline-none focus:border-foreground"
            placeholder="Кратко о проекте, сроках, объёме"
          />
        </label>
        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-foreground text-[14px] font-medium text-background md:col-span-2"
        >
          Отправить заявку
        </button>
      </form>
    </div>
  );
}

function TextField({
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
    <label className="text-[13px]">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground"
      />
    </label>
  );
}