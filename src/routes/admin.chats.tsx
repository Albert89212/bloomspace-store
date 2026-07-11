import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useOrders } from "@/lib/orders-store";
import { useAdmin, roleLabel } from "@/lib/admin-store";
import { useSupportChat } from "@/lib/support-chat-store";
import { useCurrentUser } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/chats")({
  head: () => ({
    meta: [
      { title: "Чаты клиентов — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminChats,
});

function AdminChats() {
  const [mode, setMode] = useState<"orders" | "support">("support");
  return (
    <div className="space-y-6">
      <div className="inline-flex gap-1 rounded-full border border-hairline p-1">
        <button type="button" onClick={() => setMode("support")} className={`rounded-full px-4 py-2 text-[12px] font-medium ${mode === "support" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
          Личные чаты клиентов
        </button>
        <button type="button" onClick={() => setMode("orders")} className={`rounded-full px-4 py-2 text-[12px] font-medium ${mode === "orders" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
          Чаты по заказам
        </button>
      </div>
      {mode === "support" ? <SupportChatsPane /> : <OrderChatsPane />}
    </div>
  );
}

function SupportChatsPane() {
  const threads = useSupportChat((s) => s.threads);
  const sendAsStaff = useSupportChat((s) => s.sendAsStaff);
  const markReadByStaff = useSupportChat((s) => s.markReadByStaff);
  const removeThread = useSupportChat((s) => s.removeThread);
  const role = useAdmin((s) => s.role);
  const user = useCurrentUser();
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? threads.filter((t) => t.userName.toLowerCase().includes(q) || (t.userEmail ?? "").toLowerCase().includes(q))
      : threads;
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, query]);
  const active = threads.find((t) => t.id === openId) ?? null;

  useEffect(() => {
    if (openId) markReadByStaff(openId);
  }, [openId, markReadByStaff, active?.messages.length]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени или email" className="mb-4 w-full rounded-full border border-hairline bg-background px-4 py-2.5 text-[13px] outline-none focus:border-foreground" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ul className="max-h-[70vh] space-y-2 overflow-y-auto rounded-2xl border border-hairline p-2">
          {sorted.length === 0 && <li className="p-6 text-center text-[12px] text-muted-foreground">Нет обращений</li>}
          {sorted.map((t) => {
            const last = t.messages.at(-1);
            const activeItem = openId === t.id;
            return (
              <li key={t.id}>
                <button type="button" onClick={() => setOpenId(t.id)} className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${activeItem ? "bg-foreground text-background" : "hover:bg-secondary"}`}>
                  <div className="flex items-center justify-between text-[12px] font-medium">
                    <span className="truncate">{t.userName}</span>
                    {t.unreadForStaff > 0 && <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{t.unreadForStaff}</span>}
                  </div>
                  {t.userEmail && <div className="mt-0.5 truncate text-[11px] opacity-80">{t.userEmail}</div>}
                  {last && <div className="mt-1 truncate text-[11px] opacity-70">{last.authorName}: {last.text}</div>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl bg-surface p-5">
          {!active ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-[13px] text-muted-foreground">
              <MessageSquare className="mb-3 h-6 w-6" /> Выберите обращение
            </div>
          ) : (
            <div className="flex h-[70vh] flex-col">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                  <div className="text-[14px] font-medium">{active.userName}</div>
                  <div className="text-[11px] text-muted-foreground">{active.userEmail ?? "гость"}</div>
                </div>
                <button type="button" onClick={() => { if (confirm("Удалить переписку?")) { removeThread(active.id); setOpenId(null); } }} className="rounded-full border border-hairline px-3 py-1 text-[11px] text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-1 inline h-3 w-3" /> Удалить
                </button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto py-4">
                {active.messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] ${m.author === "staff" ? "ml-auto bg-foreground text-background" : "bg-background"}`}>
                    <div className="text-[10px] opacity-70">{m.authorName} · {new Date(m.createdAt).toLocaleString("ru-RU")}</div>
                    <div className="mt-0.5 whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  sendAsStaff(active.id, text.trim(), { name: user?.name ?? (role ? roleLabel[role] : "Персонал") });
                  setText("");
                }}
                className="mt-2 flex items-center gap-2 border-t border-hairline pt-3"
              >
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ответить клиенту…" className="flex-1 rounded-full border border-hairline bg-background px-4 py-2.5 text-[13px] outline-none focus:border-foreground" />
                <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[12px] font-medium text-background">
                  <Send className="h-3.5 w-3.5" /> Отправить
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderChatsPane() {
  const orders = useOrders((s) => s.items);
  const addMessage = useOrders((s) => s.addMessage);
  const pruneOldMessages = useOrders((s) => s.pruneOldMessages);
  const role = useAdmin((s) => s.role);
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  // Автоудаление сообщений старше 30 дней при открытии раздела.
  useEffect(() => {
    pruneOldMessages();
  }, [pruneOldMessages]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withChats = orders.filter((o) => (o.messages ?? []).length > 0 || openId === o.id);
    if (!q) return withChats.length ? withChats : orders;
    return orders.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q),
    );
  }, [orders, query, openId]);

  const active = orders.find((o) => o.id === openId) ?? null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Чаты по заказам</h2>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Trash2 className="h-3.5 w-3.5" /> Сообщения автоматически удаляются через 30 дней (152-ФЗ)
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по номеру, имени или email"
        className="mb-4 w-full rounded-full border border-hairline bg-background px-4 py-2.5 text-[13px] outline-none focus:border-foreground"
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ul className="max-h-[70vh] space-y-2 overflow-y-auto rounded-2xl border border-hairline p-2">
          {list.length === 0 && (
            <li className="p-6 text-center text-[12px] text-muted-foreground">Ничего не найдено</li>
          )}
          {list.map((o) => {
            const last = (o.messages ?? []).at(-1);
            const activeItem = openId === o.id;
            return (
              <li key={o.id}>
                <button
                  onClick={() => setOpenId(o.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                    activeItem ? "bg-foreground text-background" : "hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center justify-between text-[12px] font-medium">
                    <span>{o.number}</span>
                    <span className="opacity-70">{(o.messages ?? []).length} 💬</span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] opacity-80">
                    {o.customer.name} · {o.customer.email}
                  </div>
                  {last && (
                    <div className="mt-1 truncate text-[11px] opacity-70">
                      {last.authorName}: {last.text}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl bg-surface p-5">
          {!active ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-[13px] text-muted-foreground">
              <MessageSquare className="mb-3 h-6 w-6" /> Выберите заказ, чтобы открыть переписку
            </div>
          ) : (
            <div className="flex h-[70vh] flex-col">
              <div className="border-b border-hairline pb-3">
                <div className="text-[14px] font-medium">
                  Заказ {active.number} · {active.customer.name}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {active.customer.email} · {active.customer.phone} · {active.customer.city}
                </div>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto py-4">
                {(active.messages ?? []).length === 0 && (
                  <div className="py-10 text-center text-[12px] text-muted-foreground">
                    Переписки пока нет — напишите первым.
                  </div>
                )}
                {(active.messages ?? []).map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] ${
                      m.author === "staff"
                        ? "ml-auto bg-foreground text-background"
                        : "bg-background"
                    }`}
                  >
                    <div className="text-[10px] opacity-70">
                      {m.authorName} · {new Date(m.createdAt).toLocaleString("ru-RU")}
                    </div>
                    <div className="mt-0.5 whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  addMessage(active.id, {
                    author: "staff",
                    authorName: role ? roleLabel[role] : "Персонал",
                    text: text.trim(),
                  });
                  setText("");
                }}
                className="mt-2 flex items-center gap-2 border-t border-hairline pt-3"
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ответить клиенту…"
                  className="flex-1 rounded-full border border-hairline bg-background px-4 py-2.5 text-[13px] outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[12px] font-medium text-background"
                >
                  <Send className="h-3.5 w-3.5" /> Отправить
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}