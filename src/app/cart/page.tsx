"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import { money, cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 999;

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

            <div className="space-y-5">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row gap-4 border-b border-line pb-5 last:border-0 last:pb-0"
                  data-testid="cart-item"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="grid h-[88px] w-full sm:w-[88px] shrink-0 place-items-center rounded-2xl bg-rose-blush"
                  >
                    <span className="text-4xl">{product.emoji}</span>
                  </Link>

                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-[1rem] font-semibold hover:text-rose transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[0.8rem] text-muted mt-0.5">
                        {product.brand} · {money(product.price)}
                      </p>
                      <p className="text-[0.95rem] font-bold text-rose mt-1">
                        {money(product.price * quantity)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border-2 border-line bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          data-testid="cart-qty-minus"
                          className="grid h-9 w-9 place-items-center text-rose hover:bg-rose-blush transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-9 text-center font-bold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          data-testid="cart-qty-plus"
                          className="grid h-9 w-9 place-items-center text-rose hover:bg-rose-blush transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(product.id, product.name)}
                        data-testid="cart-remove"
                        className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-rose hover:text-white transition-colors cursor-pointer"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
      </div>
    </>
  );
}