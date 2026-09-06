"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { markPersistReady } from "@/lib/use-persist-ready";

/**
 * Rehydrates persisted Zustand stores after mount. The stores use
 * `skipHydration: true` so their first render always matches the
 * server HTML, then this component restores localStorage state once
 * the client is ready.
 */
export function PersistHydrator() {
  useEffect(() => {
    void Promise.all([
      useCartStore.persist.rehydrate(),
      useAuthStore.persist.rehydrate(),
    ]).then(() => markPersistReady());
  }, []);

  return null;
}