"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Logo } from "./logo";
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth";
import { adminLogout } from "@/lib/api";
import { usePersistReady } from "@/lib/use-persist-ready";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/careers", label: "Careers" },
  { href: "/partners", label: "Partners" },
  { href: "/events", label: "Events" },
  { href: "/#testimonials", label: "Reviews" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const hydrated = usePersistReady();
  const itemCount = useCartStore((state) => state.getItemCount());
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    if (user?.role === "admin") {
      await adminLogout();
    }
    signOut();
    setAccountOpen(false);
    setMobileOpen(false);
    window.location.href = "/";
  };

  const profileHref =
    user?.role === "admin" ? "/admin" : user?.role === "candidate" ? "/candidate" : user?.role === "recruiter" ? "/recruiter" : "/shopper";

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
{hydrated && user ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 rounded-full border-2 border-rose/20 bg-rose-blush px-3 py-1.5 text-sm font-semibold text-rose transition-colors hover:border-rose/40"
                  aria-label="Account menu"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-rose text-white">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <span className="max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      accountOpen && "rotate-180"
                    )}
                  />
                </button>
                {accountOpen && (
                  <>
                    <button
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="Close account menu"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div className="card absolute right-0 z-50 mt-2 w-64 overflow-hidden !rounded-2xl p-0">
                      <div className="border-b border-line px-4 py-3">
                        <p className="truncate text-sm font-semibold text-charcoal">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <Link
                        href={profileHref}
                        onClick={() => setAccountOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-charcoal/80 transition-colors hover:bg-rose-blush hover:text-rose"
                      >
                        <UserCircle className="h-4 w-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-charcoal/80 transition-colors hover:bg-rose-blush hover:text-rose"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex text-charcoal/70 hover:text-rose transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            <Link
              href="/cart"
              className="relative text-charcoal/70 hover:text-rose transition-colors"
              aria-label="Cart"
              data-testid="cart-link"
            >
              <ShoppingBag className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
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
          mobileOpen ? "max-h-[27rem]" : "max-h-0"
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
          {user ? (
            <div className="rounded-xl bg-rose-blush px-4 py-2">
              <p className="truncate text-sm font-semibold text-rose">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              <Link
                href={profileHref}
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex w-full items-center gap-2 px-1 py-1 text-sm font-medium text-charcoal/80 hover:text-rose"
              >
                <UserCircle className="h-4 w-4" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 px-1 py-1 text-sm font-medium text-charcoal/80 hover:text-rose"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl font-medium text-charcoal/80 hover:bg-rose-blush hover:text-rose"
            >
              Account
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}