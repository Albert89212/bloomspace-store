import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles } from "lucide-react";
import hero from "@/assets/hero-chair.jpg";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products-store";
import { Product3DViewer } from "@/components/Product3DViewer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const products = useProducts((s) => s.items);
  const featured = products.slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(1200px 600px at 85% 10%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 60%), radial-gradient(900px 500px at 5% 90%, color-mix(in oklab, var(--accent-warm) 18%, transparent), transparent 60%), var(--surface)",
          }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl -z-10"
          style={{ background: "color-mix(in oklab, var(--accent-cool) 45%, transparent)" }}
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl -z-10"
          style={{ background: "color-mix(in oklab, var(--brand) 40%, transparent)" }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-16 md:grid-cols-2 md:gap-6 md:py-28">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-background/60 px-3 py-1 text-[12px] font-medium uppercase tracking-[0.14em] backdrop-blur"
            >
              <Leaf className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} />
              Коллекция 2026 · Сад под ключ
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-[42px] font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-7xl"
            >
              Скамейки,{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(120deg, var(--brand), var(--accent-cool))",
                }}
              >
                кресла
              </span>{" "}
              и&nbsp;лаунж<br />для сада мечты.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-md text-[16px] leading-relaxed text-muted-foreground md:text-[17px]"
            >
              Мебель, которая живёт под открытым небом столько же, сколько ваш сад. Материалы,
              выдерживающие всё — от солнца до снега.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/catalog"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium text-background shadow-lg transition-transform active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 70%, black))",
                }}
              >
                Смотреть каталог
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/life"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 text-[14px] font-medium transition-colors hover:bg-secondary"
              >
                <Sparkles className="h-4 w-4" style={{ color: "var(--accent-warm)" }} />
                Жизнь магазина
              </Link>
            </motion.div>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { label: "Тик", color: "var(--accent-warm)" },
                { label: "Алюминий", color: "var(--accent-cool)" },
                { label: "Ротанг", color: "var(--brand)" },
                { label: "HPL-камень", color: "#7a7a7a" },
              ].map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background/60 px-3 py-1 text-[12px] backdrop-blur"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-first md:order-last"
          >
            <div className="relative">
              <img
                src={hero}
                alt="Кресло Aero Lounge"
                width={1600}
                height={1200}
                loading="eager"
                className="w-full object-contain drop-shadow-2xl"
              />
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-4 left-4 hidden items-center gap-2 rounded-full border border-hairline bg-background/80 px-3 py-1.5 text-[12px] backdrop-blur sm:inline-flex"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
                В наличии · отгрузка 1–2 дня
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl"
          >
            Избранное
          </motion.h2>
          <Link
            to="/catalog"
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Весь каталог →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-3xl border border-hairline bg-surface p-12 text-center">
            <div className="text-[15px] font-medium">Скоро — первые модели</div>
            <div className="mt-2 text-[13px] text-muted-foreground">
              Каталог наполняется. Загляните позже или подпишитесь на нашу «Жизнь».
            </div>
            <Link
              to="/life"
              className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-[13px] font-medium text-background"
            >
              Смотреть «Жизнь»
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-24">
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              3D-конфигуратор
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Крутите. Смотрите со всех сторон.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Каждая модель — интерактивная 3D-сцена: выбирайте цвет каркаса и обивки,
              рассматривайте текстуру металла и дерева, прежде чем оформить заказ.
            </p>
            <Link
              to="/catalog"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-[13px] font-medium hover:bg-secondary"
            >
              Выбрать модель <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <Product3DViewer />
        </div>
      </section>

      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:grid-cols-2 md:grid-cols-3 md:py-20">
          {[
            {
              icon: Truck,
              title: "Бесплатная доставка",
              body: "От 30 000 ₽ по всей России",
              color: "var(--brand)",
            },
            {
              icon: ShieldCheck,
              title: "Гарантия до 10 лет",
              body: "На все несущие конструкции",
              color: "var(--accent-cool)",
            },
            {
              icon: Sparkles,
              title: "Оплата в РФ",
              body: "Карта, СБП, ЮKassa, CloudPayments",
              color: "var(--accent-warm)",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-3xl border border-hairline bg-background p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in oklab, ${f.color} 14%, transparent)`,
                  color: f.color,
                }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-[15px] font-medium">{f.title}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{f.body}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
