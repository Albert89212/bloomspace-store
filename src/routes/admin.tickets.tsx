import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTickets, type TicketStatus } from "@/lib/tickets-store";
import { useAdmin, roleLabel } from "@/lib/admin-store";
import { useCurrentUser } from "@/lib/auth-store";

export const Route = createFileRoute("/admin/tickets")({
  component: AdminTickets,
});

const options: { id: TicketStatus; label: string }[] = [
  { id: "open", label: "Новый" },
  { id: "in_progress", label: "В работе" },
  { id: "resolved", label: "Закрыт" },
];

function AdminTickets() {
  const tickets = useTickets((s) => s.items);
  const reply = useTickets((s) => s.reply);
  const setStatus = useTickets((s) => s.setStatus);
  const role = useAdmin((s) => s.role);
  const getLabel = useAdmin((s) => s.getLabel);
  const user = useCurrentUser();
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const staffLabel = role ? getLabel(role) : "Техподдержка";
  const staffName = user?.name ?? staffLabel;

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Тикеты поддержки</h2>
      {tickets.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center text-[13px] text-muted-foreground">
          Тикетов пока нет.
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id} className="overflow-hidden rounded-2xl bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <button
                  onClick={() => setOpenId(openId === t.id ? null : t.id)}
                  className="flex-1 text-left"
                >
                  <div className="text-[14px] font-medium">{t.subject}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {t.email} · {new Date(t.createdAt).toLocaleString("ru-RU")}
                  </div>
                </button>
                <select
                  value={t.status}
                  onChange={(e) => setStatus(t.id, e.target.value as TicketStatus)}
                  className="rounded-full border border-hairline bg-background px-3 py-1.5 text-[12px]"
                >
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {openId === t.id && (
                <div className="border-t border-hairline p-5">
                  <div className="space-y-2">
                    {t.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[85%] rounded-2xl p-3 text-[13px] ${
                          m.author === "support"
                            ? "ml-auto bg-foreground text-background"
                            : "bg-background"
                        }`}
                      >
                        <div className="mb-1 text-[10px] opacity-70">
                          {m.author === "support"
                            ? `${m.authorName ?? staffName} · ${m.authorRole ?? staffLabel}`
                            : m.authorName ?? t.email}
                        </div>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Ответ поддержки…"
                      className="h-10 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px]"
                    />
                    <button
                      onClick={() => {
                        if (!text.trim()) return;
                        reply(t.id, "support", text.trim(), {
                          authorName: staffName,
                          authorRole: staffLabel,
                        });
                        setText("");
                      }}
                      className="rounded-full bg-foreground px-4 text-[13px] font-medium text-background"
                    >
                      Ответить
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}