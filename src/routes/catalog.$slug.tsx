import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Star, ImagePlus, X, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPrice, type Product } from "@/lib/products";
import { useProducts } from "@/lib/products-store";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/ProductCard";
import { Product3DViewer } from "@/components/Product3DViewer";
import { useReviews } from "@/lib/reviews-store";
import { useCurrentUser } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";
import { company } from "@/lib/company";

export const Route = createFileRoute("/catalog/$slug")({
  head: () => ({
    meta: [
      { title: "Товар — SADOVA" },
      { name: "description", content: "Модель из каталога SADOVA." },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Товар не найден</h1>
      <Link to="/catalog" className="mt-4 inline-block text-[13px] underline">
        Вернуться в каталог
      </Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">
      Не удалось загрузить страницу товара.
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useProducts((s) => s.items);
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const [view, setView] = useState<"photo" | "3d">("photo");
  const allReviews = useReviews((s) => s.items);
  const addReview = useReviews((s) => s.add);
  const product = products.find((p) => p.slug === slug);
  const productReviews = useMemo(
    () => allReviews.filter((r) => product && r.productSlug === product.slug && r.approved),
    [allReviews, product],
  );
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Товар не найден</h1>
        <Link to="/catalog" className="mt-4 inline-block text-[13px] underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }
  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((n, r) => n + r.rating, 0) / productReviews.length
      : product.rating;

  const related = products.filter((p: Product) => p.id !== product.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image],
    brand: { "@type": "Brand", name: "SADOVA" },
    aggregateRating:
      productReviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: productReviews.length,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: company.legalName },
    },
  };

  function handleAdd() {
    add({
      id: product!.id,
      slug: product!.slug,
      name: product!.name,
      price: product!.price,
      image: product!.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Каталог
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-8 md:grid-cols-2 md:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-3 inline-flex rounded-full border border-hairline p-1 text-[12px]">
            {(["photo", "3d"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  view === v ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {v === "photo" ? "Фото" : "3D"}
              </button>
            ))}
          </div>
          {view === "photo" ? (
            <div className="overflow-hidden rounded-3xl bg-surface">
              <img
                src={product.image}
                alt={product.name}
                width={1024}
                height={1024}
                className="w-full object-cover"
              />
            </div>
          ) : (
            <Product3DViewer />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {product.tagline}
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-foreground" />
            <span className="text-[13px]">{avgRating.toFixed(1)}</span>
            <span className="text-[13px] text-muted-foreground">
              / 5 · {productReviews.length} отзыв
              {productReviews.length === 1 ? "" : productReviews.length < 5 ? "а" : "ов"}
            </span>
          </div>

          <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 text-3xl font-semibold tracking-tight">
            {formatPrice(product.price)}
          </div>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground text-[14px] font-medium text-background transition-colors"
          >
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-4 w-4" /> Добавлено в корзину
              </motion.span>
            ) : (
              "Добавить в корзину"
            )}
          </motion.button>

          <dl className="mt-10 divide-y divide-hairline border-y border-hairline">
            {product.specs.map((s: Product["specs"][number]) => (
              <div key={s.label} className="flex justify-between py-3 text-[13px]">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </section>

      <ReviewsSection productSlug={product.slug} productId={product.id} onSubmit={addReview} />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Похожие модели</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p: Product, i: number) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}

function ReviewsSection({
  productSlug,
  productId,
  onSubmit,
}: {
  productSlug: string;
  productId: string;
  onSubmit: (r: {
    productSlug: string;
    author: string;
    rating: number;
    text: string;
    userId: string;
    verifiedPurchase: boolean;
    photos?: string[];
  }) => void;
}) {
  const allReviews = useReviews((s) => s.items);
  const reviews = allReviews.filter((r) => r.productSlug === productSlug && r.approved);
  const user = useCurrentUser();
  const orders = useOrders((s) => s.items);
  const hasDeliveredPurchase =
    !!user &&
    orders.some(
      (o) =>
        o.userId === user.id &&
        o.status === "done" &&
        o.items.some((it) => it.id === productId),
    );
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const remain = 4 - photos.length;
    Array.from(files).slice(0, remain).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = () => setPhotos((p) => [...p, r.result as string]);
      r.readAsDataURL(f);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !hasDeliveredPurchase || !text.trim()) return;
    onSubmit({
      productSlug,
      author: user.name,
      rating,
      text: text.trim(),
      userId: user.id,
      verifiedPurchase: true,
      photos: photos.length ? photos : undefined,
    });
    setText("");
    setRating(5);
    setPhotos([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Отзывы</h2>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-6">
          {reviews.length === 0 && (
            <li className="text-[14px] text-muted-foreground">
              Пока нет отзывов — будьте первым.
            </li>
          )}
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl bg-surface p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-medium">{r.author}</div>
                  {r.verifiedPurchase && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand)" }}
                    >
                      <ShieldCheck className="h-3 w-3" /> Покупатель проверен
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < r.rating ? "fill-foreground" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed">{r.text}</p>
              {r.photos && r.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.photos.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="block h-20 w-20 overflow-hidden rounded-xl border border-hairline"
                    >
                      <img src={src} alt="Фото отзыва" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-3 text-[11px] text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("ru-RU")}
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-3xl bg-surface p-6">
          <div className="text-[15px] font-medium">Оставить отзыв</div>
          {!user ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              <Link to="/auth" className="underline">Войдите</Link>, чтобы оставить отзыв.
              Отзывы доступны только покупателям, получившим заказ.
            </p>
          ) : !hasDeliveredPurchase ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              Отзыв можно оставить только после получения товара. Это защита от накруток
              и требование законодательства РФ о добросовестной рекламе.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-3">
              <div className="text-[12px] text-muted-foreground">
                От имени <b className="text-foreground">{user.name}</b> · Подтверждённая покупка
              </div>
              <div className="mt-4">
            <span className="mb-1.5 block text-[12px] text-muted-foreground">Оценка</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1"
                  aria-label={`${n} звёзд`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      n <= rating ? "fill-foreground" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[12px] text-muted-foreground">Отзыв</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              rows={4}
              className="w-full resize-none rounded-xl border border-hairline bg-background p-3 text-[14px] outline-none focus:border-foreground"
              required
            />
          </label>
          <div className="mt-3">
            <span className="mb-1.5 block text-[12px] text-muted-foreground">
              Фото (до 4 шт.)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-hairline">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
                    aria-label="Удалить фото"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-hairline text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                  <ImagePlus className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 h-11 w-full rounded-full bg-foreground text-[13px] font-medium text-background transition-transform hover:scale-[1.01]"
          >
                Опубликовать отзыв
              </button>
              {submitted && (
                <p className="mt-3 text-[12px] text-muted-foreground">
                  Спасибо! Ваш отзыв опубликован.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}