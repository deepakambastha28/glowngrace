"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Briefcase, MessageSquare, Users,
  CalendarDays, LogOut, Menu, Search, Bell, UserSearch,
  type LucideIcon,
} from "lucide-react";
import { adminLogout, adminSession } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/partners", label: "Partners", icon: Users },
      { href: "/admin/candidates", label: "Candidates", icon: Users },
      { href: "/admin/recruiters", label: "Recruiters", icon: UserSearch },
    ],
  },
];

const SESSION_MS = 60 * 15 * 1000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    adminSession().then((res) => {
      const ok = !!(res.ok && res.data?.authed);
      setAuthed(ok);
      if (ok) {
        scheduleLogout();
      } else {
        useAuthStore.getState().signOut();
        router.replace("/login");
      }
    });
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pathname, router]);

  const scheduleLogout = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await adminLogout();
      useAuthStore.getState().signOut();
      window.location.href = "/";
    }, SESSION_MS);
  };

  const handleLogout = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await adminLogout();
    useAuthStore.getState().signOut();
    window.location.href = "/";
  };

  if (authed === null || !authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf5f8]">
        <div className="text-sm text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside
        className={cn("admin-sidebar px-4 py-6", sidebarOpen && "open")}
        data-testid="admin-sidebar"
      >
        <div className="px-3 pb-5 border-b border-white/10 mb-4">
          <div className="font-heading text-xl font-bold text-white">
            Glow<span className="text-gold">&amp;</span>Grace
          </div>
          <div className="text-[0.62rem] tracking-[2px] text-rose-soft uppercase font-semibold mt-0.5">
            Admin Portal
          </div>
        </div>

        <nav className="flex-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="text-[0.68rem] uppercase tracking-[1.5px] text-[#7d7183] px-3 py-3 font-bold">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn("admin-nav-item", isActive && "active")}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidefoot">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-rose text-white font-bold shrink-0">
            DK
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-semibold leading-tight truncate">Deepak Kumar</div>
            <div className="text-[0.72rem] text-[#9a8fa0]">Store Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-lg text-[#9a8fa0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="admin-search">
            <Search className="h-4 w-4 text-rose" />
            <input placeholder="Search…" aria-label="Search" />
          </div>

          <div className="admin-actions">
            <span className="t-ic" title="Notifications">
              <Bell className="h-5 w-5" />
              <span className="dot" />
            </span>
            <div className="admin-av">DK</div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}