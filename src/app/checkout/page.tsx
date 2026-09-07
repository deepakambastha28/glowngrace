"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Smartphone, Landmark, Banknote, ChevronLeft, ChevronRight, Check, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutFormData } from "@/lib/schemas";
import { createOrder } from "@/lib/api";
import { useCartStore } from "@/lib/store";
import { usePersistReady } from "@/lib/use-persist-ready";
import { money, cn } from "@/lib/utils";
import { Stepper, StepperItem } from "@/components/ui/stepper";

const deliveryOptions = [
  { id: "standard", label: "Standard", price: 0, time: "3-5 business days" },
  { id: "express", label: "Express", price: 49, time: "1-2 business days" },
  { id: "same-day", label: "Same-Day", price: 99, time: "Within Lucknow today" },
];

const paymentMethods = [
  { id: "card", label: "Card", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "netbanking", label: "NetBanking", icon: Landmark },
  { id: "cod", label: "Cash on Delivery", icon: Banknote },
];

export default function CheckoutPage() {
  const router = useRouter();
  const persistReady = usePersistReady();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const gst = useCartStore((state) => state.getGST());
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const placed = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      locality: "",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "",
      landmark: "",
      deliveryOption: "standard",
      paymentMethod: "card",
    },
  });

  useEffect(() => {
    if (placed.current) return;
    if (persistReady && items.length === 0) {
      router.replace("/cart");
    }
  }, [persistReady, items.length, router]);

  const deliveryOption = watch("deliveryOption");
  const delivery = deliveryOptions.find((d) => d.id === deliveryOption) ?? deliveryOptions[0];
  const paymentMethod = watch("paymentMethod");

  const shipping = delivery.price;
  const total = subtotal + gst + shipping;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const goToStep = (target: number) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = async () => {
    if (step === 1) {
      // No data entered on the cart-review step — advance freely.
      goToStep(step + 1);
      return;
    }
    const fields = ["street", "locality", "pincode", "landmark"] as const;
    const valid = await trigger(fields);
    if (valid) goToStep(step + 1);
  };

  const handlePlaceOrder = async (data: CheckoutFormData) => {
    if (placing) return;
    setPlacing(true);
    const orderId = `GG-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const payload = {
      orderId,
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      address: {
        street: data.street,
        locality: data.locality,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        landmark: data.landmark,
      },
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        emoji: item.product.emoji,
        price: item.product.price,
        quantity: item.quantity,
      })),
      totals: { subtotal, gst, shipping, total },
      deliveryOption: data.deliveryOption,
      paymentMethod: data.paymentMethod,
    };

    createOrder(payload).catch(() => {
      // best-effort — never block the purchase on persistence
    });

    placed.current = true;
    clearCart();
    toast.success("Order placed successfully! 🎉");
    router.push(`/checkout/success?order=${orderId}`);
  };

  const stepLabels = ["Cart", "Shipping & Payment", "Confirmation"];

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <Link href="/cart" className="hover:text-rose transition-colors">Cart</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl px-6 pt-12">
        <div className="section-head">
          <p className="eyebrow">Checkout</p>
          <h1>Almost There — Let&apos;s Finalise</h1>
        </div>

        <div className="mb-10 max-w-2xl mx-auto">
          <Stepper>
            {stepLabels.map((label, i) => (
              <StepperItem
                key={label}
                step={i + 1}
                label={label}
                completed={step > i + 1}
                active={step === i + 1}
                {...(i === stepLabels.length - 1 ? { "data-last": true } : {})}
              />
            ))}
          </Stepper>
        </div>

        <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-8 items-start">
          {/* Left column */}
          <div>
            {step === 1 && (
              <div className="card !rounded-[18px] p-6 md:p-7">
                <h2 className="text-[1.2rem] font-bold mb-5">Review Your Cart</h2>
                <div className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                      <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-2xl bg-rose-blush">
                        <span className="text-3xl">{product.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.95rem] font-semibold truncate">{product.name}</p>
                        <p className="text-[0.8rem] text-muted">Qty: {quantity}</p>
                      </div>
                      <span className="font-bold">{money(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleNext} className="btn-primary w-full mt-6" data-testid="checkout-next">
                  Proceed to Shipping &amp; Payment <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {step >= 2 && (
              <form onSubmit={handleSubmit(handlePlaceOrder)}>
                {step === 2 && (
                  <div className="card !rounded-[18px] p-6 md:p-7 space-y-5">
                    <h2 className="text-[1.2rem] font-bold">Shipping &amp; Contact Details</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="field-label" htmlFor="firstName">First Name</label>
                        <input id="firstName" className="field-input" placeholder="Priya" {...register("firstName")} />
                        {errors.firstName && <p className="text-[0.8rem] text-rose mt-1">{errors.firstName.message}</p>}
                      </div>
                      <div>
                        <label className="field-label" htmlFor="lastName">Last Name</label>
                        <input id="lastName" className="field-input" placeholder="Sharma" {...register("lastName")} />
                        {errors.lastName && <p className="text-[0.8rem] text-rose mt-1">{errors.lastName.message}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="field-label" htmlFor="email">Email Address</label>
                        <input id="email" type="email" className="field-input" placeholder="priya@example.com" {...register("email")} />
                        {errors.email && <p className="text-[0.8rem] text-rose mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="field-label" htmlFor="phone">Phone Number</label>
                        <input id="phone" type="tel" className="field-input" placeholder="+91 98765 43210" {...register("phone")} />
                        {errors.phone && <p className="text-[0.8rem] text-rose mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="street">Street Address</label>
                      <input id="street" className="field-input" placeholder="123 Hazratganj Road" {...register("street")} />
                      {errors.street && <p className="text-[0.8rem] text-rose mt-1">{errors.street.message}</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="field-label" htmlFor="locality">Locality / Area</label>
                        <input id="locality" className="field-input" placeholder="Hazratganj" {...register("locality")} />
                        {errors.locality && <p className="text-[0.8rem] text-rose mt-1">{errors.locality.message}</p>}
                      </div>
                      <div>
                        <label className="field-label" htmlFor="pincode">PIN Code</label>
                        <input id="pincode" className="field-input" placeholder="226001" inputMode="numeric" {...register("pincode")} />
                        {errors.pincode && <p className="text-[0.8rem] text-rose mt-1">{errors.pincode.message}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="field-label" htmlFor="city">City</label>
                        <input id="city" disabled className="field-input !bg-cream/60" {...register("city")} />
                      </div>
                      <div>
                        <label className="field-label" htmlFor="state">State</label>
                        <input id="state" disabled className="field-input !bg-cream/60" {...register("state")} />
                      </div>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="landmark">Landmark (optional)</label>
                      <input id="landmark" className="field-input" placeholder="Near City Mall" {...register("landmark")} />
                    </div>

                    <div>
                      <span className="field-label block">Delivery Method</span>
                      <Controller
                        control={control}
                        name="deliveryOption"
                        render={({ field }) => (
                          <div className="mt-2 space-y-2">
                            {deliveryOptions.map((opt) => (
                              <label
                                key={opt.id}
                                className={cn(
                                  "flex items-center gap-3 rounded-full border-2 px-5 py-3 cursor-pointer transition-all",
                                  field.value === opt.id
                                    ? "border-rose bg-rose-blush"
                                    : "border-line hover:border-rose/40"
                                )}
                              >
                                <input
                                  type="radio"
                                  value={opt.id}
                                  checked={field.value === opt.id}
                                  onChange={() => field.onChange(opt.id)}
                                  className="accent-rose"
                                />
                                <Truck className="h-4 w-4 text-rose shrink-0" />
                                <div className="flex-1">
                                  <span className="font-semibold text-[0.9rem]">{opt.label}</span>
                                  <span className="text-[0.8rem] text-muted"> · {opt.time}</span>
                                </div>
                                <span className="font-bold text-[0.9rem]">
                                  {opt.price === 0 ? "FREE" : money(opt.price)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    <div>
                      <span className="field-label block">Payment Method</span>
                      <Controller
                        control={control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <div className="mt-2 grid sm:grid-cols-2 gap-3">
                            {paymentMethods.map(({ id, label, icon: Icon }) => (
                              <label
                                key={id}
                                className={cn(
                                  "flex items-center gap-3 rounded-full border-2 px-5 py-3 cursor-pointer transition-all",
                                  field.value === id
                                    ? "border-rose bg-rose-blush"
                                    : "border-line hover:border-rose/40"
                                )}
                              >
                                <input
                                  type="radio"
                                  value={id}
                                  checked={field.value === id}
                                  onChange={() => field.onChange(id)}
                                  className="accent-rose"
                                />
                                <Icon className="h-4 w-4 text-rose shrink-0" />
                                <span className="font-semibold text-[0.9rem]">{label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {paymentMethod === "cod" && (
                      <div className="rounded-full bg-gold/15 px-5 py-3 text-[0.9rem] text-charcoal/80">
                        💵 Pay cash on delivery. Please keep exact change ready.
                      </div>
                    )}

                    <button type="button" onClick={handleNext} className="btn-primary w-full" data-testid="checkout-next">
                      Review Order <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {step === 3 && (
                  <div className="card !rounded-[18px] p-6 md:p-7 space-y-5">
                    <h2 className="text-[1.2rem] font-bold">Review &amp; Confirm</h2>

                    <div className="rounded-[16px] border border-line bg-cream/50 p-5 space-y-2 text-[0.92rem]">
                      <p><strong>Name:</strong> {watch("firstName")} {watch("lastName")}</p>
                      <p><strong>Contact:</strong> {watch("email")} · {watch("phone")}</p>
                      <p>
                        <strong>Ship to:</strong> {watch("street")}, {watch("locality")}, {watch("city")} {watch("pincode")}
                      </p>
                      <p>
                        <strong>Delivery:</strong> {delivery.label} ({delivery.time})
                      </p>
                      <p>
                        <strong>Payment:</strong>{" "}
                        {paymentMethods.find((m) => m.id === paymentMethod)?.label ?? paymentMethod}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {items.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center gap-3 text-[0.92rem]">
                          <span className="text-xl">{product.emoji}</span>
                          <span className="flex-1 font-medium">{product.name} × {quantity}</span>
                          <span className="font-bold">{money(product.price * quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={placing}
                      className="btn-primary w-full disabled:opacity-60"
                      data-testid="place-order"
                    >
                      {placing ? "Placing Order…" : (<><Check className="h-5 w-5" /> Place Order</>)}
                    </button>
                  </div>
                )}

                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => goToStep(step - 1)}
                    className="mt-5 inline-flex items-center gap-2 text-rose font-semibold hover:gap-3 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" /> Back
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Order summary */}
          <div className="card !rounded-[18px] p-6 md:p-7 lg:sticky lg:top-24" data-testid="order-summary">
            <h2 className="text-[1.2rem] font-bold mb-5">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-blush">
                    <span className="text-2xl">{product.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.88rem] font-semibold truncate">{product.name}</p>
                    <p className="text-[0.78rem] text-muted">Qty: {quantity}</p>
                  </div>
                  <span className="text-[0.9rem] font-semibold">{money(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-[0.95rem]">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal ({itemCount} items)</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">GST (5%)</span>
                <span className="font-semibold">{money(gst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping ({delivery.label})</span>
                <span className={cn("font-semibold", shipping === 0 && "text-emerald")}>
                  {shipping === 0 ? "FREE" : money(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-line pt-3">
                <span className="font-bold text-[1.05rem]">Total</span>
                <span className="text-[1.4rem] font-extrabold text-rose" data-testid="checkout-total">
                  {money(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}