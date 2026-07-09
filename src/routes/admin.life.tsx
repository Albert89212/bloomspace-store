import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useLifePosts } from "@/lib/life-posts-store";

export const Route = createFileRoute("/admin/life")({
  component: AdminLife,
});

function AdminLife() {
  const posts = useLifePosts((s) => s.items);
  const add = useLifePosts((s) => s.add);
  const remove = useLifePosts((s) => s.remove);

  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [caption, setCaption] = useState("");
  const [poster, setPoster] = useState("");
  const [video, setVideo] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!author || !caption || !poster) return;
    add({ author, role, caption, poster, video: video || undefined });
    setAuthor("");
    setRole("");
    setCaption("");
    setPoster("");
    setVideo("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Новая публикация</h2>
        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-surface p-5">
          <F label="Автор" value={author} onChange={setAuthor} />
          <F label="Роль / место" value={role} onChange={setRole} />
          <F label="URL постера" value={poster} onChange={setPoster} />
          <F label="URL видео (опционально)" value={video} onChange={setVideo} />
          <label className="block">
            <span className="mb-1 block text-[12px] text-muted-foreground">Подпись</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-hairline bg-background p-3 text-[13px]"
            />
          </label>
          <button className="h-10 rounded-full bg-foreground px-5 text-[13px] font-medium text-background">
            Опубликовать
          </button>
        </form>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-semibold">Публикации</h2>
        {posts.length === 0 ? (
          <div className="rounded-2xl bg-surface p-8 text-center text-[13px] text-muted-foreground">
            Пока нет пользовательских публикаций.
          </div>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li key={p.id} className="flex gap-4 rounded-2xl bg-surface p-4">
                <img
                  src={p.poster}
                  alt=""
                  className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{p.author}</div>
                  <div className="text-[11px] text-muted-foreground">{p.role}</div>
                  <p className="mt-1 text-[12px]">{p.caption}</p>
                </div>
                <button
                  onClick={() => remove(p.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function F({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-hairline bg-background px-3 text-[13px]"
      />
    </label>
  );
}