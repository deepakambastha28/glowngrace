"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Heart, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
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

  const onSubmit = (_data: LoginFormData) => {
    toast.success("Welcome back! (Demo login)");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-blush">
          <Heart className="h-8 w-8 text-rose" />
        </div>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-charcoal">
          Welcome <span className="text-gradient italic">Back</span>
        </h1>
        <p className="mt-2 text-charcoal/60">Sign in to your Glow & Grace account</p>
        {justSignedUp && (
          <p className="mt-3 rounded-xl bg-emerald/10 px-4 py-2 text-sm text-emerald">
            Account created! Please sign in.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="email" type="email" className="pl-10" {...register("email")} placeholder="you@example.com" />
          </div>
          {errors.email && <p className="mt-1 text-sm text-rose">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="password" type="password" className="pl-10" {...register("password")} placeholder="••••••••" />
          </div>
          {errors.password && <p className="mt-1 text-sm text-rose">{errors.password.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full">
          Sign In
        </button>

        <p className="text-center text-sm text-charcoal/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-rose font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}