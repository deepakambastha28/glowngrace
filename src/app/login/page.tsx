"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/schemas";

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
    toast.success("Welcome back, gorgeous! ✨ (Demo login)");
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