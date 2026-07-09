import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Star } from "lucide-react";
import { useReviews } from "@/lib/reviews-store";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const reviews = useReviews((s) => s.items);
  const approve = useReviews((s) => s.approve);
  const remove = useReviews((s) => s.remove);

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Модерация отзывов</h2>
      {reviews.length === 0 ? (
        <div className="rounded-2xl bg-surface p-10 text-center text-[13px] text-muted-foreground">
          Отзывов ещё нет.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-medium">{r.author}</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < r.rating ? "fill-foreground" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        r.approved
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {r.approved ? "Опубликован" : "На модерации"}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    /{r.productSlug} · {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                  </div>
                  <p className="mt-2 text-[13px]">{r.text}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(r.id, !r.approved)}
                    className="rounded-full bg-foreground p-2 text-background"
                    title={r.approved ? "Снять с публикации" : "Опубликовать"}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-full border border-hairline p-2 hover:bg-secondary"
                    title="Удалить"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}