"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap, Heart, Truck, RefreshCcw, ShieldCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Product, Review } from "@/lib/data";
import { fetchProducts, fetchProductReviews } from "@/lib/api";
import { useCartStore } from "@/lib/store";
import { money, calculateDiscount, cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductCard } from "@/components/shop/product-card";

interface ProductPageProps {
  params: { slug: string };
}

const galleryShadows = [
  "from-rose-blush to-rose-soft/20",
  "from-rose-soft/20 to-gold/10",
  "from-blush to-rose/10",
  "from-rose/10 to-rose-soft/30",
];

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const isWishlisted = useCartStore((state) =>
    product ? state.wishlist.includes(product.id) : false
  );

  const productName = product?.name;

  useEffect(() => {
    let active = true;
    fetchProducts().then((res) => {
      if (!active) return;
      const items = res.data?.items;
      if (items?.length) {
        setAllProducts(items);
        setProduct(items.find((p) => p.slug === params.slug));
        setActiveImage(0);
      }
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, [params.slug]);

  useEffect(() => {
    let active = true;
    if (!productName) {
      setProductReviews([]);
      return () => {
        active = false;
      };
    }
    fetchProductReviews(productName).then((res) => {
      if (!active) return;
      setProductReviews(Array.isArray(res.data?.items) ? res.data!.items : []);
    });
    return () => {
      active = false;
    };
  }, [productName]);

  if (status === "ready" && !product) {
    notFound();
  }

  if (!product) {
    return <div className="py-32 text-center text-muted">Loading product…</div>;
  }

  const discount = calculateDiscount(product.price, product.oldPrice);
  const images =
    product.gallery && product.gallery.length
      ? product.gallery
      : product.imageData
        ? [product.imageData]
        : [];
  const galleryThumbs = images.length ? images.slice(0, 4) : galleryShadows;
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart 🛍️`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast.success(isWishlisted ? "Removed from wishlist 💔" : "Added to wishlist 💖");
  };

  const reviewRating =
    productReviews.length > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      : product.rating;
  const shownReviewsCount =
    productReviews.length > 0 ? productReviews.length : product.reviewsCount;

  return (
    <div className="pb-16">
      {/* Breadcrumb band */}
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <Link href="/products" className="hover:text-rose transition-colors">Products</Link>
          <span className="text-muted">/</span>
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-rose transition-colors"
          >
            {product.category}
          </Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-12 grid lg:grid-cols-[440px_minmax(0,1fr)] gap-8 lg:gap-10">
        {/* Gallery */}
        <div data-testid="gallery-column" className="flex flex-col">
          <div
            data-testid="product-gallery"
            className={cn(
              "relative grid aspect-[440/460] w-full max-w-[440px] place-items-center rounded-[18px] border border-line bg-gradient-to-br overflow-hidden",
              galleryShadows[activeImage % galleryShadows.length]
            )}
          >
            {images.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[activeImage % images.length]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[10rem]">{product.emoji}</span>
            )}
            {discount > 0 && (
              <span className="absolute top-5 right-5 rounded-full bg-emerald px-4 py-1.5 text-[0.85rem] font-bold text-white shadow-soft">
                Save {discount}% on MRP
              </span>
            )}
            {product.tag && (
              <span className="prod-tag !top-5 !left-5">{product.tag}</span>
            )}
            {product.isNew && !product.tag && (
              <span className="prod-tag !top-5 !left-5">NEW</span>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            {galleryThumbs.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(images.length ? i : 0)}
                className={cn(
                  "grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br border border-line transition-all cursor-pointer overflow-hidden",
                  galleryShadows[i % galleryShadows.length],
                  activeImage === (images.length ? i : 0)
                    ? "ring-2 ring-rose ring-offset-2 scale-105 shadow-soft"
                    : "opacity-60 hover:opacity-100"
                )}
                aria-label={`Image ${i + 1}`}
              >
                {images.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">{product.emoji}</span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <div
              data-testid="trust-badges"
              className="space-y-3 rounded-[16px] border border-line bg-white p-6"
            >
              {[
                { icon: Truck, text: "Free shipping across Lucknow on orders above ₹999" },
                { icon: RefreshCcw, text: "7-day easy returns & exchange" },
                { icon: ShieldCheck, text: "100% authentic, quality assured" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-[0.9rem] text-charcoal/70">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-blush text-rose">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div data-testid="info-column">
          <span className="text-[0.8rem] font-bold uppercase tracking-[1.2px] text-gold">
            {product.brand}
          </span>
          <h1 className="mt-2 text-[2.2rem] font-bold leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <RatingStars rating={reviewRating} size={18} />
            <span className="text-[0.9rem] text-muted">
              {Number.isInteger(reviewRating) ? reviewRating : reviewRating.toFixed(1)} · {shownReviewsCount} reviews
            </span>
          </div>
          <p
            data-testid="main-description"
            className="mt-4 text-[0.98rem] text-charcoal/70 leading-relaxed line-clamp-5"
          >
            {product.description}
          </p>
          <button
            data-testid="read-more"
            onClick={() => {
              setActiveTab("description");
              document
                .getElementById("product-details")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="mt-3 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-rose hover:text-rose-dark transition-colors cursor-pointer"
          >
            Read more <ChevronDown className="h-4 w-4" />
          </button>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[2.2rem] font-extrabold text-rose">{money(product.price)}</span>
            {product.oldPrice > 0 && (
              <>
                <span className="text-[1.1rem] line-through text-muted">
                  {money(product.oldPrice)}
                </span>
                <span className="rounded-full bg-emerald/15 text-emerald px-3.5 py-1 text-[0.85rem] font-bold">
                  You save {money(product.oldPrice - product.price)}
                </span>
              </>
            )}
          </div>

          <div className="pd-spec-feature mt-7 grid sm:grid-cols-2 gap-4">
            {product.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-[0.9rem]">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald text-white text-[0.7rem] font-bold">
                  ✓
                </span>
                {feature}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border-2 border-line bg-white overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="grid h-11 w-11 place-items-center text-rose hover:bg-rose-blush transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-bold" data-testid="quantity-display">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="grid h-11 w-11 place-items-center text-rose hover:bg-rose-blush transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn-primary flex-1 min-w-[160px]"
              data-testid="add-to-cart"
            >
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={!product.inStock} className="btn-gold">
              <Zap className="h-5 w-5" /> Buy Now
            </button>
            <button
              onClick={handleWishlist}
              className={cn(
                "grid h-12 w-12 place-items-center rounded-full border-2 transition-all cursor-pointer",
                isWishlisted
                  ? "border-rose bg-rose text-white shadow-rose"
                  : "border-line bg-white text-rose hover:border-rose"
              )}
              aria-label="Add to wishlist"
            >
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      {/* Details tabs */}
      <div id="product-details" className="mx-auto max-w-screen-xl px-6 mt-16 scroll-mt-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="info">More Info</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" data-testid="description-tab" className="rounded-[16px] border border-line bg-white p-7">
            <h3 className="text-xl font-bold mb-4">Product Description</h3>
            <p className="text-charcoal/70 leading-relaxed">{product.description}</p>
            <h4 className="text-lg font-bold mt-6 mb-3">Key Features</h4>
            <ul className="grid sm:grid-cols-2 gap-3">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-[0.95rem] text-charcoal/70">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald text-white text-[0.7rem] font-bold">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="info" className="rounded-[16px] border border-line bg-white p-7">
            <h3 className="text-xl font-bold mb-4">Product Information</h3>
            <div className="space-y-3 text-[0.95rem] text-charcoal/70">
              <p><strong className="text-charcoal">Brand:</strong> {product.brand}</p>
              <p><strong className="text-charcoal">Category:</strong> {product.category}</p>
              <p><strong className="text-charcoal">Country of Origin:</strong> India</p>
              <p><strong className="text-charcoal">Manufacturer:</strong> Glow & Grace Pvt. Ltd., Lucknow</p>
              <p><strong className="text-charcoal">Storage:</strong> Store in a cool, dry place away from direct sunlight</p>
              <p><strong className="text-charcoal">Quality Assurance:</strong> DOT & FDA compliant, cruelty-free</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="rounded-[16px] border border-line bg-white p-7">
            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
            {productReviews.length > 0 ? (
              <div className="space-y-6">
                {productReviews.map((review) => (
                  <div key={review.id} className="border-b border-line pb-4 last:border-0 flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-gradient font-bold text-white">
                      {review.initial || review.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-charcoal">{review.author}</p>
                        <span className="text-xs text-muted">{review.date}</span>
                      </div>
                      <div className="mt-1">
                        <RatingStars rating={review.rating} size={14} />
                      </div>
                      <p className="mt-2 text-sm text-charcoal/70">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No reviews yet. Be the first to review this product!</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto max-w-screen-xl px-6 mt-16">
          <div className="section-head">
            <p className="eyebrow">You May Also Like</p>
            <h2>Complete Your Glow Routine</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}