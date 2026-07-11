import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StaffRole } from "./admin-store";
import { serverLogin, serverLogout, serverMe, serverSignup } from "./auth.functions";

// Клиент хранит только безопасный профиль текущей сессии; пароли и список пользователей остаются на сервере.

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole | "customer" | "dealer";
  referralCode: string;
  referredBy?: string; // referralCode того, кто пригласил
  bonusBalance: number; // бонусные рубли за приглашённых
  createdAt: number;
  emailVerified?: boolean;
  invitedCount?: number;
}

interface AuthState {
  users: AppUser[];
  currentUserId: string | null;
  _hydrated: boolean;
  hydrate: () => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
  addBonus: (id: string, delta: number) => void;
}

const TEST_OWNER: AppUser = {
  id: "owner-seed",
  name: "Альберт Тогашев",
  email: "owner@sadova.ru",
  role: "owner",
  referralCode: "OWNER1",
  bonusBalance: 0,
  createdAt: Date.now(),
  emailVerified: true,
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [TEST_OWNER],
      currentUserId: null,
      _hydrated: false,
      hydrate: async () => {
        if (get()._hydrated) return;
        try {
          const { user } = await serverMe();
          set({ users: user ? [user as AppUser] : [TEST_OWNER], currentUserId: user?.id ?? null, _hydrated: true });
          return;
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      signup: async ({ name, email, password, referralCode }) => {
        email = email.trim().toLowerCase();
        if (!/\S+@\S+\.\S+/.test(email)) return { ok: false, error: "Некорректный email" };
        if (password.length < 6) return { ok: false, error: "Пароль минимум 6 символов" };
        try {
          const res = await serverSignup({ data: { name: name.trim(), email, password, referralCode } });
          set({ users: [res.user as AppUser], currentUserId: res.user.id, _hydrated: true });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Не удалось зарегистрироваться" };
        }
      },
      login: async (email, password) => {
        email = email.trim().toLowerCase();
        try {
          const res = await serverLogin({ data: { email, password } });
          set({ users: [res.user as AppUser], currentUserId: res.user.id, _hydrated: true });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Неверный email или пароль" };
        }
      },
      logout: async () => {
        await serverLogout().catch(() => {});
        set({ currentUserId: null, users: [TEST_OWNER] });
      },
      updateUser: (id, patch) =>
        set((s) => {
          const users = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
          return { users };
        }),
      removeUser: (id) =>
        set((s) => {
          const users = s.users.filter((u) => u.id !== id);
          return { users, currentUserId: s.currentUserId === id ? null : s.currentUserId };
        }),
      addBonus: (id, delta) =>
        set((s) => {
          const users = s.users.map((u) =>
            u.id === id ? { ...u, bonusBalance: Math.max(0, u.bonusBalance + delta) } : u,
          );
          return { users };
        }),
    }),
    { name: "sadova-auth" },
  ),
);

export function useCurrentUser() {
  return useAuth((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
}