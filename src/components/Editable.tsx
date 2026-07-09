import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, Upload, RotateCcw } from "lucide-react";
import { useCms } from "@/lib/cms-store";
import { useCurrentUser } from "@/lib/auth-store";

function useCanEdit() {
  const user = useCurrentUser();
  const editMode = useCms((s) => s.editMode);
  return editMode && (user?.role === "owner" || user?.role === "admin");
}

/** Инлайн-текст: заголовки, абзацы, кнопки. */
export function EditableText({
  id,
  defaultValue,
  as: Tag = "span",
  multiline = false,
  className,
  style,
}: {
  id: string;
  defaultValue: string;
  as?: keyof React.JSX.IntrinsicElements;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const value = useCms((s) => s.values[id] ?? defaultValue);
  const set = useCms((s) => s.set);
  const reset = useCms((s) => s.reset);
  const canEdit = useCanEdit();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value);
      requestAnimationFrame(() => ref.current?.focus());
    }
  }, [editing, value]);

  if (!canEdit) {
    return <Tag className={className} style={style}>{value}</Tag>;
  }

  if (editing) {
    const Field = multiline ? "textarea" : "input";
    return (
      <span className="relative inline-block w-full align-top">
        <Field
          // @ts-expect-error dynamic tag
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={multiline ? 3 : undefined}
          className={`w-full rounded-lg border-2 border-dashed border-[color:var(--brand)] bg-background/95 p-2 text-foreground outline-none ${className ?? ""}`}
          style={style}
        />
        <span className="mt-1 flex gap-1">
          <button
            onClick={() => { set(id, draft); setEditing(false); }}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-foreground px-2 text-[11px] text-background"
          >
            <Check className="h-3 w-3" /> Сохранить
          </button>
          <button
            onClick={() => setEditing(false)}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-hairline bg-background px-2 text-[11px]"
          >
            <X className="h-3 w-3" /> Отмена
          </button>
          <button
            onClick={() => { reset(id); setEditing(false); }}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-hairline bg-background px-2 text-[11px]"
            title="Сбросить к исходному"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </span>
      </span>
    );
  }

  return (
    <Tag
      className={`${className ?? ""} relative cursor-text rounded outline-1 outline-dashed outline-[color:var(--brand)]/60 outline-offset-4 hover:outline-2`}
      style={style}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditing(true); }}
      title="Клик — редактировать"
    >
      {value}
    </Tag>
  );
}

/** Инлайн-медиа: изображение или видео. Загружает файл как data URL. */
export function EditableMedia({
  id,
  defaultSrc,
  kind = "image",
  alt = "",
  className,
  style,
  imgProps,
  videoProps,
}: {
  id: string;
  defaultSrc: string;
  kind?: "image" | "video";
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  videoProps?: React.VideoHTMLAttributes<HTMLVideoElement>;
}) {
  const src = useCms((s) => s.values[id] ?? defaultSrc);
  const set = useCms((s) => s.set);
  const reset = useCms((s) => s.reset);
  const canEdit = useCanEdit();
  const inputRef = useRef<HTMLInputElement>(null);

  const media =
    kind === "video" ? (
      <video src={src} className={className} style={style} playsInline muted loop autoPlay {...videoProps} />
    ) : (
      <img src={src} alt={alt} className={className} style={style} {...imgProps} />
    );

  if (!canEdit) return media;

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => set(id, String(r.result));
    r.readAsDataURL(f);
  };

  return (
    <span className="relative block h-full w-full">
      {media}
      <span className="pointer-events-none absolute inset-0 outline-2 outline-dashed outline-[color:var(--brand)]/70 outline-offset-[-6px] rounded-[inherit]" />
      <span className="absolute right-3 top-3 z-10 flex gap-1.5">
        <button
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-foreground px-3 text-[11px] font-medium text-background shadow-lg"
        >
          <Upload className="h-3 w-3" /> Заменить
        </button>
        <button
          onClick={() => {
            const url = window.prompt("URL медиа", src);
            if (url) set(id, url);
          }}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-background/90 px-3 text-[11px] font-medium text-foreground shadow-lg backdrop-blur"
        >
          <Pencil className="h-3 w-3" /> URL
        </button>
        <button
          onClick={() => reset(id)}
          className="inline-flex h-8 items-center gap-1 rounded-full bg-background/90 px-2 text-[11px] font-medium text-foreground shadow-lg backdrop-blur"
          title="Сброс"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "video" ? "video/*" : "image/*"}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </span>
  );
}

/** Плавающая кнопка «Режим правки» для владельца. */
export function OwnerEditToggle() {
  const user = useCurrentUser();
  const editMode = useCms((s) => s.editMode);
  const setEditMode = useCms((s) => s.setEditMode);
  if (!user || (user.role !== "owner" && user.role !== "admin")) return null;
  return (
    <button
      onClick={() => setEditMode(!editMode)}
      className={`fixed bottom-5 left-5 z-[60] inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-medium shadow-2xl transition-all ${
        editMode
          ? "bg-[color:var(--brand)] text-white"
          : "bg-foreground text-background hover:scale-[1.03]"
      }`}
      title="Инлайн-редактирование контента"
    >
      <Pencil className="h-3.5 w-3.5" />
      {editMode ? "Правка: ВКЛ" : "Режим правки"}
    </button>
  );
}