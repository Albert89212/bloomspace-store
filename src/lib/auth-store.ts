import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StaffRole } from "./admin-store";
import { createId } from "./id";
import { fetchCollection, saveCollection } from "./shared-collection.functions";

// Демо-аутентификация: пользователи и сессия хранятся в localStorage.
// В проде — заменить на JWT-эндпоинты Express (server/src/routes/auth.ts).

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo-only, plaintext. В проде — хешируем на бэкенде.
  role: StaffRole | "customer" | "dealer";
  referralCode: string;
  referredBy?: string; // referralCode того, кто пригласил
  bonusBalance: number; // бонусные рубли за приглашённых
  createdAt: number;
  emailVerified?: boolean;
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
  }) => { ok: true } | { ok: false; error: string };
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
  addBonus: (id: string, delta: number) => void;
}

function code(len = 6) {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => s[Math.floor(Math.random() * s.length)]).join("");
}

const TEST_OWNER: AppUser = {
  id: "owner-seed",
  name: "Альберт Тогашев",
  email: "owner@sadova.ru",
  password: "owner123",
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
          const remote = (await fetchCollection({ data: { name: "users" } })) as AppUser[];
          if (Array.isArray(remote) && remote.length) {
            const hasOwner = remote.some((u) => u.email === TEST_OWNER.email);
            set({ users: hasOwner ? remote : [TEST_OWNER, ...remote], _hydrated: true });
            return;
          }
        } catch {
          /* keep local cache */
        }
        set({ _hydrated: true });
      },
      signup: ({ name, email, password, referralCode }) => {
        email = email.trim().toLowerCase();
        if (!/\S+@\S+\.\S+/.test(email)) return { ok: false, error: "Некорректный email" };
        if (password.length < 6) return { ok: false, error: "Пароль минимум 6 символов" };
        if (get().users.some((u) => u.email === email))
          return { ok: false, error: "Email уже зарегистрирован" };
        const referrer = referralCode
          ? get().users.find(
              (u) => u.referralCode.toUpperCase() === referralCode.toUpperCase(),
            )
          : undefined;
        const user: AppUser = {
          id: createId("user"),
          name: name.trim(),
          email,
          password,
          role: "customer",
          referralCode: code(),
          referredBy: referrer?.referralCode,
          bonusBalance: referrer ? 500 : 0,
          createdAt: Date.now(),
          emailVerified: true,
        };
        set((s) => {
          const users = s.users.map((u) =>
            referrer && u.id === referrer.id ? { ...u, bonusBalance: u.bonusBalance + 1000 } : u,
          ).concat(user);
          void saveCollection({ data: { name: "users", items: users } }).catch(() => {});
          return { users, currentUserId: user.id };
        });
        return { ok: true };
      },
      login: (email, password) => {
        email = email.trim().toLowerCase();
        const u = get().users.find((x) => x.email === email && x.password === password);
        if (!u) return { ok: false, error: "Неверный email или пароль" };
        set({ currentUserId: u.id });
        return { ok: true };
      },
      logout: () => set({ currentUserId: null }),
      updateUser: (id, patch) =>
        set((s) => {
          const users = s.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
          void saveCollection({ data: { name: "users", items: users } }).catch(() => {});
          return { users };
        }),
      removeUser: (id) =>
        set((s) => {
          const users = s.users.filter((u) => u.id !== id);
          void saveCollection({ data: { name: "users", items: users } }).catch(() => {});
          return { users, currentUserId: s.currentUserId === id ? null : s.currentUserId };
        }),
      addBonus: (id, delta) =>
        set((s) => {
          const users = s.users.map((u) =>
            u.id === id ? { ...u, bonusBalance: Math.max(0, u.bonusBalance + delta) } : u,
          );
          void saveCollection({ data: { name: "users", items: users } }).catch(() => {});
          return { users };
        }),
    }),
    { name: "sadova-auth" },
  ),
);

export function useCurrentUser() {
  return useAuth((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
}