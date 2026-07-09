import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Star } from "lucide-react";
import { useState } from "react";
import { findProduct, formatPrice, products, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/catalog/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — SADOVA` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — SADOVA` },
          { property: "og:description", content: loaderData.product.description },
        ]
      : [{ title: "Не найдено — SADOVA" }, { name: "robots", content: "noindex" }],
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
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  function handleAdd() {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <>
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
          className="overflow-hidden rounded-3xl bg-surface"
        >
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="w-full object-cover"
          />
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
            <span className="text-[13px]">{product.rating.toFixed(1)}</span>
            <span className="text-[13px] text-muted-foreground">/ 5</span>
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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Похожие модели</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}