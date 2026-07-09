import { create } from "zustand";
import { persist } from "zustand/middleware";

// Demo-only role storage persisted in localStorage.
// Backend replaces this with a real JWT role check (server/src/middleware/auth.ts).

export type StaffRole = "owner" | "admin" | "moderator" | "support";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  createdAt: number;
}

export const roleLabel: Record<StaffRole, string> = {
  owner: "Владелец",
  admin: "Администратор",
  moderator: "Модератор",
  support: "Поддержка",
};

// Access matrix — what each role can open in the admin panel.
export const rolePermissions: Record<StaffRole, string[]> = {
  owner: ["overview", "products", "orders", "reviews", "tickets", "life", "promocodes", "staff"],
  admin: ["overview", "products", "orders", "reviews", "tickets", "life", "promocodes"],
  moderator: ["overview", "reviews", "tickets", "life"],
  support: ["overview", "tickets", "orders"],
};

interface AdminState {
  isAdmin: boolean;
  role: StaffRole | null;
  staff: StaffMember[];
  login: (role?: StaffRole) => void;
  logout: () => void;
  addStaff: (s: Omit<StaffMember, "id" | "createdAt">) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;
  can: (perm: string) => boolean;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useAdmin = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdmin: false,
      role: null,
      staff: [],
      login: (role = "owner") => set({ isAdmin: true, role }),
      logout: () => set({ isAdmin: false, role: null }),
      addStaff: (s) =>
        set((st) => ({
          staff: [
            { ...s, id: uid(), createdAt: Date.now(), email: s.email.trim().toLowerCase() },
            ...st.staff,
          ],
        })),
      updateStaff: (id, patch) =>
        set((st) => ({
          staff: st.staff.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeStaff: (id) =>
        set((st) => ({ staff: st.staff.filter((x) => x.id !== id) })),
      can: (perm) => {
        const r = get().role;
        if (!r) return false;
        return rolePermissions[r].includes(perm);
      },
    }),
    { name: "sadova-admin" },
  ),
);

// Backwards compat shim for older components still calling setAdmin(bool).