"use client";

import { useSyncExternalStore } from "react";

let ready = false;
const listeners = new Set<() => void>();

function emit() {
  ready = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Called by PersistHydrator once persisted Zustand stores have rehydrated. */
export function markPersistReady() {
  if (ready) return;
  emit();
}

/**
 * Returns true once persisted store rehydration has completed after mount.
 * Gate server-side-empty redirects/UI on this so a full page load with
 * saved localStorage state behaves correctly without hydration errors.
 */
export function usePersistReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false
  );
}