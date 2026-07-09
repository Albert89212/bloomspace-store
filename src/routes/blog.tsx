import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { blogPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Блог SADOVA — гайды по садовой мебели" },
      {
        name: "description",
        content:
          "Гайды и статьи: уход за тиком, планировка террасы, выбор материалов уличной мебели.",
      },
      { property: "og:title", content: "Блог SADOVA — гайды по садовой мебели" },
      {
        property: "og:description",
        content: "Практические советы по обустройству сада и террасы.",
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <motion.div initial={false} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">
          Журнал
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
          Гайды и идеи
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground">
          Материалы редакции об уходе за уличной мебелью, планировке пространства и работе с деревом.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((p, i) => (
          <motion.article
            key={p.slug}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group block overflow-hidden rounded-3xl"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-surface">
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {p.category} · {p.readingTime}
              </div>
              <h2 className="mt-2 text-[18px] font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">{p.excerpt}</p>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}