"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminSession } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    let disposed = false;
    adminSession(controller.signal)
      .then((res) => {
        if (disposed) return;
        const authed = Boolean(res.data?.authed);
        setOk(authed);
        if (!authed) router.replace("/admin");
      })
      .catch(() => {
        if (disposed) return;
        setOk(false);
        router.replace("/admin");
      })
      .finally(() => clearTimeout(timer));
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [router]);

  if (ok === null) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted">
        Loading…
      </div>
    );
  }

  return <>{ok ? children : null}</>;
}
