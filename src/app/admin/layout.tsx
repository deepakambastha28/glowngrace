"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Briefcase, MessageSquare, Plus, LogOut } from "lucide-react";
import { adminLogout } from "@/lib/api";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/products/new", label: "Add Product", icon: Plus },
      { href: "/admin/jobs/new", label: "Add Job", icon: Plus },
      { href: "/admin/reviews/new", label: "Add Review", icon: Plus },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar px-4 py-6">
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
