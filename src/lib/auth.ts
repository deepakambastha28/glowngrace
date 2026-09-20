"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "candidate" | "admin" | "recruiter";

export type MembershipTier = "free" | "pro" | "pro_max";

export const TIER_LABELS: Record<MembershipTier, string> = {
  free: "Free",
  pro: "Pro",
  pro_max: "Pro Max",
};

export const TIER_RANK: Record<MembershipTier, number> = {
  free: 0,
  pro: 1,
  pro_max: 2,
};

export const PRO_MAX_PLACEMENT_CAP = 3;

/** Resolve the active membership tier for a user (expired tiers fall back to free). */
export function activeTier(user: AuthUser | null): MembershipTier {
  if (!user?.tier || user.tier === "free") return "free";
  if (user.tierExpiresAt && Date.parse(user.tierExpiresAt) < Date.now()) return "free";
  return user.tier;
}

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  tier?: MembershipTier;
  tierExpiresAt?: string | null;
  jobsSecuredCount?: number;
}

interface RegisteredUser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

const REGISTERED_USERS_KEY = "glow-grace-registered-users";

function getRegisteredUsers(): RegisteredUser[] {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function registerUser(user: RegisteredUser): boolean {
  const users = getRegisteredUsers();
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    return false;
  }
  users.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  return true;
}

export function findRegisteredUser(email: string, password: string): RegisteredUser | null {
  const users = getRegisteredUsers();
  return (
    users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    ) || null
  );
}

interface AuthStore {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  hasRole: (role: UserRole) => boolean;
  upgradeTier: (tier: MembershipTier) => void;
  incrementJobsSecured: () => void;
}

const TIER_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      hasRole: (role) => get().user?.role === role,
      upgradeTier: (tier) => {
        const user = get().user;
        if (!user) return;
        set({
          user: {
            ...user,
            tier,
            tierExpiresAt: new Date(Date.now() + TIER_DURATION_MS).toISOString(),
          },
        });
      },
      incrementJobsSecured: () => {
        const user = get().user;
        if (!user || user.tier !== "pro_max") return;
        const current = user.jobsSecuredCount ?? 0;
        if (current >= PRO_MAX_PLACEMENT_CAP) return;
        set({ user: { ...user, jobsSecuredCount: Math.min(current + 1, PRO_MAX_PLACEMENT_CAP) } });
      },
    }),
    {
      name: "glow-grace-user",
      skipHydration: true,
    }
  )
);
