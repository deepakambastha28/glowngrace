"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { getDeviceId } from "@/lib/device";

/**
 * Syncs the Zustand cart + wishlist to the Neon database (best-effort).
 * Debounced and fire-and-forget so it never blocks the UI.
 */
export function CartSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const sync = () => {
      const state = useCartStore.getState();
      const deviceId = getDeviceId();
      const payload = {
        items: state.items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          emoji: item.product.emoji,
          price: item.product.price,
          quantity: item.quantity,
        })),
        wishlist: state.wishlist,
      };

      try {
        void fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-device-id": deviceId,
          },
          body: JSON.stringify(payload),
        }).catch(() => {
          /* best-effort sync, ignore failures */
        });
      } catch {
        /* ignore */
      }
    };

    const unsubscribe = useCartStore.subscribe((state, prev) => {
      const changed =
        state.items !== prev.items || state.wishlist !== prev.wishlist;
      if (!changed) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(sync, 1000);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}