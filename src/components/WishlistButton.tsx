import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/lib/wishlist-store";

export function WishlistButton({
  productId,
  className = "",
  size = 18,
}: {
  productId: string;
  className?: string;
  size?: number;
}) {
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      whileTap={{ scale: 0.85 }}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      aria-pressed={active}
      className={`inline-flex items-center justify-center rounded-full bg-background/85 p-2 backdrop-blur transition-colors hover:bg-background ${className}`}
    >
      <Heart
        style={{
          width: size,
          height: size,
          color: active ? "var(--brand)" : "var(--muted-foreground)",
          fill: active ? "var(--brand)" : "transparent",
        }}
      />
    </motion.button>
  );
}