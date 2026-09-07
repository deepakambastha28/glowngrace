"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  name: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "glow-grace-user",
      skipHydration: true,
    }
  )
);