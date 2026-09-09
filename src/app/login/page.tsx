"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Heart, Shield, User, Briefcase, ShoppingBag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuthStore, findRegisteredUser } from "@/lib/auth";

const DEMO_USERS = [
  { email: "shopper@glowngrace.in", password: "shopper123", name: "Priya (Shopper)", role: "user" as const },
  { email: "candidate@glowngrace.in", password: "candidate123", name: "Ananya (Candidate)", role: "candidate" as const },
  { email: "admin@glowngrace.in", password: "admin123", name: "Admin User", role: "admin" as const },
];

const roleRedirect: Record<string, string> = {
  admin: "/admin",
  candidate: "/candidate",
  user: "/shopper",
};

const roleIcon: Record<string, React.ReactNode> = {
  user: <ShoppingBag className="h-4 w-4 mt-0.5 text-gold shrink-0" />,
  candidate: <Briefcase className="h-4 w-4 mt-0.5 text-rose shrink-0" />,
  admin: <Shield className="h-4 w-4 mt-0.5 text-[#3b82c9] shrink-0" />,
};

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [justSignedUp] = useState(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("glow-grace-just-signed-up")
      : null
  );

  const onSubmit = (data: LoginFormData) => {
    // Check demo users first
    const demo = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() &&
        u.password === data.password
    );
    if (demo) {
      signIn({ name: demo.name, email: demo.email, role: demo.role });
      toast.success(`Welcome back, ${demo.name}! ✨`);
      router.push(roleRedirect[demo.role] || "/");
      return;
    }

    // Check registered users
    const registered = findRegisteredUser(data.email, data.password);
    if (registered) {
      signIn({ name: registered.name, email: registered.email, role: registered.role });
      toast.success(`Welcome back, ${registered.name}! ✨`);
      router.push(roleRedirect[registered.role] || "/");
      return;
    }

    toast.error("Invalid email or password. Try the demo credentials below.");
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-blush">
          <Heart className="h-8 w-8 text-rose" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">
          Welcome <span className="text-rose italic">Back</span>
        </h1>
        <p className="mt-2 text-muted">Sign in to your Glow &amp; Grace account</p>
        {justSignedUp && (
          <p className="mt-3 rounded-full bg-emerald/15 px-4 py-2 text-sm text-emerald">
            ✔ Account created! Please sign in.
          </p>
        )}
      </div>

      <div className="mb-6 rounded-[16px] border border-dashed border-gold/50 bg-gold/10 px-4 py-3 text-sm text-charcoal">
        <p className="font-semibold text-gold">Demo credentials</p>
        <div className="mt-2 flex flex-col gap-2">
          {DEMO_USERS.map((u) => (
            <div key={u.email} className="flex items-start gap-2">
              {roleIcon[u.role]}
              <div>
                <p className="font-semibold text-charcoal capitalize">{u.role}</p>
                <p>Email: <span className="font-semibold">{u.email}</span></p>
                <p>Password: <span className="font-semibold">{u.password}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card !rounded-[20px] p-7 space-y-5">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="email" type="email" className="field-input !rounded-full !pl-11" {...register("email")} placeholder="you@example.com" />
          </div>
          {errors.email && <p className="mt-1 text-sm text-rose">{errors.email.message}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="password" type="password" className="field-input !rounded-full !pl-11" {...register("password")} placeholder="••••••••" />
          </div>
          {errors.password && <p className="mt-1 text-sm text-rose">{errors.password.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full">
          Sign In
        </button>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-rose font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
