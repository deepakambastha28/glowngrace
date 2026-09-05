"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: "#fffafc",
          color: "#2b2330",
          border: "1px solid rgba(214, 51, 108, 0.15)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(214, 51, 108, 0.18)",
          fontFamily: "inherit",
        },
      }}
    />
  );
}
