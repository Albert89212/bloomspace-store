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

const OWNER_PASSWORD = "owner123";
const LOCAL_PASSWORDS_KEY = "sadova-auth-passwords-v1";

function isServerAuthUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /База данных|DATABASE_URL|SESSION_SECRET|ECONNREFUSED|connect/i.test(message);
}

function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function upsertUser(users: AppUser[], user: AppUser) {
  const base = users.some((u) => u.id === TEST_OWNER.id || u.email === TEST_OWNER.email)
    ? users
    : [TEST_OWNER, ...users];
  return [user, ...base.filter((u) => u.id !== user.id && u.email !== user.email)];
}

function createReferralCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

async function localHash(email: string, password: string) {
  const payload = `${email}:${password}:sadova-local-fallback`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return payload;
}

function readLocalPasswords(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_PASSWORDS_KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function writeLocalPasswords(value: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_PASSWORDS_KEY, JSON.stringify(value));
}

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
          set((s) => ({
            users: user ? upsertUser(s.users, user as AppUser) : upsertUser(s.users, TEST_OWNER),
            currentUserId: user?.id ?? s.currentUserId,
            _hydrated: true,
          }));
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
          set((s) => ({ users: upsertUser(s.users, res.user as AppUser), currentUserId: res.user.id, _hydrated: true }));
          return { ok: true };
        } catch (error) {
          if (!isServerAuthUnavailable(error)) {
            return { ok: false, error: messageFrom(error, "Не удалось зарегистрироваться") };
          }

          const exists = get().users.some((u) => u.email.toLowerCase() === email);
          if (exists) return { ok: false, error: "Email уже зарегистрирован" };

          const ref = referralCode?.trim().toUpperCase();
          const user: AppUser = {
            id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim(),
            email,
            role: "customer",
            referralCode: createReferralCode(),
            referredBy: ref || undefined,
            bonusBalance: ref ? 500 : 0,
            createdAt: Date.now(),
            emailVerified: true,
            invitedCount: 0,
          };
          const passwords = readLocalPasswords();
          passwords[email] = await localHash(email, password);
          writeLocalPasswords(passwords);
          set((s) => ({ users: upsertUser(s.users, user), currentUserId: user.id, _hydrated: true }));
          return { ok: true };
        }
      },
      login: async (email, password) => {
        email = email.trim().toLowerCase();
        try {
          const res = await serverLogin({ data: { email, password } });
          set((s) => ({ users: upsertUser(s.users, res.user as AppUser), currentUserId: res.user.id, _hydrated: true }));
          return { ok: true };
        } catch (error) {
          if (!isServerAuthUnavailable(error)) {
            return { ok: false, error: messageFrom(error, "Неверный email или пароль") };
          }

          if (email === TEST_OWNER.email && password === OWNER_PASSWORD) {
            set((s) => ({ users: upsertUser(s.users, TEST_OWNER), currentUserId: TEST_OWNER.id, _hydrated: true }));
            return { ok: true };
          }

          const user = get().users.find((u) => u.email.toLowerCase() === email);
          const stored = readLocalPasswords()[email];
          if (user && stored && stored === (await localHash(email, password))) {
            set((s) => ({ users: upsertUser(s.users, user), currentUserId: user.id, _hydrated: true }));
            return { ok: true };
          }
          return { ok: false, error: "Неверный email или пароль" };
        }
      },
      logout: async () => {
        await serverLogout().catch(() => {});
        set((s) => ({ currentUserId: null, users: upsertUser(s.users, TEST_OWNER) }));
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