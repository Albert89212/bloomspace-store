import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import hero from "@/assets/hero-chair.jpg";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/products-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const products = useProducts((s) => s.items);
  const featured = products.slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-20 md:grid-cols-2 md:gap-4 md:py-28">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              Коллекция 2026
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl"
            >
              Сад,<br />продуманный до&nbsp;деталей.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-md text-[17px] leading-relaxed text-muted-foreground"
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
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[14px] font-medium text-background transition-transform active:scale-[0.97]"
              >
                Смотреть каталог
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-hairline px-6 py-3 text-[14px] font-medium transition-colors hover:bg-secondary"
              >
                О бренде
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <img
              src={hero}
              alt="Кресло Aero Lounge"
              width={1600}
              height={1200}
              className="w-full object-contain"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 flex items-end justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold tracking-tight md:text-4xl"
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-3">
          {[
            { title: "Бесплатная доставка", body: "От 30 000 ₽ по всей России" },
            { title: "Гарантия до 10 лет", body: "На все несущие конструкции" },
            { title: "Оплата в РФ", body: "Карта, СБП, ЮKassa, CloudPayments" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="text-[15px] font-medium">{f.title}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{f.body}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
