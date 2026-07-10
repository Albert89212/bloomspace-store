import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { EditableText } from "@/components/Editable";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О бренде — SADOVA" },
      { name: "description", content: "Как и почему мы создаём премиальную садовую мебель." },
      { property: "og:title", content: "О бренде — SADOVA" },
      { property: "og:description", content: "Как и почему мы создаём премиальную садовую мебель." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <motion.h1
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-semibold tracking-tight md:text-6xl"
      >
        <EditableText
          id="about.hero.title"
          defaultValue="Мебель, спроектированная для жизни на воздухе."
        />
      </motion.h1>
      <motion.p
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-8 text-[17px] leading-relaxed text-muted-foreground"
      >
        <EditableText
          id="about.hero.body"
          multiline
          defaultValue="SADOVA — российский бренд премиальной садовой мебели. Мы работаем с материалами, которые выдерживают всё: тик, анодированный алюминий, порошковая сталь, композитный камень. Каждая деталь проходит контроль вручную."
        />
      </motion.p>
    </div>
  );
}