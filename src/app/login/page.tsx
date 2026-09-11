"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Heart, Briefcase, ShoppingBag, ShieldCheck, Flower2, Sparkles, UserSearch } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuthStore, findRegisteredUser } from "@/lib/auth";
import { adminLogin } from "@/lib/api";

const DEMO_USERS = [
  { email: "shopper@glowngrace.in", password: "shopper123", name: "Priya (Shopper)", role: "user" as const },
  { email: "candidate@glowngrace.in", password: "candidate123", name: "Ananya (Candidate)", role: "candidate" as const },
  { email: "admin@glowngrace.in", password: "admin123", name: "Deepak (Admin)", role: "admin" as const },
  { email: "recruiter@glowngrace.in", password: "recruiter123", name: "Rahul (Recruiter)", role: "recruiter" as const },
];

const roleRedirect: Record<string, string> = {
  candidate: "/candidate",
  user: "/shopper",
  admin: "/admin",
  recruiter: "/recruiter",
};

const roleIcon: Record<string, React.ReactNode> = {
  user: <ShoppingBag className="h-4 w-4 mt-0.5 text-gold shrink-0" />,
  candidate: <Briefcase className="h-4 w-4 mt-0.5 text-rose shrink-0" />,
  admin: <ShieldCheck className="h-4 w-4 mt-0.5 text-[#3b82c9] shrink-0" />,
  recruiter: <UserSearch className="h-4 w-4 mt-0.5 text-[#2e9e6b] shrink-0" />,
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

  const onSubmit = async (data: LoginFormData) => {
    const establishAdminSession = async (): Promise<boolean> => {
      const res = await adminLogin(data.email, data.password);
      if (res.ok && res.data?.authed) return true;
      toast.error(res.data?.error || "Invalid admin credentials.");
      return false;
    };

    // Check demo users first
    const demo = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === data.email.toLowerCase() &&
        u.password === data.password
    );
    if (demo) {
      if (demo.role === "admin" && !(await establishAdminSession())) {
        return;
      }
      signIn({ name: demo.name, email: demo.email, role: demo.role });
      toast.success(`Welcome back, ${demo.name}! ✨`);
      router.push(roleRedirect[demo.role] || "/");
      return;
    }

    // Check registered users
    const registered = findRegisteredUser(data.email, data.password);
    if (registered) {
      if (registered.role === "admin" && !(await establishAdminSession())) {
        return;
      }
      signIn({ name: registered.name, email: registered.email, role: registered.role });
      toast.success(`Welcome back, ${registered.name}! ✨`);
      router.push(roleRedirect[registered.role] || "/");
      return;
    }

    toast.error("Invalid email or password. Try the demo credentials below.");
  };

  return (
    <div className="grid lg:grid-cols-2 lg:h-[calc(100vh-120px)]">
      {/* Left — Brand visual panel (mirrors the split-panel login in the design reference) */}
      <div
        data-testid="login-brand-panel"
        className="relative hidden overflow-hidden bg-gradient-to-br from-rose via-rose-dark to-[#8a1f47] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-center"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gold/20" />
        <Flower2 className="pointer-events-none absolute left-[30%] top-[16%] h-8 w-8 text-white/20" />
        <Heart className="pointer-events-none absolute right-[20%] top-[38%] h-6 w-6 text-white/15" />
        <Sparkles className="pointer-events-none absolute bottom-[26%] left-[16%] h-7 w-7 text-white/20" />

        <div className="relative z-10">
          <div className="font-heading text-3xl font-bold">
            Glow<span className="text-gold">&amp;</span>Grace
            <span className="mt-1 block font-body text-[0.68rem] font-semibold uppercase tracking-[3px] text-rose-soft">
              Cosmetics · Placement · Careers
            </span>
          </div>

          <h2 className="mt-12 max-w-md text-[2.1rem] leading-[1.25]">
            Discover your <em className="italic text-gold">radiant</em> beauty &amp; career
          </h2>
          <p className="mt-4 max-w-md text-white/90">
            Sign in to shop premium cosmetics, apply for beauty careers, or manage your parlour placements across Lucknow.
          </p>

          <div className="mt-8 flex gap-10">
            <div>
              <h3 className="font-heading text-[1.7rem]">5,000+</h3>
              <p className="text-xs text-white/80">Happy Customers</p>
            </div>
            <div>
              <h3 className="font-heading text-[1.7rem]">200+</h3>
              <p className="text-xs text-white/80">Beauty Placements</p>
            </div>
            <div>
              <h3 className="font-heading text-[1.7rem]">150+</h3>
              <p className="text-xs text-white/80">Partner Parlours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div data-testid="login-form-panel" className="flex items-center justify-center overflow-y-auto px-6 py-10 md:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-blush">
              <Heart className="h-7 w-7 text-rose" />
            </div>
            <h1 className="mt-3 text-2xl font-bold">
              Welcome <span className="text-rose italic">Back</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted">Sign in to your Glow &amp; Grace account</p>
            {justSignedUp && (
              <p className="mt-3 rounded-full bg-emerald/15 px-4 py-2 text-sm text-emerald">
                ✔ Account created! Please sign in.
              </p>
            )}
          </div>

          <div className="mb-6 rounded-[14px] border border-dashed border-gold/50 bg-gold/10 px-4 py-3 text-sm text-charcoal">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">Demo credentials</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {DEMO_USERS.map((u) => (
                <div key={u.email} className="flex items-center gap-2">
                  {roleIcon[u.role]}
                  <span className="w-24 shrink-0 font-semibold text-charcoal capitalize">{u.role}</span>
                  <span className="min-w-0 truncate font-medium text-charcoal">{u.email}</span>
                  <span className="text-muted">/</span>
                  <span className="font-medium text-charcoal">{u.password}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card !rounded-[20px] p-6 space-y-4">
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
      </div>
    </div>
  );
}