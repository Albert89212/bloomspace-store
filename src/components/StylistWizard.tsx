import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

type Ctx = "dacha" | "terrace" | "gift" | "cafe";
type Style = "wood" | "metal" | "mix";
type Budget = "eco" | "mid" | "premium";

const CTX_LABEL: Record<Ctx, string> = {
  dacha: "Дача / участок",
  terrace: "Терраса / балкон",
  gift: "В подарок",
  cafe: "HoReCa / кафе",
};

const STYLE_LABEL: Record<Style, string> = {
  wood: "Тёплое дерево",
  metal: "Строгий металл",
  mix: "Комбинация",
};

const BUDGET_LABEL: Record<Budget, string> = {
  eco: "до 15 000 ₽",
  mid: "15 000 – 45 000 ₽",
  premium: "от 45 000 ₽",
};

function contextToCategory(ctx: Ctx): string {
  if (ctx === "terrace") return "chairs";
  if (ctx === "cafe") return "tables";
  if (ctx === "gift") return "accessories";
  return "benches";
}

export function StylistWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);

  function reset() {
    setStep(0);
    setCtx(null);
    setStyle(null);
    setBudget(null);
  }

  const promo = "SADOVA5";
  const cat = ctx ? contextToCategory(ctx) : "benches";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 hidden h-12 items-center gap-2 rounded-full bg-foreground pl-4 pr-5 text-[13px] font-medium text-background shadow-xl transition-transform hover:scale-[1.03] md:inline-flex"
        aria-label="Подобрать мебель"
      >
        <Sparkles className="h-4 w-4" style={{ color: "var(--accent-warm)" }} />
        Подобрать
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-4 top-1/2 z-[81] mx-auto max-w-lg -translate-y-1/2 overflow-hidden rounded-3xl bg-background p-6 shadow-2xl md:inset-x-6 md:p-8"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="absolute right-3 top-3 rounded-full p-2 hover:bg-secondary"
                aria-label="Закрыть"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--accent-warm)" }} />
                Помощник · Шаг {Math.min(step + 1, 4)} из 4
              </div>

              {step === 0 && (
                <Step
                  title="Куда подбираем?"
                  options={Object.entries(CTX_LABEL) as [Ctx, string][]}
                  onPick={(v) => {
                    setCtx(v);
                    setStep(1);
                  }}
                />
              )}
              {step === 1 && (
                <Step
                  title="Какой стиль ближе?"
                  options={Object.entries(STYLE_LABEL) as [Style, string][]}
                  onPick={(v) => {
                    setStyle(v);
                    setStep(2);
                  }}
                />
              )}
              {step === 2 && (
                <Step
                  title="Бюджет"
                  options={Object.entries(BUDGET_LABEL) as [Budget, string][]}
                  onPick={(v) => {
                    setBudget(v);
                    setStep(3);
                  }}
                />
              )}
              {step === 3 && (
                <div className="mt-6">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    Готово — подборка ждёт
                  </h3>
                  <p className="mt-2 text-[14px] text-muted-foreground">
                    Мы подобрали раздел{" "}
                    <b className="text-foreground">
                      «{ctx ? CTX_LABEL[ctx] : ""}»
                    </b>
                    {style ? ` в стиле «${STYLE_LABEL[style]}»` : ""}
                    {budget ? ` с бюджетом ${BUDGET_LABEL[budget]}` : ""}.
                  </p>
                  <div className="mt-4 rounded-2xl bg-surface p-4 text-[13px]">
                    Ваш промокод <b>-5%</b>:{" "}
                    <span className="rounded-md bg-background px-2 py-0.5 font-mono text-[12px]">
                      {promo}
                    </span>
                  </div>
                  <Link
                    to="/catalog"
                    search={{ cat: cat as any }}
                    onClick={() => {
                      setOpen(false);
                      reset();
                    }}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-medium text-background"
                  >
                    Открыть подборку <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Step<T extends string>({
  title,
  options,
  onPick,
}: {
  title: string;
  options: [T, string][];
  onPick: (v: T) => void;
}) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h3>
      <div className="mt-4 grid gap-2">
        {options.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onPick(value)}
            className="flex items-center justify-between rounded-2xl border border-hairline bg-surface p-4 text-left text-[14px] transition-colors hover:border-foreground"
          >
            <span>{label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}