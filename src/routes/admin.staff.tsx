import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Trash2, Pencil, RotateCcw } from "lucide-react";
import { useAdmin, roleLabel, roleDuties, type StaffRole } from "@/lib/admin-store";

export const Route = createFileRoute("/admin/staff")({
  component: AdminStaff,
});

const roles: StaffRole[] = ["owner", "admin", "moderator", "support", "orders"];

function AdminStaff() {
  const staff = useAdmin((s) => s.staff);
  const addStaff = useAdmin((s) => s.addStaff);
  const updateStaff = useAdmin((s) => s.updateStaff);
  const removeStaff = useAdmin((s) => s.removeStaff);
  const setRoleLabel = useAdmin((s) => s.setRoleLabel);
  const resetRoleLabel = useAdmin((s) => s.resetRoleLabel);
  const customLabels = useAdmin((s) => s.customRoleLabels);
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
        <h2 className="text-lg font-semibold">Названия должностей</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Владелец может переименовать любую должность. Название отобразится по всей админке и в чатах.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {roles.map((r) => (
            <RoleLabelRow
              key={r}
              role={r}
              current={customLabels[r] ?? roleLabel[r]}
              isCustom={Boolean(customLabels[r])}
              onSave={(v) => setRoleLabel(r, v)}
              onReset={() => resetRoleLabel(r)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-hairline bg-surface p-6">
        <h2 className="text-lg font-semibold">Добавить сотрудника</h2>
        <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
          {roles.map((r) => (
            <li key={r}>
              <b className="text-foreground">{customLabels[r] ?? roleLabel[r]}</b> — {roleDuties[r]}
            </li>
          ))}
        </ul>
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
              <option key={r} value={r}>{customLabels[r] ?? roleLabel[r]}</option>
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
                        <option key={r} value={r}>{customLabels[r] ?? roleLabel[r]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-[11px] text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
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

function RoleLabelRow({
  role,
  current,
  isCustom,
  onSave,
  onReset,
}: {
  role: StaffRole;
  current: string;
  isCustom: boolean;
  onSave: (v: string) => void;
  onReset: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(current);
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-hairline bg-background p-3">
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{role}</div>
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 h-8 w-full rounded-lg border border-hairline bg-surface px-2 text-[13px]"
          />
        ) : (
          <div className="mt-1 flex items-center gap-2 text-[14px] font-medium">
            {role === "owner" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
            {current}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {editing ? (
          <>
            <button type="button" onClick={() => { onSave(value); setEditing(false); }} className="rounded-full bg-foreground px-3 py-1 text-[11px] text-background">Ок</button>
            <button type="button" onClick={() => { setValue(current); setEditing(false); }} className="rounded-full border border-hairline px-2 py-1 text-[11px]">Отмена</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Переименовать">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {isCustom && (
              <button type="button" onClick={onReset} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Сбросить">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
