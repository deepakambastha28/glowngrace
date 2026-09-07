"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { cn, money } from "@/lib/utils";
import type { Product } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import { RatingStars } from "@/components/ui/rating-stars";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const wishlist = useCartStore((state) => state.wishlist);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);

  const isWishlisted = wishlist.includes(product.id);
  const outOfStock = !product.inStock;

  const handleWishlist = () => {
    if (isWishlisted) {
      removeItem(product.id);
    }
    toggleWishlist(product.id);
    toast.success(
      isWishlisted ? "Removed from wishlist" : "Added to wishlist 💖"
    );
  };

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(product);
    toast.success(`${product.name} added to cart 🛍️`);
  };

  return (
    <div
      className="card group"
      data-testid="product-card"
      data-product-id={product.id}
    >
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="prod-img"
          aria-label={product.name}
          data-testid="product-card-image"
        >
          <span className="transition-transform duration-300 group-hover:scale-125">
            {product.emoji}
          </span>
        </Link>
        {product.tag ? (
          <span className="prod-tag">{product.tag}</span>
        ) : (
          <span className="sr-only">No tag</span>
        )}
        <button
          onClick={handleWishlist}
          className={cn(
            "wishlist-chip",
            isWishlisted && "bg-rose text-white border-rose"
          )}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          data-testid="wishlist-button"
        >
          <Heart
            className={cn("h-[18px] w-[18px]", isWishlisted && "fill-current")}
          />
        </button>
      </div>

      <div className="p-5">
        <span className="text-[0.75rem] font-semibold uppercase tracking-[1.2px] text-gold">
          {product.brand}
        </span>
        <h3 className="text-[1.03rem] font-semibold mt-1 leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:text-rose transition-colors">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <RatingStars rating={product.rating} size={13} />
          <span className="text-[0.8rem] text-muted">({product.reviewsCount})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-[1.25rem] font-extrabold text-rose">
              {money(product.price)}
            </span>
            {product.oldPrice > 0 && (
              <span className="ml-2 text-[0.9rem] line-through text-muted">
                {money(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={cn(
              "grid h-[42px] w-[42px] place-items-center rounded-full bg-rose-blush text-rose transition-all duration-300 hover:bg-rose-gradient hover:text-white hover:shadow-rose",
              outOfStock &&
                "cursor-not-allowed opacity-50 hover:bg-rose-blush hover:text-rose hover:shadow-none"
            )}
            aria-label={`Add ${product.name} to cart`}
            data-testid="add-to-cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}