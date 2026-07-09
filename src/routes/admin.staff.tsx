import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Trash2 } from "lucide-react";
import { useAdmin, roleLabel, type StaffRole } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/staff")({
  component: AdminStaff,
});

const roles: StaffRole[] = ["owner", "admin", "moderator", "support"];

function AdminStaff() {
  const staff = useAdmin((s) => s.staff);
  const addStaff = useAdmin((s) => s.addStaff);
  const updateStaff = useAdmin((s) => s.updateStaff);
  const removeStaff = useAdmin((s) => s.removeStaff);
  const can = useAdmin((s) => s.can);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("moderator");

  if (!can("staff")) {
    return (
      <div className="rounded-3xl border border-hairline p-8 text-center text-[13px] text-muted-foreground">
        Раздел доступен только Владельцу магазина.
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !/\S+@\S+\.\S+/.test(email)) return;
    addStaff({ name: name.trim(), email: email.trim(), role });
    setName("");
    setEmail("");
    setRole("moderator");
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-hairline bg-surface p-6">
        <h2 className="text-lg font-semibold">Добавить сотрудника</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          <b>Владелец (Owner)</b> — полный доступ. <b>Администратор</b> — всё, кроме управления штатом.
          <b> Модератор</b> — отзывы, тикеты и «Жизнь». <b>Поддержка</b> — тикеты и заказы.
        </p>
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            className="h-11 rounded-xl border border-hairline bg-background px-3 text-[14px]"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="h-11 rounded-xl border border-hairline bg-background px-3 text-[14px]"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="h-11 rounded-xl border border-hairline bg-background px-3 text-[14px]"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{roleLabel[r]}</option>
            ))}
          </select>
          <button className="rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background">
            Добавить
          </button>
        </form>
      </div>

      {staff.length === 0 ? (
        <div className="rounded-3xl border border-hairline p-12 text-center text-[13px] text-muted-foreground">
          Сотрудники не добавлены. Вы вошли как Владелец с полным доступом.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hairline">
          <table className="w-full text-[13px]">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4">Сотрудник</th>
                <th className="p-4">Email</th>
                <th className="p-4">Роль</th>
                <th className="p-4">Добавлен</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {staff.map((s) => (
                <tr key={s.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-medium">
                      {s.role === "owner" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                      {s.name}
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{s.email}</td>
                  <td className="p-4">
                    <select
                      value={s.role}
                      onChange={(e) => updateStaff(s.id, { role: e.target.value as StaffRole })}
                      className="h-8 rounded-full border border-hairline bg-background px-3 text-[12px]"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{roleLabel[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-[11px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { if (confirm(`Удалить ${s.name}?`)) removeStaff(s.id); }}
                      className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-[12px] text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
