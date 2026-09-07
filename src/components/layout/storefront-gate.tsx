"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./topbar";
import { Navbar } from "./navbar";

export function StorefrontGate() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <TopBar />
      <Navbar />
    </>
  );
}