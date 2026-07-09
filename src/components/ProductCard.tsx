import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/catalog/$slug"
        params={{ slug: product.slug }}
        className="group block"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[15px] font-medium tracking-tight">{product.name}</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">{product.tagline}</div>
          </div>
          <div className="text-[15px] font-medium tracking-tight">
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}