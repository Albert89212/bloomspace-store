import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Bell,
  Copy,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { useAuth, useCurrentUser } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";
import { useWishlist, selectWishCount } from "@/lib/wishlist-store";
import { useTickets } from "@/lib/tickets-store";
import { useAdmin, roleLabel } from "@/lib/admin-store";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatPrice } from "@/lib/products";

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
  const signup = useAuth((s) => s.signup);
  const [mode, setMode] = useState<"login" | "signup">(search.ref ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ref, setRef] = useState(search.ref ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (busy) return;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanRef = ref.trim();
    if (!cleanEmail || !password) {
      setError("Заполните email и пароль");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError("Введите корректный email");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    setBusy(true);
    if (mode === "login") {
      const res = await login(cleanEmail, password);
      if (!res.ok) {
        setBusy(false);
        setError(res.error);
        return;
      }
      navigate({ to: "/" });
      return;
    }
    if (!cleanName) {
      setBusy(false);
      setError("Укажите имя");
      return;
    }
    const res = await signup({ name: cleanName, email: cleanEmail, password, referralCode: cleanRef || undefined });
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-semibold tracking-tight">
          {mode === "login" ? "С возвращением" : "Создать аккаунт"}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {mode === "login" && "Войдите, чтобы отслеживать заказы и оставлять отзывы"}
          {mode === "signup" && "Регистрация даёт бонусы за приглашённых друзей"}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.form
          key={mode}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="mt-8 space-y-4"
          onSubmit={submit}
          noValidate
        >
          {mode === "signup" && (
            <Field label="Имя" type="text" placeholder="Иван Петров" value={name} onChange={setName} required />
          )}
          <Field label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} required />
          <Field label="Пароль" type="password" placeholder="Минимум 6 символов" value={password} onChange={setPassword} required />
          {mode === "signup" && (
            <Field label="Реферальный код (по желанию)" type="text" placeholder="ABCD12" value={ref} onChange={setRef} />
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
            disabled={busy}
            className="mt-4 h-12 w-full rounded-full bg-foreground text-[14px] font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </motion.button>
        </motion.form>
      </AnimatePresence>

      <div className="mt-6 text-center text-[13px] text-muted-foreground">
        {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setBusy(false);
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

function AccountPanel() {
  const user = useCurrentUser()!;
  const logout = useAuth((s) => s.logout);
  const orders = useOrders((s) =>
    s.items.filter((o) => o.customer.email.toLowerCase() === user.email.toLowerCase()),
  );
  const wishCount = useWishlist(selectWishCount);
  const myTickets = useTickets((s) =>
    s.items.filter((t) => t.userId === user.id || t.email.toLowerCase() === user.email.toLowerCase()),
  );
  const isStaff = user.role !== "customer" && user.role !== "dealer";
  const getLabel = useAdmin((s) => s.getLabel);
  const roleTitle = isStaff ? getLabel(user.role as any) : user.role === "dealer" ? "Дилер" : "Клиент";

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth?ref=${user.referralCode}`
      : `/auth?ref=${user.referralCode}`;

  const [copied, setCopied] = useState(false);
  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
  const activeOrders = orders.filter((o) => o.status === "new" || o.status === "paid" || o.status === "shipping").length;

  function doCopy() {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 pb-28 md:px-6 md:py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 p-6 text-background md:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "conic-gradient(from 210deg, var(--brand), var(--accent-warm), var(--accent-cool))" }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/10 text-xl font-semibold uppercase backdrop-blur">
              {user.name.slice(0, 1)}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest opacity-70">{roleTitle}</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{user.name}</h1>
              <p className="mt-0.5 text-[13px] opacity-80">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 text-[12px] font-medium backdrop-blur transition-colors hover:bg-background/20"
          >
            <LogOut className="h-3.5 w-3.5" /> Выйти
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Заказов" value={String(orders.length)} />
          <MiniStat label="Активных" value={String(activeOrders)} />
          <MiniStat label="Куплено на" value={formatPrice(totalSpent)} />
          <MiniStat label="Бонусов" value={`${user.bonusBalance} ₽`} />
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Action to="/wishlist" icon={Heart} label="Избранное" hint={`${wishCount} товаров`} />
        <Action to="/cart" icon={Package} label="Корзина" hint="Оформить заказ" />
        <Action to="/chats" icon={MessageSquare} label="Чаты" hint="Новости и поддержка" />
        <Action to="/support" icon={Ticket} label="Тикеты" hint={`${myTickets.length} обращений`} />
      </div>

      {/* Referral */}
      <section className="mt-8 rounded-3xl bg-surface p-6">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <Sparkles className="h-4 w-4" style={{ color: "var(--brand)" }} /> Реферальная программа
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Приглашайте друзей — вы получаете <b>1 000 ₽</b> бонусов за каждого, друг получает <b>500 ₽</b> приветственных.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Ваш код" value={user.referralCode} mono />
          <Stat label="Приглашено" value={String(user.invitedCount ?? 0)} />
          <Stat label="Бонусов" value={`${user.bonusBalance} ₽`} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={inviteLink}
            className="h-10 min-w-0 flex-1 rounded-full border border-hairline bg-background px-4 text-[12px]"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            onClick={doCopy}
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-[12px] text-background transition-transform active:scale-95"
          >
            <Copy className="h-3.5 w-3.5" /> {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
      </section>

      {/* Orders */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Мои заказы</h2>
          <Link to="/catalog" className="text-[12px] text-muted-foreground underline-offset-2 hover:underline">
            В каталог →
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-hairline p-8 text-center text-[13px] text-muted-foreground">
            Пока нет заказов. Первая покупка даст +500 ₽ бонусами.
          </div>
        ) : (
          <ul className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link
                  to="/order/$number"
                  params={{ number: o.number }}
                  className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-4 transition-colors hover:border-muted-foreground/40"
                >
                  <div>
                    <div className="text-[13px] font-medium">{o.number}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("ru-RU")} · {o.items.length} товар(а)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-semibold tabular-nums">{formatPrice(o.total)}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.status}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Settings */}
      <section className="mt-8 rounded-3xl bg-surface p-6">
        <div className="mb-4 flex items-center gap-2 text-[13px] font-medium">
          <Settings className="h-4 w-4" /> Настройки
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <SettingRow icon={UserRound} title="Профиль" hint="Имя, email, аватар" href="#" />
          <SettingRow icon={Bell} title="Уведомления" hint="Push и email" href="#" />
          <SettingRow icon={CreditCard} title="Способы оплаты" hint="Сохранённые карты" href="#" />
          <SettingRow icon={Gift} title="Подарочные карты" hint="Купить или активировать" href="/gift" />
          <div className="flex items-center justify-between rounded-2xl border border-hairline bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[13px] font-medium">Тема оформления</div>
                <div className="text-[11px] text-muted-foreground">Светлая · Тёмная · Системная</div>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <SettingRow icon={ShieldCheck} title="Конфиденциальность" hint="Согласия и 152-ФЗ" href="/legal/privacy" />
        </div>
      </section>

      {isStaff && (
        <Link
          to="/admin"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[13px] font-medium text-background"
        >
          <ShieldCheck className="h-4 w-4" /> Перейти в панель · {roleLabel[user.role as keyof typeof roleLabel] ?? "Staff"}
        </Link>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/10 p-3 backdrop-blur">
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="mt-1 truncate text-[15px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Action({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string;
  icon: typeof Heart;
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to as any}
      className="group flex flex-col items-start gap-2 rounded-2xl border border-hairline bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand)" }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{hint}</div>
      </div>
    </Link>
  );
}

function SettingRow({
  icon: Icon,
  title,
  hint,
  href,
}: {
  icon: typeof Heart;
  title: string;
  hint: string;
  href: string;
}) {
  const Cmp: any = href.startsWith("/") ? Link : "a";
  const props = href.startsWith("/") ? { to: href } : { href };
  return (
    <Cmp
      {...props}
      className="flex items-center justify-between rounded-2xl border border-hairline bg-background p-4 transition-colors hover:border-muted-foreground/40"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[13px] font-medium">{title}</div>
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        </div>
      </div>
      <span className="text-[12px] text-muted-foreground">›</span>
    </Cmp>
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