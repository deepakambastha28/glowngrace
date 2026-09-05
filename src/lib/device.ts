"use client";

let cached: string | null = null;

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  if (cached) return cached;
  try {
    let id = window.localStorage.getItem("glow-grace-device-id");
    if (!id) {
      id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem("glow-grace-device-id", id);
    }
    cached = id;
    return id;
  } catch {
    return "";
  }
}