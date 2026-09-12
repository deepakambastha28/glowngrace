"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { adminSession } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    adminSession().then((res) => {
      if (res.ok && res.data?.authed) {
        setChecked(true);
      } else {
        useAuthStore.getState().signOut();
        router.replace("/login");
      }
    });
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf5f8]">
        <div className="text-sm text-muted">Checking session…</div>
      </div>
    );
  }

  return <>{children}</>;
}