"use client";

import Link from "next/link";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart, ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import type { Product } from "@/lib/data";
import { fetchProducts } from "@/lib/api";
import { money, cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 999;

function WishlistSection() {
  const items = useCartStore((state) => state.items);
  const wishlist = useCartStore((state) => state.wishlist);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const [catalog, setCatalog] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetchProducts().then((res) => {
      if (!active) return;
      if (res.data?.items?.length) setCatalog(res.data.items);
    });
    return () => {
      active = false;
    };
  }, []);

  const wishlistProducts = catalog.filter((p) => wishlist.includes(p.id));
  const isInCart = (id: string) => items.some((i) => i.product.id === id);

  const handleAdd = (id: string) => {
    const product = catalog.find((p) => p.id === id);
    if (!product || isInCart(id)) return;
    addItem(product);
    toast.success(`${product.name} added to cart 🛍️`);
  };

  const handleRemove = (id: string, name: string) => {
    toggleWishlist(id);
    toast.success(`${name} removed from wishlist`);
  };

  if (wishlistProducts.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-rose" />
        <h2 className="text-[1.25rem] font-bold">Your Wishlist ({wishlistProducts.length})</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wishlistProducts.map((product) => {
          const inCart = isInCart(product.id);
          return (
            <div key={product.id} className="card !rounded-[18px] p-5 flex flex-col" data-testid="wishlist-item">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/products/${product.slug}`}
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-rose-blush text-3xl"
                >
                  {product.emoji}
                </Link>
                <button
                  onClick={() => handleRemove(product.id, product.name)}
                  className="grid h-8 w-8 place-items-center rounded-full text-rose bg-rose-blush hover:bg-rose hover:text-white transition-colors cursor-pointer"
                  aria-label={`Remove ${product.name} from wishlist`}
                  data-testid="wishlist-remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex-1">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[1.2px] text-gold">
                  {product.brand}
                </p>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-0.5 block text-[0.98rem] font-semibold leading-snug hover:text-rose transition-colors"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-[0.95rem] font-bold text-rose">{money(product.price)}</p>
              </div>

              <button
                onClick={() => handleAdd(product.id)}
                disabled={inCart}
                className={cn(
                  "btn w-full !py-2.5 !px-4 !text-[0.85rem] mt-4",
                  inCart ? "btn-gold" : "btn-primary"
                )}
                data-testid="wishlist-add-to-cart"
              >
                {inCart ? (
                  <>
                    <ShoppingCart className="h-4 w-4" /> In Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const gst = useCartStore((state) => state.getGST());

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + gst + shipping - discount;

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.success(`${name} removed from cart`);
  };

  const handlePromo = () => {
    if (promo.trim().toUpperCase() === "GLOW10") {
      setPromoApplied(true);
      toast.success("Promo GLOW10 applied — 10% off! 🎉");
    } else {
      toast.error("Invalid promo code");
    }
  };

  if (items.length === 0) {
    return (
      <>
        <div className="breadcrumb">
          <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
            <Link href="/" className="hover:text-rose transition-colors">Home</Link>
            <span className="text-muted">/</span>
            <span className="text-charcoal">Cart</span>
          </div>
        </div>
        <div className="mx-auto max-w-screen-xl px-6 py-24 text-center" data-testid="empty-cart">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-rose-blush">
            <ShoppingBag className="h-12 w-12 text-rose" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-muted">
            Looks like you haven&apos;t added anything yet — let&apos;s fix that!
          </p>
          <Link href="/products" className="btn-primary mt-8 inline-flex">
            Start Shopping <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <WishlistSection />
      </>
    );
  }

  return (
    <>
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Cart</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-12 pb-16">
        <div className="section-head">
          <p className="eyebrow">Shopping Cart</p>
          <h1>Your Beauty Basket</h1>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-8 items-start">
          {/* Cart items */}
          <div className="card !rounded-[18px] p-6 md:p-7">
            <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
              <h2 className="text-[1.2rem] font-bold">Shopping Cart ({itemCount})</h2>
              <button
                onClick={() => {
                  clearCart();
                  toast.success("Cart cleared");
                }}
                className="text-[0.85rem] font-semibold text-muted hover:text-rose transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>

            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[80px_1fr] sm:grid-cols-[90px_1fr_auto] items-center gap-4 sm:gap-[18px] rounded-2xl border border-line bg-white p-4 sm:p-[18px]"
                  data-testid="cart-item"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="grid h-20 w-20 sm:h-[90px] sm:w-[90px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-blush to-[#fbe0ea]"
                  >
                    <span className="text-4xl sm:text-[2.6rem]">{product.emoji}</span>
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-[0.72rem] font-bold uppercase tracking-[1.5px] text-gold hover:text-rose transition-colors"
                    >
                      {product.brand}
                    </Link>
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-0.5 block truncate text-[1.05rem] font-semibold leading-snug hover:text-rose transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[0.95rem] font-bold text-rose">
                      {money(product.price * quantity)}
                    </p>
                  </div>

                  <div className="col-start-2 sm:col-start-auto flex items-center justify-between sm:flex-col sm:items-end gap-3">
                    <div className="flex items-center rounded-full border-[1.5px] border-[#f0d5e0] bg-white overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        data-testid="cart-qty-minus"
                        className="grid h-8 w-8 place-items-center text-rose hover:bg-rose-blush transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-[38px] text-center font-semibold text-[0.95rem]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        data-testid="cart-qty-plus"
                        className="grid h-8 w-8 place-items-center text-rose hover:bg-rose-blush transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      data-testid="cart-remove"
                      className="text-[0.82rem] font-medium text-muted hover:text-rose transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="card !rounded-[18px] p-6 md:p-7 lg:sticky lg:top-24">
            <h2 className="text-[1.2rem] font-bold mb-5">Order Summary</h2>

            {/* Promo */}
            <div className="flex items-center gap-2 mb-5">
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Promo code (try GLOW10)"
                className="field-input !rounded-full flex-1"
                data-testid="promo-input"
              />
              <button
                onClick={handlePromo}
                disabled={promoApplied}
                className={cn(
                  "btn !px-5 !py-2.5 !text-[0.85rem] shrink-0",
                  promoApplied ? "btn-gold" : "btn-primary"
                )}
                data-testid="promo-apply"
              >
                {promoApplied ? "Applied" : "Apply"}
              </button>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-line text-[0.95rem]">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal ({itemCount} items)</span>
                <span className="font-semibold" data-testid="cart-subtotal">{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald">
                  <span>Promo Discount (10%)</span>
                  <span className="font-semibold">-{money(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">GST (5%)</span>
                <span className="font-semibold">{money(gst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className={cn("font-semibold", shipping === 0 && "text-emerald")}>
                  {shipping === 0 ? "FREE" : money(shipping)}
                </span>
              </div>

              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-[0.82rem] text-muted bg-rose-blush rounded-full px-4 py-2 mt-2">
                  Add {money(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping! 🚚
                </p>
              )}

              <div className="flex justify-between items-center border-t border-line pt-4 mt-3">
                <span className="font-bold text-[1.05rem]">Total</span>
                <span className="text-[1.5rem] font-extrabold text-rose" data-testid="cart-total">
                  {money(total)}
                </span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full mt-6" data-testid="cart-checkout">
              Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/products"
              className="block text-center text-[0.9rem] text-muted hover:text-rose mt-4 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <WishlistSection />
      </div>
    </>
  );
}