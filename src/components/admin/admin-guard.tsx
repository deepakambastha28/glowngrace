"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminSession } from "@/lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    adminSession()
      .then((res) => {
        const authed = Boolean(res.data?.authed);
        setOk(authed);
        if (!authed) router.replace("/admin");
      })
      .catch(() => {
        setOk(false);
        router.replace("/admin");
      });
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
