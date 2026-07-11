import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

// Demo-only role storage persisted in localStorage.
// Backend replaces this with a real JWT role check (server/src/middleware/auth.ts).

export type StaffRole = "owner" | "admin" | "moderator" | "support" | "orders";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  createdAt: number;
}

// Дефолтные названия должностей. Owner может переопределять через customRoleLabels.
export const roleLabel: Record<StaffRole, string> = {
  owner: "Владелец",
  admin: "Администратор",
  moderator: "Модератор",
  support: "Техподдержка",
  orders: "Менеджер заказов",
};

// Что каждой роли доступно в админ-панели.
export const rolePermissions: Record<StaffRole, string[]> = {
  owner: ["overview", "products", "orders", "reviews", "tickets", "chats", "staffchat", "life", "promocodes", "news", "staff"],
  admin: ["overview", "products", "orders", "reviews", "tickets", "chats", "staffchat", "life", "promocodes", "news"],
  moderator: ["overview", "reviews", "tickets", "chats", "staffchat", "life", "news"],
  support: ["overview", "tickets", "chats", "staffchat"],
  orders: ["overview", "orders", "chats", "staffchat"],
};

export const roleDuties: Record<StaffRole, string> = {
  owner: "Полный контроль: сотрудники, товары, объявления, финансы.",
  admin: "Каталог, объявления, промокоды, модерация и заказы.",
  moderator: "Отзывы, тикеты, «Жизнь», новости и правила общения.",
  support: "Чаты с клиентами и обращения в техподдержку.",
  orders: "Обработка и статусы заказов, коммуникация с покупателями.",
};

interface AdminState {
  isAdmin: boolean;
  role: StaffRole | null;
  staff: StaffMember[];
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Пользовательские названия должностей (задаёт Владелец). */
  customRoleLabels: Partial<Record<StaffRole, string>>;
  login: (role?: StaffRole) => void;
  logout: () => void;
  addStaff: (s: Omit<StaffMember, "id" | "createdAt">) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
  setRoleLabel: (role: StaffRole, label: string) => void;
  resetRoleLabel: (role: StaffRole) => void;
  getLabel: (role: StaffRole) => string;
  can: (perm: string) => boolean;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const pushStaff = (staff: StaffMember[]) => {
  void saveCollection({ data: { name: "staff", items: staff } }).catch(() => {});
};
const pushLabels = (labels: Partial<Record<StaffRole, string>>) => {
  const items = Object.entries(labels).map(([role, label]) => ({ id: role, role, label }));
  void saveCollection({ data: { name: "role-labels", items } }).catch(() => {});
};

export const useAdmin = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      role: null,
      staff: [],
      _hydrated: false,
      customRoleLabels: {},
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const [staff, labels] = await Promise.all([
            fetchCollection({ data: { name: "staff" } }),
            fetchCollection({ data: { name: "role-labels" } }),
          ]);
          const customRoleLabels = Array.isArray(labels)
            ? labels.reduce<Partial<Record<StaffRole, string>>>((acc, item: any) => {
                if (item?.role && item?.label) acc[item.role as StaffRole] = String(item.label);
                return acc;
              }, {})
            : {};
          set({
            staff: Array.isArray(staff) ? (staff as StaffMember[]) : get().staff,
            customRoleLabels,
            _hydrated: true,
          });
          return;
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      login: (role = "owner") => set({ isAdmin: true, role }),
      logout: () => set({ isAdmin: false, role: null }),
      addStaff: (s) =>
        set((st) => {
          const staff = [
            { ...s, id: uid(), createdAt: Date.now(), email: s.email.trim().toLowerCase() },
            ...st.staff,
          ];
          pushStaff(staff);
          return { staff };
        }),
      updateStaff: (id, patch) =>
        set((st) => {
          const staff = st.staff.map((x) => (x.id === id ? { ...x, ...patch } : x));
          pushStaff(staff);
          return { staff };
        }),
      removeStaff: (id) =>
        set((st) => {
          const staff = st.staff.filter((x) => x.id !== id);
          pushStaff(staff);
          return { staff };
        }),
      setRoleLabel: (role, label) =>
        set((st) => {
          const customRoleLabels = { ...st.customRoleLabels, [role]: label.trim() || roleLabel[role] };
          pushLabels(customRoleLabels);
          return { customRoleLabels };
        }),
      resetRoleLabel: (role) =>
        set((st) => {
          const next = { ...st.customRoleLabels };
          delete next[role];
          pushLabels(next);
          return { customRoleLabels: next };
        }),
      getLabel: (role) => get().customRoleLabels[role] ?? roleLabel[role],
      can: (perm) => {
        const r = get().role;
        if (!r) return false;
        return rolePermissions[r].includes(perm);
      },
    }),
    { name: "sadova-admin" },
  ),
);

/** Хук: актуальное название должности с учётом переименований Владельца. */
export function useRoleLabel(role: StaffRole | null | undefined): string {
  return useAdmin((s) => (role ? s.customRoleLabels[role] ?? roleLabel[role] : ""));
}

// Backwards compat shim for older components still calling setAdmin(bool).