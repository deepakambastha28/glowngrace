"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAddJobRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/jobs");
  }, [router]);
  return null;
}