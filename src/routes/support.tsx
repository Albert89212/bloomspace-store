import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useTickets } from "@/lib/tickets-store";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Поддержка — SADOVA" },
      {
        name: "description",
        content: "Задайте вопрос службе поддержки SADOVA — ответим в течение дня.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const tickets = useTickets((s) => s.items);
  const create = useTickets((s) => s.create);
  const reply = useTickets((s) => s.reply);

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const myTickets = email
    ? tickets.filter((t) => t.email.toLowerCase() === email.toLowerCase())
    : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !subject || !text) return;
    const id = create({ email, subject, text });
    setSubject("");
    setText("");
    setOpenId(id);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Поддержка</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Отвечаем ежедневно с 9:00 до 21:00 (МСК). Обычно — в течение часа.
        </p>
      </motion.div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Contact icon={Mail} label="Email" value="support@sadova.example" />
        <Contact icon={Phone} label="Телефон" value="8 800 000 00 00" />
        <Contact icon={MessageSquare} label="Telegram" value="@sadova_support" />
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Новый тикет</h2>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <SField label="Email" type="email" value={email} onChange={setEmail} />
            <SField label="Тема" value={subject} onChange={setSubject} />
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                Сообщение
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 2000))}
                rows={5}
                className="w-full resize-none rounded-2xl border border-hairline bg-surface p-4 text-[14px] outline-none focus:border-foreground"
                required
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-[13px] font-medium text-background"
            >
              <Send className="h-3.5 w-3.5" /> Отправить
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Мои обращения</h2>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Введите email выше, чтобы увидеть свои тикеты.
          </p>
          <ul className="mt-6 space-y-3">
            {myTickets.length === 0 && (
              <li className="rounded-2xl bg-surface p-4 text-[13px] text-muted-foreground">
                Обращений пока нет.
              </li>
            )}
            {myTickets.map((t) => (
              <li key={t.id} className="overflow-hidden rounded-2xl bg-surface">
                <button
                  onClick={() => setOpenId(openId === t.id ? null : t.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <div className="text-[14px] font-medium">{t.subject}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString("ru-RU")} · {t.status}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </button>
                {openId === t.id && (
                  <div className="border-t border-hairline p-4">
                    <div className="space-y-3">
                      {t.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`max-w-[85%] rounded-2xl p-3 text-[13px] ${
                            m.author === "client"
                              ? "ml-auto bg-foreground text-background"
                              : "bg-background"
                          }`}
                        >
                          {m.text}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        value={openId === t.id ? replyText : ""}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Ответить…"
                        className="h-10 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground"
                      />
                      <button
                        onClick={() => {
                          if (!replyText.trim()) return;
                          reply(t.id, "client", replyText.trim());
                          setReplyText("");
                        }}
                        className="rounded-full bg-foreground px-4 text-[13px] font-medium text-background"
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "open" | "in_progress" | "resolved" }) {
  const map = {
    open: { label: "Новый", cls: "bg-blue-500/10 text-blue-600" },
    in_progress: { label: "В работе", cls: "bg-amber-500/10 text-amber-600" },
    resolved: { label: "Закрыт", cls: "bg-emerald-500/10 text-emerald-600" },
  }[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${map.cls}`}>
      {map.label}
    </span>
  );
}

function Contact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-medium">{value}</div>
    </div>
  );
}

function SField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="h-11 w-full rounded-2xl border border-hairline bg-surface px-4 text-[14px] outline-none focus:border-foreground"
      />
    </label>
  );
}