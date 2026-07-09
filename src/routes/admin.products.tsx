import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { formatPrice, categories, type Category, type Product } from "@/lib/products";
import { useProducts } from "@/lib/products-store";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  category: Category;
  image: string;
};

const emptyDraft: Draft = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: "",
  category: "chairs",
  image: "",
};

function AdminProducts() {
  const items = useProducts((s) => s.items);
  const create = useProducts((s) => s.create);
  const update = useProducts((s) => s.update);
  const remove = useProducts((s) => s.remove);

  const [editing, setEditing] = useState<Draft | null>(null);

  function save() {
    if (!editing) return;
    const payload = {
      slug: editing.slug,
      name: editing.name.trim(),
      tagline: editing.tagline.trim(),
      description: editing.description.trim(),
      price: Number(editing.price) || 0,
      category: editing.category,
      image: editing.image.trim() || "https://placehold.co/1024x1024/eee/999?text=Photo",
      specs: [],
    };
    if (!payload.name || !payload.price) return;
    if (editing.id) update(editing.id, payload);
    else create(payload);
    setEditing(null);
  }

  function startEdit(p: Product) {
    setEditing({
      id: p.id,
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      price: String(p.price),
      category: p.category,
      image: p.image,
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Объявления · {items.length}</h2>
        <button
          onClick={() => setEditing({ ...emptyDraft })}
          className="rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background"
        >
          + Новое объявление
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-hairline bg-surface p-12 text-center text-[13px] text-muted-foreground">
          Пока нет объявлений. Нажмите «Новое объявление» — оно появится в каталоге.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hairline">
          <table className="w-full text-[13px]">
            <thead className="bg-surface text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4">Товар</th>
                <th className="p-4">Категория</th>
                <th className="p-4">Цена</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {categories.find((c) => c.id === p.category)?.label ?? p.category}
                  </td>
                  <td className="p-4 tabular-nums">{formatPrice(p.price)}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-[12px] hover:bg-secondary"
                      >
                        <Pencil className="h-3 w-3" /> Изменить
                      </button>
                      <button
                        onClick={() => { if (confirm(`Удалить «${p.name}»?`)) remove(p.id); }}
                        className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1 text-[12px] text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" /> Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-background p-6 shadow-xl">
            <button
              onClick={() => setEditing(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-secondary"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold">
              {editing.id ? "Редактировать объявление" : "Новое объявление"}
            </h3>
            <div className="mt-4 grid gap-3">
              <F label="Название" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <F label="Slug (URL, необязательно)" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <F label="Подзаголовок" value={editing.tagline} onChange={(v) => setEditing({ ...editing, tagline: v })} />
              <label className="block">
                <span className="mb-1 block text-[12px] text-muted-foreground">Описание</span>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-hairline bg-background p-3 text-[14px] outline-none focus:border-foreground"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <F label="Цена, ₽" value={editing.price} type="number" onChange={(v) => setEditing({ ...editing, price: v })} />
                <label className="block">
                  <span className="mb-1 block text-[12px] text-muted-foreground">Категория</span>
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value as Category })}
                    className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px] outline-none focus:border-foreground"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <F label="URL изображения" value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} placeholder="https://..." />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="rounded-full border border-hairline px-5 py-2 text-[13px]"
              >
                Отмена
              </button>
              <button
                onClick={save}
                className="rounded-full bg-foreground px-5 py-2 text-[13px] font-medium text-background"
              >
                {editing.id ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-muted-foreground">{label}</span>
      <input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-hairline bg-background px-3 text-[14px] outline-none focus:border-foreground"
      />
    </label>
  );
}
