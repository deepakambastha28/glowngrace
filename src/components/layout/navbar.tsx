"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/careers", label: "Careers" },
  { href: "/#testimonials", label: "Reviews" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.05)]"
      data-testid="navbar"
    >
      <div className="mx-auto max-w-screen-xl px-6">
        <nav className="flex h-[68px] items-center justify-between">
          <Logo />

          <ul className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="relative font-medium text-charcoal/80 hover:text-rose transition-colors text-[0.96rem] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-rose after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="hidden sm:flex text-charcoal/70 hover:text-rose transition-colors"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="hidden sm:flex text-charcoal/70 hover:text-rose transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative text-charcoal/70 hover:text-rose transition-colors"
              aria-label="Cart"
              data-testid="cart-link"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-2 -right-3 grid h-[18px] w-[18px] place-items-center rounded-full bg-rose text-[0.65rem] font-bold text-white"
                  data-testid="cart-count"
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-charcoal/70 hover:text-rose transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-line bg-white/95 transition-all duration-300",
          mobileOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="flex flex-col px-6 py-4 gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl font-medium text-charcoal/80 hover:bg-rose-blush hover:text-rose"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-xl font-medium text-charcoal/80 hover:bg-rose-blush hover:text-rose"
          >
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}