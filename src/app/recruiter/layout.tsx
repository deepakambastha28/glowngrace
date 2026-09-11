"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, ShoppingBag, UserSearch, BriefcaseBusiness, CalendarDays, LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { RecruiterGuard } from "@/components/recruiter/recruiter-guard";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const topNav: NavItem[] = [
  { href: "/recruiter", label: "Home", icon: Home, exact: true },
  { href: "/products", label: "Shop", icon: ShoppingBag },
  { href: "/recruiter/candidates", label: "Candidates", icon: UserSearch },
  { href: "/careers", label: "Careers", icon: BriefcaseBusiness },
  { href: "/recruiter/events", label: "Events", icon: CalendarDays },
];

function RecruiterLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = () => {
    signOut();
    window.location.href = "/";
  };

  return (
    <div className="admin-shell">
      <div className="admin-main">
        <header
          data-testid="recruiter-topnav"
          className="sticky top-0 z-50 bg-[#0e2a20] shadow-[0_2px_20px_rgba(0,0,0,0.25)]"
        >
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
            <div className="flex h-16 items-center justify-between gap-3">
              <Link href="/recruiter" className="flex shrink-0 flex-col leading-tight">
                <span className="font-heading text-lg font-bold text-white">
                  Glow<span className="text-[#7edaa8]">&amp;</span>Grace
                </span>
                <span className="text-[0.6rem] uppercase tracking-[2px] text-[#a7d9bd] font-semibold">
                  Recruiter Portal
                </span>
              </Link>

              <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Recruiter menu">
                {topNav.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#7edaa8] text-[#0e2a20] shadow-[0_6px_16px_rgba(126,218,168,0.35)]"
                          : "text-[#cfe9db] hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="h-[16px] w-[16px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/recruiter/profile"
                  className="hidden max-w-[140px] truncate rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:block"
                  title="My Profile"
                >
                  {user?.name || "Recruiter"}
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign out"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#cfe9db] hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-[16px] w-[16px]" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RecruiterGuard>
      <RecruiterLayoutContent>{children}</RecruiterLayoutContent>
    </RecruiterGuard>
  );
}