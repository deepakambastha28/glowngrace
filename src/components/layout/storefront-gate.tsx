"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./topbar";
import { Navbar } from "./navbar";

export function StorefrontGate() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/recruiter")) {
    return null;
  }

  return (
    <>
      <TopBar />
      <Navbar />
    </>
  );
}