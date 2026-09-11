"use client";

import { Phone, Instagram, Facebook } from "lucide-react";

export function TopBar() {
  return (
    <div className="topbar" data-testid="topbar">
      <div className="mx-auto max-w-screen-xl px-6 flex items-center justify-between flex-wrap gap-2">
        <span>✨ Free shipping across Lucknow on orders above ₹999</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> +91 89718 21213
          </span>
          <a href="#" className="flex items-center gap-1.5 opacity-90 hover:text-rose-soft transition-colors" aria-label="Instagram">
            <Instagram className="h-3.5 w-3.5" /> Instagram
          </a>
          <a href="#" className="flex items-center gap-1.5 opacity-90 hover:text-rose-soft transition-colors" aria-label="Facebook">
            <Facebook className="h-3.5 w-3.5" /> Facebook
          </a>
        </div>
      </div>
    </div>
  );
}