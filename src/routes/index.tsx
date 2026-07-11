import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Truck, Sparkles, Star } from "lucide-react";
import hero from "@/assets/hero-bench.jpg";
import sofaImg from "@/assets/product-sofa.jpg";
import loungerImg from "@/assets/product-lounger.jpg";
import tableImg from "@/assets/product-table.jpg";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products-store";
import { EditableText, EditableMedia } from "@/components/Editable";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const products = useProducts((s) => s.items);
  const featured = products.slice(0, 3);
  return (
    <>
      {/* HERO — editorial full-bleed image with copy overlay */}
      <section className="relative">
        <div className="relative mx-auto max-w-[1400px] px-3 pt-3 sm:px-6 sm:pt-6">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px]">
            <div className="h-[78vh] min-h-[560px] w-full sm:h-[82vh] sm:max-h-[820px]">
              <EditableMedia
                id="home.hero.image"
                defaultSrc={hero}
                alt="Скамейка SADOVA — тик и матовая сталь в саду"
                className="h-full w-full object-cover"
                imgProps={{ width: 1600, height: 1808, fetchPriority: "high" }}
              />
            </div>
            {/* Gradient scrim for legibility */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,12,10,0.55) 0%, rgba(10,12,10,0.15) 30%, rgba(10,12,10,0.05) 55%, rgba(10,12,10,0.75) 100%)",
              }}
            />
            {/* Warm colour wash bottom-right */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
              style={{ background: "color-mix(in oklab, var(--accent-warm) 60%, transparent)" }}
            />

            {/* Top row — eyebrow & badge */}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-8">
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md"
              >
                <Leaf className="h-3.5 w-3.5" />
                Коллекция 2026
              </motion.div>
              <motion.div
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="hidden items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md sm:inline-flex"
              >
                <Star className="h-3 w-3 fill-white" />
                4.9 · 320+ садов по России
              </motion.div>
            </div>

            {/* Bottom copy block */}
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10 md:p-14">
              <div className="max-w-3xl text-white">
                <motion.h1
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[40px] font-semibold leading-[0.98] tracking-tight sm:text-6xl md:text-[88px]"
                >
                  <EditableText
                    id="home.hero.title"
                    defaultValue="Сад, в котором хочется остаться."
                    multiline
                    className="block"
                  />
                </motion.h1>
                <motion.p
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/85 sm:text-[17px]"
                >
                  <EditableText
                    id="home.hero.subtitle"
                    defaultValue="Скамейки, кресла и лаунж из тика, алюминия и HPL-камня. Выдерживают российскую погоду — от +40 до −30."
                    multiline
                  />
                </motion.p>
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.25 }}
                  className="mt-7 flex flex-wrap items-center gap-3"
                >
                  <Link
                    to="/catalog"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-medium text-black shadow-2xl transition-transform active:scale-[0.97]"
                  >
                    Смотреть каталог
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/life"
                    className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 py-3.5 text-[14px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/15"
                  >
                    <Sparkles className="h-4 w-4" />
                    Жизнь магазина
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker strip */}
        <div className="mt-6 border-y border-hairline bg-surface">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3 text-[12px] text-muted-foreground sm:text-[13px]">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--brand)" }} />
              Отгрузка 1–2 дня
            </span>
            <span className="hidden sm:inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent-warm)" }} />
              Гарантия до 10 лет
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--accent-cool)" }} />
              Только ПВЗ Ozon по всей России
            </span>
            <span className="hidden md:inline-flex items-center gap-2">Оплата: СБП · SberPay · T-Pay · карта</span>
          </div>
        </div>
      </section>

      {/* Collections mosaic */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="mb-8 flex items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Категории
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              Что вам подходит
            </h2>
          </motion.div>
          <Link
            to="/catalog"
            className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Весь каталог →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <CollectionTile
            className="md:row-span-2"
            image={hero}
            title="Скамейки"
            cat="benches"
            tall
          />
          <CollectionTile
            image={sofaImg}
            title="Диваны и лаунж"
            cat="sofas"
          />
          <CollectionTile
            image={tableImg}
            title="Столы"
            cat="tables"
          />
          <CollectionTile
            image={loungerImg}
            title="Шезлонги"
            cat="loungers"
            wide
          />
        </div>
      </section>

      {/* Editorial split — brand story */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-10 rounded-[28px] border border-hairline bg-surface p-6 sm:p-10 md:grid-cols-2 md:gap-14 md:p-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              О бренде
            </motion.div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
              Не мебель.<br />Долгий разговор с&nbsp;садом.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-[16px]">
              Мы делаем предметы, которые становятся частью пейзажа. Каждая скамейка
              собирается вручную из тика класса «А» и порошково окрашенной стали —
              материалов, которые с годами становятся только красивее.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 self-center text-center sm:gap-6">
            {[
              { n: "10", u: "лет гарантии" },
              { n: "320+", u: "садов в РФ" },
              { n: "48ч", u: "отгрузка" },
            ].map((s, i) => (
              <motion.div
                key={s.u}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl border border-hairline bg-background p-4 sm:p-6"
              >
                <div className="text-3xl font-semibold tracking-tight sm:text-5xl">{s.n}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground sm:text-[12px]">
                  {s.u}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:pb-24">
        <div className="mb-10 flex items-end justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold tracking-tight md:text-5xl"
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

      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:grid-cols-2 md:grid-cols-3 md:py-20">
          {[
            {
              icon: Truck,
              title: "Доставка по РФ",
              body: "Только ПВЗ Ozon — 45 000 точек по России",
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
              body: "СБП · SberPay · T-Pay · банковская карта",
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

function CollectionTile({
  image,
  title,
  cat,
  tall,
  wide,
  className,
}: {
  image: string;
  title: string;
  cat: "benches" | "sides" | "chairs" | "tables" | "sofas" | "loungers" | "accessories";
  tall?: boolean;
  wide?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -3 }}
      className={className}
    >
      <Link
        to="/catalog"
        search={{ cat }}
        className={`group relative block h-full overflow-hidden rounded-3xl bg-surface ${
          tall ? "min-h-[420px] md:min-h-full" : wide ? "min-h-[220px] md:col-span-2" : "min-h-[220px]"
        }`}
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.78) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 100%, rgba(0,0,0,0.35), transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-6">
          <div>
            <div className="text-xl font-semibold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-2xl md:text-3xl">
              {title}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
