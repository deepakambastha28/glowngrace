"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Briefcase, MessageSquare, Users, LogOut, type LucideIcon } from "lucide-react";
import { adminLogout, adminSession } from "@/lib/api";
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
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
      { href: "/admin/partners", label: "Partners", icon: Users },
      { href: "/admin/candidates", label: "Candidates", icon: Users },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    let disposed = false;
    adminSession(controller.signal)
      .then((res) => {
        if (disposed) return;
        setAuthed(Boolean(res.data?.authed));
      })
      .catch(() => {
        if (disposed) return;
        setAuthed(false);
      })
      .finally(() => clearTimeout(timer));
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const handleLogout = async () => {
    await adminLogout();
    window.location.assign("/admin");
  };

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center p-8 text-muted">
        Loading…
      </div>
    );
  }

  if (!authed) {
    return <div className="min-h-screen py-10">{children}</div>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar px-4 py-6" data-testid="admin-sidebar">
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

        <div className="border-t border-white/10 px-3 py-4 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-rose-soft to-rose text-white font-bold">
            DK
          </div>
          <div className="flex-1">
            <div className="text-sm text-white font-semibold leading-tight">Deepak Kumar</div>
            <div className="text-[0.72rem] text-[#9a8fa0]">Store Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-[#9a8fa0] hover:text-white transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-6 md:px-8 py-8">{children}</main>
    </div>
  );
}
