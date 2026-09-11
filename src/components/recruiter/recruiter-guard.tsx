"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { usePersistReady } from "@/lib/use-persist-ready";

export function RecruiterGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const persistReady = usePersistReady();
  const user = useAuthStore((s) => s.user);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (persistReady) {
      if (user?.role === "recruiter") {
        setChecked(true);
      } else {
        router.replace("/login");
      }
    }
  }, [persistReady, user, router]);

  if (!checked) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#faf5f8]">
        <div className="text-sm text-muted">Checking session…</div>
      </div>
    );
  }

  return <>{children}</>;
}