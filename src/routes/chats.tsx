import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Headset,
  Users,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  Pin,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { z } from "zod";
import { useCurrentUser } from "@/lib/auth-store";
import { useAdmin, roleLabel } from "@/lib/admin-store";
import { useNews } from "@/lib/news-store";
import { getGuestId, useSupportChat } from "@/lib/support-chat-store";
import { useStaffChat } from "@/lib/staff-chat-store";

type Tab = "news" | "support" | "staff";

export const Route = createFileRoute("/chats")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ tab: z.enum(["news", "support", "staff"]).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Чаты SADOVA — новости и техподдержка" },
      {
        name: "description",
        content:
          "Новости магазина, личный чат с техподдержкой SADOVA и внутренний чат сотрудников.",
      },
      { property: "og:title", content: "Чаты SADOVA" },
      { property: "og:description", content: "Новости и техподдержка магазина SADOVA." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: ChatsHub,
});

function ChatsHub() {
  const search = Route.useSearch();
  const isStaff = useAdmin((s) => s.isAdmin);
  const [tab, setTab] = useState<Tab>(search.tab ?? "news");
  useEffect(() => {
    if (search.tab && search.tab !== tab) setTab(search.tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.tab]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string; visible: boolean }[] = [
    { id: "news", label: "Новости", icon: <Newspaper className="h-4 w-4" />, color: "var(--accent-warm)", visible: true },
    { id: "support", label: "Техподдержка", icon: <Headset className="h-4 w-4" />, color: "var(--accent-cool)", visible: true },
    { id: "staff", label: "Сотрудники", icon: <Users className="h-4 w-4" />, color: "var(--brand)", visible: isStaff },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-16">
      <div>
        <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Общение
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">Чаты</h1>
        <p className="mt-2 max-w-xl text-[14px] text-muted-foreground">
          Новости магазина и живой чат с техподдержкой. Каждая переписка сохраняется у вас и в защищённой БД.
        </p>
      </div>

      <div className="mt-8 inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-full border border-hairline p-1 md:w-auto">
        {tabs.filter((t) => t.visible).map((t) => (
          <button
            type="button"
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
            {tab === "support" && <SupportPane />}
            {tab === "staff" && isStaff && <StaffPane />}
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
            <button type="button" onClick={() => pin(post.id, !post.pinned)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label={post.pinned ? "Открепить" : "Закрепить"}>
              <Pin className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => removePost(post.id)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary" aria-label="Удалить">
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
          type="button"
          onClick={() => user && toggleLike(post.id, user.id)}
          disabled={!user}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-pressed={liked}
        >
          <Heart className="h-4 w-4" style={{ color: liked ? "var(--brand)" : "currentColor", fill: liked ? "var(--brand)" : "transparent" }} />
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
                  <button type="button" onClick={() => removeComment(post.id, c.id)} className="rounded-full p-1 hover:bg-background" aria-label="Удалить комментарий">
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
            addComment(post.id, { userId: user.id, userName: user.name, text: text.trim() });
            setText("");
          }}
          className="mt-3 flex gap-2"
        >
          <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Оставить комментарий" className="h-10 flex-1 rounded-full border border-hairline bg-background px-4 text-[13px] outline-none focus:border-foreground" />
          <button type="submit" className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-[12px] font-medium text-background">
            <Send className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <p className="mt-3 text-[12px] text-muted-foreground">
          <Link to="/auth" className="underline">Войдите</Link> чтобы лайкать и комментировать.
        </p>
      )}
    </article>
  );
}

/* ────────────────── SUPPORT (личный чат клиент↔поддержка) ────────────────── */
function SupportPane() {
  const user = useCurrentUser();
  const threads = useSupportChat((s) => s.threads);
  const ensureThread = useSupportChat((s) => s.ensureThread);
  const sendAsUser = useSupportChat((s) => s.sendAsUser);
  const markReadByUser = useSupportChat((s) => s.markReadByUser);
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const me = useMemo(
    () =>
      user
        ? { id: user.id, name: user.name, email: user.email }
        : { id: getGuestId(), name: "Гость" },
    [user],
  );
  const thread = threads.find((t) => t.userId === me.id);

  useEffect(() => {
    ensureThread(me);
    markReadByUser(me.id);
  }, [me, ensureThread, markReadByUser]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [thread?.messages.length]);

  return (
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-3xl border border-hairline bg-background">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 text-[13px]">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "color-mix(in oklab, var(--accent-cool) 20%, transparent)", color: "var(--accent-cool)" }}>
            <Headset className="h-4 w-4" />
          </span>
          Техподдержка SADOVA
          <span className="text-[11px] text-muted-foreground">только вы и оператор</span>
        </div>
      </div>
      <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {(thread?.messages ?? []).map((m) => {
          const isUser = m.author === "user";
          return (
            <div key={m.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px]"
                style={isUser ? { background: "var(--foreground)", color: "var(--background)" } : { background: "var(--surface)", color: "var(--foreground)" }}
              >
                {!isUser && <div className="mb-1 text-[11px] font-medium text-muted-foreground">{m.authorName}</div>}
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          ensureThread(me);
          sendAsUser(me.id, text);
          setText("");
        }}
        className="flex gap-2 border-t border-hairline p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение оператору…"
          className="h-11 flex-1 rounded-full border border-hairline bg-surface px-4 text-[14px] outline-none focus:border-foreground"
        />
        <button type="submit" disabled={!text.trim()} className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-background disabled:opacity-50" aria-label="Отправить">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

/* ────────────────── STAFF (внутренний чат сотрудников) ────────────────── */
function StaffPane() {
  const messages = useStaffChat((s) => s.messages);
  const send = useStaffChat((s) => s.send);
  const remove = useStaffChat((s) => s.remove);
  const role = useAdmin((s) => s.role);
  const user = useCurrentUser();
  const canModerate = role === "owner" || role === "admin";
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!role) return null;

  return (
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-3xl border border-hairline bg-background">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 text-[13px]">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--brand-soft)", color: "var(--brand)" }}>
            <Users className="h-4 w-4" />
          </span>
          Внутренний чат сотрудников
          <span className="text-[11px] text-muted-foreground">только для персонала</span>
        </div>
      </div>
      <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="py-10 text-center text-[12px] text-muted-foreground">Пока сообщений нет.</div>
        )}
        {messages.map((m) => {
          const mine = user?.id === m.authorId;
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px]" style={mine ? { background: "var(--foreground)", color: "var(--background)" } : { background: "var(--surface)" }}>
                <div className={`mb-1 text-[11px] ${mine ? "opacity-70" : "text-muted-foreground"}`}>
                  {m.authorName} · {roleLabel[m.role]} · {new Date(m.createdAt).toLocaleString("ru-RU")}
                  {(canModerate || mine) && (
                    <button type="button" onClick={() => remove(m.id)} className="ml-2 rounded-full p-0.5 hover:bg-background/20" aria-label="Удалить">
                      <Trash2 className="h-3 w-3 inline" />
                    </button>
                  )}
                </div>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || !role) return;
          send({
            authorId: user?.id ?? "staff",
            authorName: user?.name ?? roleLabel[role],
            role,
            text: text.trim(),
          });
          setText("");
        }}
        className="flex gap-2 border-t border-hairline p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение коллегам…"
          className="h-11 flex-1 rounded-full border border-hairline bg-surface px-4 text-[14px] outline-none focus:border-foreground"
        />
        <button type="submit" disabled={!text.trim()} className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-background disabled:opacity-50" aria-label="Отправить">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}