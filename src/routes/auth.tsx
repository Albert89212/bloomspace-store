import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход — SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          {mode === "login" ? "С возвращением" : "Создать аккаунт"}
        </h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          {mode === "login"
            ? "Войдите, чтобы отслеживать заказы"
            : "Зарегистрируйтесь, чтобы оформить заказ быстрее"}
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
          onSubmit={(e) => e.preventDefault()}
        >
          {mode === "signup" && (
            <Field label="Имя" type="text" placeholder="Иван Петров" />
          )}
          <Field label="Email" type="email" placeholder="you@example.com" />
          <Field label="Пароль" type="password" placeholder="••••••••" />

          <label className="flex items-start gap-2 pt-2 text-[12px] text-muted-foreground">
            <input type="checkbox" className="mt-0.5" defaultChecked />
            <span>
              Согласен с обработкой персональных данных согласно{" "}
              <a href="/legal/privacy" className="underline">
                152-ФЗ
              </a>
            </span>
          </label>

          <motion.button
            whileTap={{ scale: 0.97 }}
            className="mt-4 h-12 w-full rounded-full bg-foreground text-[14px] font-medium text-background"
          >
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </motion.button>
        </motion.form>
      </AnimatePresence>

      <div className="mt-6 text-center text-[13px] text-muted-foreground">
        {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-foreground underline underline-offset-2"
        >
          {mode === "login" ? "Регистрация" : "Войти"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  placeholder,
}: {
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-hairline bg-surface px-4 text-[14px] outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}