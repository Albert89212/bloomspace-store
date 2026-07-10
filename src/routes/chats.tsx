import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Bot,
  Headset,
  Heart,
  MessageCircle,
  Send,
  RotateCcw,
  Trash2,
  Pin,
  ImagePlus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";
import { useCurrentUser } from "@/lib/auth-store";
import { useAdmin } from "@/lib/admin-store";
import { useNews } from "@/lib/news-store";
import { useAiChat } from "@/lib/ai-chat-store";
import { useSupportChat } from "@/lib/support-chat-store";

type Tab = "news" | "bot" | "seller";

export const Route = createFileRoute("/chats")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ tab: z.enum(["news", "bot", "seller"]).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Чаты SADOVA — новости, ассистент и поддержка" },
      {
        name: "description",
        content:
          "Новости магазина, AI-ассистент и чат с продавцом SADOVA — в одном месте.",
      },
      { property: "og:title", content: "Чаты SADOVA" },
      { property: "og:description", content: "Новости, ассистент и поддержка." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ChatsHub,
});

function ChatsHub() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<Tab>(search.tab ?? "news");
  useEffect(() => {
    if (search.tab && search.tab !== tab) setTab(search.tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tab]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "news", label: "Новости", icon: <Newspaper className="h-4 w-4" />, color: "var(--accent-warm)" },
    { id: "bot", label: "Ассистент", icon: <Bot className="h-4 w-4" />, color: "var(--brand)" },
    { id: "seller", label: "Продавец", icon: <Headset className="h-4 w-4" />, color: "var(--accent-cool)" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
      <div>
        <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Общение
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">Чаты</h1>
        <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
          Новости магазина, AI-ассистент по подбору и живой чат с продавцом — на одной странице.
        </p>
      </div>

      <div className="mt-8 inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-full border border-hairline p-1 md:w-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-colors ${
              tab === t.id ? "text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="chats-tab"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <span style={{ color: tab === t.id ? "inherit" : t.color }}>{t.icon}</span>
              {t.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "news" && <NewsPane />}
            {tab === "bot" && <BotPane />}
            {tab === "seller" && <SellerPane />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ────────────────── NEWS ────────────────── */
function NewsPane() {
  const posts = useNews((s) => s.items);
  const sorted = useMemo(
    () => [...posts].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.createdAt - a.createdAt),
    [posts],
  );
  return (
    <div className="space-y-6">
      {sorted.length === 0 ? (
        <div className="rounded-3xl bg-surface p-10 text-center">
          <Newspaper className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-[14px] text-muted-foreground">
            Пока нет новостей. Скоро здесь появятся анонсы поступлений и акций.
          </p>
        </div>
      ) : (
        sorted.map((p) => <NewsCard key={p.id} postId={p.id} />)
      )}
    </div>
  );
}

function NewsCard({ postId }: { postId: string }) {
  const post = useNews((s) => s.items.find((x) => x.id === postId));
  const toggleLike = useNews((s) => s.toggleLike);
  const addComment = useNews((s) => s.addComment);
  const removeComment = useNews((s) => s.removeComment);
  const removePost = useNews((s) => s.remove);
  const pin = useNews((s) => s.pin);
  const user = useCurrentUser();
  const role = useAdmin((s) => s.role);
  const canModerate = role === "owner" || role === "admin" || role === "moderator";
  const [text, setText] = useState("");

  if (!post) return null;
  const liked = user ? post.likes.includes(user.id) : false;

  return (
    <article className="rounded-3xl border border-hairline bg-background p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">{post.authorName}</span>
            <span>·</span>
            <time>{new Date(post.createdAt).toLocaleString("ru-RU")}</time>
            {post.pinned && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand)" }}
              >
                <Pin className="h-3 w-3" /> Закреплено
              </span>
            )}
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight md:text-xl">{post.title}</h3>
        </div>
        {canModerate && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => pin(post.id, !post.pinned)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label={post.pinned ? "Открепить" : "Закрепить"}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={() => removePost(post.id)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {post.image && (
        <div className="mt-4 overflow-hidden rounded-2xl bg-surface">
          <img src={post.image} alt="" className="w-full object-cover" />
        </div>
      )}

      <div className="prose prose-sm mt-3 max-w-none text-[14px] leading-relaxed text-foreground/90">
        <ReactMarkdown>{post.body}</ReactMarkdown>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-hairline pt-4 text-[13px]">
        <button
          onClick={() => user && toggleLike(post.id, user.id)}
          disabled={!user}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-pressed={liked}
        >
          <Heart
            className="h-4 w-4"
            style={{
              color: liked ? "var(--brand)" : "currentColor",
              fill: liked ? "var(--brand)" : "transparent",
            }}
          />
          {post.likes.length}
        </button>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          {post.comments.length}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {post.comments.map((c) => (
          <li key={c.id} className="rounded-2xl bg-surface p-3 text-[13px]">
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{c.userName}</span>
              <div className="flex items-center gap-2">
                <time>{new Date(c.createdAt).toLocaleString("ru-RU")}</time>
                {(canModerate || user?.id === c.userId) && (
                  <button
                    onClick={() => removeComment(post.id, c.id)}
                    className="rounded-full p-1 hover:bg-background"
                    aria-label="Удалить комментарий"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1">{c.text}</p>
          </li>
        ))}
      </ul>

      {user ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            addComment(post.id, {
              userId: user.id,
              userName: user.name,
              text: text.trim(),
            });
            setText("");
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder="Оставить комментарий"
            className="h-10 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-[12px] font-medium text-background"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className="mt-3 text-[12px] text-muted-foreground">
          <Link to="/auth" className="underline">
            Войдите
          </Link>{" "}
          чтобы лайкать и комментировать.
        </p>
      )}
    </article>
  );
}

/* ────────────────── BOT ────────────────── */
function BotPane() {
  const messages = useAiChat((s) => s.messages);
  const add = useAiChat((s) => s.add);
  const appendToLast = useAiChat((s) => s.appendToLast);
  const setLastError = useAiChat((s) => s.setLastError);
  const reset = useAiChat((s) => s.reset);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || status !== "idle") return;
    add({ role: "user", content: text });
    add({ role: "assistant", content: "" });
    setInput("");
    setStatus("streaming");

    try {
      const history = [...useAiChat.getState().messages].slice(0, -1);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text();
        setLastError(err || "Ошибка ассистента");
        setStatus("idle");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        appendToLast(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setLastError((e as Error).message || "Ошибка сети");
    } finally {
      setStatus("idle");
    }
  }

  const suggestions = [
    "Подскажи скамейку для дачи 6 соток",
    "Как оформить возврат?",
    "Сколько стоит доставка в Санкт-Петербург?",
  ];

  return (
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-3xl border border-hairline bg-background">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 text-[13px]">
        <div className="flex items-center gap-2 font-medium">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
          >
            <Bot className="h-4 w-4" />
          </span>
          SADOVA Ассистент
          <span className="text-[11px] text-muted-foreground">на базе Lovable AI</span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Очистить
        </button>
      </div>

      <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md pt-6 text-center">
            <div
              className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
            >
              <Bot className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[14px] text-muted-foreground">
              Привет! Я помогу подобрать мебель, отвечу про доставку, оплату и гарантию.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.role === "user" ? (
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px]"
                style={{
                  background: "var(--foreground)",
                  color: "var(--background)",
                }}
              >
                {m.content}
              </div>
            ) : (
              <div className="flex max-w-[85%] gap-2">
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                >
                  <Bot className="h-4 w-4" />
                </span>
                <div className="prose prose-sm max-w-none text-[14px] leading-relaxed">
                  {m.content ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      <span
                        className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-hairline p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Спросите ассистента…"
          className="min-h-11 flex-1 resize-none rounded-2xl border border-hairline bg-surface px-4 py-3 text-[14px] outline-none focus:border-foreground"
        />
        <button
          type="submit"
          disabled={status !== "idle" || !input.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-background disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

/* ────────────────── SELLER (support) ────────────────── */
function SellerPane() {
  const messages = useSupportChat((s) => s.messages);
  const send = useSupportChat((s) => s.send);
  const reset = useSupportChat((s) => s.reset);
  const user = useCurrentUser();
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    send(text, user?.name);
    setText("");
  }

  return (
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-3xl border border-hairline bg-background">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 text-[13px]">
        <div className="flex items-center gap-2 font-medium">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "color-mix(in oklab, var(--accent-cool) 20%, transparent)", color: "var(--accent-cool)" }}
          >
            <Headset className="h-4 w-4" />
          </span>
          Чат с продавцом
          <span className="text-[11px] text-muted-foreground">отвечаем в течение 10 минут</span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Очистить
        </button>
      </div>
      <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const isUser = m.author === "user";
          return (
            <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px]"
                style={
                  isUser
                    ? { background: "var(--foreground)", color: "var(--background)" }
                    : { background: "var(--surface)", color: "var(--foreground)" }
                }
              >
                {!isUser && (
                  <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                    {m.authorName}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-hairline p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение продавцу…"
          className="h-11 flex-1 rounded-full border border-hairline bg-surface px-4 text-[14px] outline-none focus:border-foreground"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-background disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

// Не используется, но оставим импорты компактно
const _reserved = { ImagePlus, X };
void _reserved;