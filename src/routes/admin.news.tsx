import { createFileRoute } from "@tanstack/react-router";
import { Pin, Trash2, Send } from "lucide-react";
import { useState } from "react";
import { useNews } from "@/lib/news-store";
import { useAdmin } from "@/lib/admin-store";
import { useCurrentUser } from "@/lib/auth-store";
import { friendlyDbError } from "@/lib/db-error";

export const Route = createFileRoute("/admin/news")({
  head: () => ({
    meta: [
      { title: "Новости — Админка SADOVA" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminNews,
});

function AdminNews() {
  const posts = useNews((s) => s.items);
  const create = useNews((s) => s.create);
  const remove = useNews((s) => s.remove);
  const pin = useNews((s) => s.pin);
  const role = useAdmin((s) => s.role);
  const user = useCurrentUser();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!(role === "owner" || role === "admin" || role === "moderator")) {
    return (
      <p className="text-[14px] text-muted-foreground">Нет прав на публикацию новостей.</p>
    );
  }

  function onFile(f: File | null) {
    if (!f) return setImage(undefined);
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      await create({
        authorId: user?.id ?? "staff",
        authorName: user?.name ?? "SADOVA",
        title: title.trim(),
        body: body.trim(),
        image,
      });
      setTitle("");
      setBody("");
      setImage(undefined);
      setStatus("Сохранено в БД и опубликовано");
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus(friendlyDbError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={submit}
        className="h-fit space-y-3 rounded-3xl border border-hairline bg-background p-5"
      >
        <div className="text-[14px] font-medium">Новая новость</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок"
          className="h-11 w-full rounded-2xl border border-hairline bg-surface px-4 text-[14px] outline-none focus:border-foreground"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Текст (поддерживается markdown)"
          className="w-full resize-none rounded-2xl border border-hairline bg-surface p-4 text-[14px] outline-none focus:border-foreground"
          required
        />
        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-hairline p-3 text-[12px] text-muted-foreground hover:border-foreground">
          <span>{image ? "Заменить изображение" : "Добавить изображение"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {image && (
          <div className="overflow-hidden rounded-2xl">
            <img src={image} alt="" className="w-full object-cover" />
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[13px] font-medium text-background"
        >
          <Send className="h-4 w-4" /> {saving ? "Сохраняю..." : "Опубликовать"}
        </button>
        {status && <div className="text-center text-[12px] text-muted-foreground">{status}</div>}
      </form>

      <div className="space-y-3">
        <div className="text-[14px] font-medium">Опубликовано · {posts.length}</div>
        {posts.length === 0 && (
          <p className="rounded-2xl bg-surface p-6 text-[13px] text-muted-foreground">
            Пока новостей нет.
          </p>
        )}
        {posts.map((p) => (
          <div
            key={p.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-hairline bg-background p-4"
          >
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground">
                {new Date(p.createdAt).toLocaleString("ru-RU")} · {p.authorName} ·{" "}
                ❤ {p.likes.length} · 💬 {p.comments.length}
              </div>
              <div className="mt-1 truncate text-[14px] font-medium">{p.title}</div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => pin(p.id, !p.pinned)}
                className={`rounded-full p-2 hover:bg-secondary ${p.pinned ? "text-foreground" : "text-muted-foreground"}`}
                aria-label={p.pinned ? "Открепить" : "Закрепить"}
              >
                <Pin className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(p.id)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                aria-label="Удалить"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}