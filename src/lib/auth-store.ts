import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StaffRole } from "./admin-store";

// Демо-аутентификация: пользователи и сессия хранятся в localStorage.
// В проде — заменить на JWT-эндпоинты Express (server/src/routes/auth.ts).

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo-only, plaintext. В проде — хешируем на бэкенде.
  role: StaffRole | "customer";
  referralCode: string;
  referredBy?: string; // referralCode того, кто пригласил
  bonusBalance: number; // бонусные рубли за приглашённых
  createdAt: number;
}

interface AuthState {
  users: AppUser[];
  currentUserId: string | null;
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
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [TEST_OWNER],
      currentUserId: null,
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
          id: crypto.randomUUID(),
          name: name.trim(),
          email,
          password,
          role: "customer",
          referralCode: code(),
          referredBy: referrer?.referralCode,
          bonusBalance: referrer ? 500 : 0, // приветственный бонус за приглашение
          createdAt: Date.now(),
        };
        set((s) => ({
          users: s.users.map((u) =>
            referrer && u.id === referrer.id ? { ...u, bonusBalance: u.bonusBalance + 1000 } : u,
          ).concat(user),
          currentUserId: user.id,
        }));
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
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      removeUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          currentUserId: s.currentUserId === id ? null : s.currentUserId,
        })),
    }),
    { name: "sadova-auth" },
  ),
);

export function useCurrentUser() {
  return useAuth((s) => s.users.find((u) => u.id === s.currentUserId) ?? null);
}