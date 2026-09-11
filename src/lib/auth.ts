"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "user" | "candidate" | "admin" | "recruiter";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
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
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      hasRole: (role) => get().user?.role === role,
    }),
    {
      name: "glow-grace-user",
      skipHydration: true,
    }
  )
);
