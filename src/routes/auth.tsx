import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LogOut, Sparkles, Mail, ShieldCheck } from "lucide-react";
import { useAuth, useCurrentUser } from "@/lib/auth-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const user = useCurrentUser();
  return user ? <AccountPanel /> : <AuthForm />;
}

function AuthForm() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const requestSignup = useAuth((s) => s.requestSignup);
  const confirmSignup = useAuth((s) => s.confirmSignup);
  const [mode, setMode] = useState<"login" | "signup" | "verify">(
    search.ref ? "signup" : "login",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState(search.ref ?? "");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "login") {
      const res = login(email, password);
      if (!res.ok) return setError(res.error);
      navigate({ to: "/" });
      return;
    }
    if (mode === "signup") {
      const res = requestSignup({ name, email, password, referralCode: ref || undefined });
      if (!res.ok) return setError(res.error);
      setDevCode(res.code);
      setMode("verify");
      return;
    }
    // verify
    const res = confirmSignup(otp);
    if (!res.ok) return setError(res.error);
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-semibold tracking-tight">
          {mode === "login" ? "С возвращением" : mode === "signup" ? "Создать аккаунт" : "Подтверждение почты"}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {mode === "login" && "Войдите, чтобы отслеживать заказы и оставлять отзывы"}
          {mode === "signup" && "Регистрация даёт бонусы за приглашённых друзей"}
          {mode === "verify" && (
            <>Мы отправили 6-значный код на <b className="text-foreground">{email}</b>. Введите его ниже.</>
          )}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-8 space-y-4"
          onSubmit={submit}
        >
          {mode === "signup" && (
            <Field label="Имя" type="text" placeholder="Иван Петров" value={name} onChange={setName} required />
          )}
          {mode !== "verify" && (
            <>
              <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
              <Field label="Пароль" type="password" placeholder="Минимум 6 символов" value={password} onChange={setPassword} required />
            </>
          )}
          {mode === "signup" && (
            <Field label="Реферальный код (по желанию)" type="text" placeholder="ABCD12" value={ref} onChange={setRef} />
          )}
          {mode === "verify" && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                  Код из письма
                </span>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoFocus
                  placeholder="123456"
                  className="h-14 w-full rounded-2xl border border-hairline bg-surface px-4 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-foreground"
                />
              </label>
              {devCode && (
                <div className="rounded-xl border border-dashed border-hairline p-3 text-[11px] text-muted-foreground">
                  <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
                  Демо-режим: код <b className="font-mono text-foreground">{devCode}</b>.
                  В проде отправка через Lovable Emails / SMTP.
                </div>
              )}
            </>
          )}

          {error && <div className="text-[12px] text-red-600">{error}</div>}

          {mode === "signup" && (
            <label className="flex items-start gap-2 pt-2 text-[12px] text-muted-foreground">
              <input type="checkbox" className="mt-0.5" defaultChecked required />
              <span>
                Согласен с{" "}
                <Link to="/legal/terms" className="underline">пользовательским соглашением</Link>
                {" "}и обработкой персональных данных согласно{" "}
                <Link to="/legal/privacy" className="underline">152-ФЗ</Link>
              </span>
            </label>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="mt-4 h-12 w-full rounded-full bg-foreground text-[14px] font-medium text-background"
          >
            {mode === "login" && "Войти"}
            {mode === "signup" && (<><Mail className="mr-2 inline h-4 w-4" /> Отправить код на почту</>)}
            {mode === "verify" && "Подтвердить и войти"}
          </motion.button>

          {mode === "login" && (
            <div className="pt-4">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-hairline" />или<span className="h-px flex-1 bg-hairline" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <SocialBtn label="VK ID" />
                <SocialBtn label="Яндекс" />
                <SocialBtn label="Telegram" />
              </div>
              <div className="mt-2 text-center text-[10px] text-muted-foreground">
                Соцлогин подключается на сервере (VK ID, Yandex ID, Telegram Login).
              </div>
            </div>
          )}
        </motion.form>
      </AnimatePresence>

      <div className="mt-6 text-center text-[13px] text-muted-foreground">
        {mode === "login" ? "Нет аккаунта?" : mode === "verify" ? "Ошиблись?" : "Уже есть аккаунт?"}{" "}
        <button
          onClick={() => {
            setError(null);
            setOtp("");
            setMode(mode === "login" ? "signup" : "login");
          }}
          className="text-foreground underline underline-offset-2"
        >
          {mode === "login" ? "Регистрация" : "Войти"}
        </button>
      </div>
    </div>
  );
}

function SocialBtn({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => alert(`${label}: подключается на сервере через OAuth. Демо-заглушка.`)}
      className="h-10 rounded-full border border-hairline text-[12px] font-medium hover:bg-secondary"
    >
      {label}
    </button>
  );
}

function AccountPanel() {
  const user = useCurrentUser()!;
  const logout = useAuth((s) => s.logout);
  const users = useAuth((s) => s.users);
  const invited = users.filter((u) => u.referredBy === user.referralCode);
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth?ref=${user.referralCode}`
      : `/auth?ref=${user.referralCode}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-widest text-muted-foreground">
            Личный кабинет · {user.role === "customer" ? "Клиент" : user.role.toUpperCase()}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{user.name}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-[12px] hover:bg-secondary"
        >
          <LogOut className="h-3.5 w-3.5" /> Выйти
        </button>
      </div>

      <div className="mt-8 rounded-3xl bg-surface p-6">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <Sparkles className="h-4 w-4" /> Реферальная программа
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Приглашайте друзей — вы получаете <b>1 000 ₽</b> бонусов за каждого,
          друг получает <b>500 ₽</b> приветственных.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Ваш код" value={user.referralCode} mono />
          <Stat label="Приглашено" value={String(invited.length)} />
          <Stat label="Бонусов" value={`${user.bonusBalance} ₽`} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="h-10 flex-1 rounded-full border border-hairline bg-background px-4 text-[12px]"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => navigator.clipboard?.writeText(inviteLink)}
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-[12px] text-background"
          >
            <Copy className="h-3.5 w-3.5" /> Копировать
          </button>
        </div>
      </div>

      {user.role !== "customer" && (
        <Link
          to="/admin"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-[13px] font-medium text-background"
        >
          Перейти в админ-панель
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-hairline bg-background p-4">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${mono ? "font-mono tracking-widest" : ""}`}>{value}</div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={type === "password" ? 6 : undefined}
        className="h-12 w-full rounded-2xl border border-hairline bg-surface px-4 text-[14px] outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}