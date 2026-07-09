import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { useLifePosts } from "@/lib/life-posts-store";

export const Route = createFileRoute("/life")({
  head: () => ({
    meta: [
      { title: "Жизнь магазина — SADOVA" },
      {
        name: "description",
        content:
          "Как живёт SADOVA: производство, шоурум, монтажи у клиентов и закулисье бренда садовой мебели.",
      },
      { property: "og:title", content: "Жизнь магазина — SADOVA" },
      {
        property: "og:description",
        content: "Видеодневник бренда садовой мебели SADOVA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LifePage,
});

type Post = {
  id: string;
  author: string;
  role: string;
  date: string;
  caption: string;
  poster: string;
  video?: string;
  likes: number;
  comments: number;
};

const posts: Post[] = [
  {
    id: "1",
    author: "SADOVA Production",
    role: "Производство · Тула",
    date: "3 дня назад",
    caption:
      "Собираем новую партию Aero Lounge. Каркас — авиационный алюминий, каждая сварка проходит контроль.",
    poster:
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=80",
    video:
      "https://cdn.coverr.co/videos/coverr-a-carpenter-at-work-4517/1080p.mp4",
    likes: 342,
    comments: 28,
  },
  {
    id: "2",
    author: "Шоурум Москва",
    role: "Флагман · Патриаршие",
    date: "неделю назад",
    caption: "Утро в шоуруме. Новая коллекция уже ждёт вас — заходите на кофе.",
    poster:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
    video:
      "https://cdn.coverr.co/videos/coverr-a-designer-in-his-studio-4433/1080p.mp4",
    likes: 512,
    comments: 47,
  },
  {
    id: "3",
    author: "Монтаж у клиента",
    role: "Подмосковье",
    date: "2 недели назад",
    caption:
      "Терраса 84 м² за один день. Спасибо семье Ковалёвых за доверие ❤️",
    poster:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    video:
      "https://cdn.coverr.co/videos/coverr-a-modern-house-with-a-pool-4820/1080p.mp4",
    likes: 891,
    comments: 63,
  },
  {
    id: "4",
    author: "Дизайн-студия",
    role: "Закулисье",
    date: "месяц назад",
    caption: "Первые эскизы коллекции 2026. Скоро покажем прототипы.",
    poster:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    likes: 267,
    comments: 19,
  },
];

function LifePage() {
  const userPosts = useLifePosts((s) => s.items);
  const combined: Post[] = [
    ...userPosts.map((p) => ({
      id: p.id,
      author: p.author,
      role: p.role,
      date: new Date(p.createdAt).toLocaleDateString("ru-RU"),
      caption: p.caption,
      poster: p.poster,
      video: p.video,
      likes: 0,
      comments: 0,
    })),
    ...posts,
  ];
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <RuFlag /> Сделано в России
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          Жизнь SADOVA
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Производство, шоурум, монтажи у клиентов и закулисье бренда. Всё,
          что не поместилось в каталог.
        </p>
      </motion.div>

      <div className="mt-16 grid gap-10 md:grid-cols-2">
        {combined.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-3xl bg-surface"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
        {post.video ? (
          <>
            <video
              ref={videoRef}
              src={post.video}
              poster={post.poster}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              onClick={toggle}
            />
            {!playing && (
              <button
                onClick={toggle}
                aria-label="Воспроизвести"
                className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/20"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl">
                  <Play className="ml-0.5 h-6 w-6 text-black" />
                </span>
              </button>
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label={muted ? "Включить звук" : "Выключить звук"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </>
        ) : (
          <img
            src={post.poster}
            alt={post.caption}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-medium">{post.author}</div>
            <div className="text-[12px] text-muted-foreground">
              {post.role} · {post.date}
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button
              onClick={() => setLiked((l) => !l)}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
              aria-label="Нравится"
            >
              <Heart
                className={`h-4 w-4 transition-all ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-[12px] tabular-nums">
                {post.likes + (liked ? 1 : 0)}
              </span>
            </button>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[12px] tabular-nums">{post.comments}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed">{post.caption}</p>
      </div>
    </motion.article>
  );
}

function RuFlag() {
  return (
    <span
      aria-label="Флаг России"
      className="inline-flex h-3.5 w-5 overflow-hidden rounded-sm border border-hairline"
    >
      <span className="flex h-full w-full flex-col">
        <span className="h-1/3 bg-white" />
        <span className="h-1/3 bg-[#0039A6]" />
        <span className="h-1/3 bg-[#D52B1E]" />
      </span>
    </span>
  );
}