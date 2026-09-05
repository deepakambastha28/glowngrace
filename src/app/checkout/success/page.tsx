"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Package, Mail } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const generatedId = useMemo(() => {
    if (orderId) return orderId;
    return `GG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  }, [orderId]);

  useEffect(() => {
    document.title = "Order Confirmed | Glow & Grace";
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald text-white shadow-[0_0_0_8px_rgba(46,158,107,0.15)]"
      >
        <Check className="h-12 w-12" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="mt-8 text-3xl md:text-4xl font-bold">
          Thank You for Your Order! 🌸
        </h1>
        <p className="mt-3 text-muted">
          Your order has been placed successfully. A confirmation email is on
          its way.
        </p>

        <div className="mt-10 rounded-[18px] border border-line bg-white p-8 shadow-soft" data-testid="order-confirmation">
          <p className="text-[0.9rem] text-muted">Order ID</p>
          <p
            className="mt-2 inline-block rounded-full bg-rose-blush px-6 py-2 text-[1.4rem] font-extrabold text-rose"
            data-testid="order-id"
          >
            {generatedId}
          </p>
          <div className="mt-7 space-y-3 text-left">
            <div className="flex items-center gap-3 rounded-full bg-rose-blush px-5 py-3.5">
              <Package className="h-5 w-5 text-rose shrink-0" />
              <p className="text-[0.9rem] text-charcoal/80">
                Estimated delivery: <strong>3-5 business days</strong> within Lucknow
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-emerald/10 px-5 py-3.5">
              <Mail className="h-5 w-5 text-emerald shrink-0" />
              <p className="text-[0.9rem] text-charcoal/80">
                A confirmation email with tracking details is heading to your inbox
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products" className="btn-primary">Continue Shopping</Link>
          <Link href="/" className="btn-outline">Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-rose border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}