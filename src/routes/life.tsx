import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Play, Send, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { useLifePosts, type LifePost } from "@/lib/life-posts-store";
import { useCurrentUser } from "@/lib/auth-store";

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

function LifePage() {
  const posts = useLifePosts((s) => s.items);
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
          Производство, шоурум, монтажи у клиентов и закулисье бренда. Лайки и
          комментарии — только от реальных зарегистрированных пользователей,
          без накруток.
        </p>
      </motion.div>

      {posts.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-hairline bg-surface p-12 text-center text-[13px] text-muted-foreground">
          Публикаций пока нет. Владелец скоро добавит первую в админ-панели.
        </div>
      ) : (
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, index }: { post: LifePost; index: number }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const user = useCurrentUser();
  const toggleLike = useLifePosts((s) => s.toggleLike);
  const addComment = useLifePosts((s) => s.addComment);
  const [showComments, setShowComments] = useState(false);
  const [text, setText] = useState("");

  const liked = !!user && post.likes.includes(user.id);

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

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    addComment(post.id, { userId: user.id, authorName: user.name, text: text.trim().slice(0, 500) });
    setText("");
  }

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
              {post.role} · {new Date(post.createdAt).toLocaleDateString("ru-RU")}
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <button
              onClick={() => user && toggleLike(post.id, user.id)}
              disabled={!user}
              title={user ? "Нравится" : "Войдите, чтобы поставить лайк"}
              className="flex items-center gap-1 transition-colors hover:text-foreground disabled:opacity-50"
            >
              <Heart
                className={`h-4 w-4 transition-all ${liked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span className="text-[12px] tabular-nums">{post.likes.length}</span>
            </button>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-[12px] tabular-nums">{post.comments.length}</span>
            </button>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed">{post.caption}</p>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-hairline pt-4">
            {post.comments.length === 0 && (
              <p className="text-[12px] text-muted-foreground">Пока нет комментариев.</p>
            )}
            {post.comments.map((c) => (
              <div key={c.id} className="text-[13px]">
                <span className="font-medium">{c.authorName}</span>{" "}
                <span className="text-muted-foreground">{c.text}</span>
              </div>
            ))}
            {user ? (
              <form onSubmit={submitComment} className="flex gap-2 pt-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ваш комментарий…"
                  className="h-9 flex-1 rounded-full border border-hairline bg-background px-3 text-[13px]"
                />
                <button className="rounded-full bg-foreground p-2 text-background">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                <Link to="/auth" className="underline">Войдите</Link>, чтобы комментировать.
              </p>
            )}
          </div>
        )}
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