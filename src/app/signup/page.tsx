"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupFormData } from "@/lib/schemas";

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (_data: SignupFormData) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("glow-grace-just-signed-up", "true");
    }
    toast.success("Account created successfully! 🎉");
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-blush">
          <Sparkles className="h-8 w-8 text-rose" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">
          Create <span className="text-rose italic">Account</span>
        </h1>
        <p className="mt-2 text-muted">Join the Glow &amp; Grace family</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card !rounded-[20px] p-7 space-y-5">
        <div>
          <label className="field-label" htmlFor="name">Full Name</label>
          <div className="relative mt-1.5">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="name" className="field-input !rounded-full !pl-11" {...register("name")} placeholder="Priya Sharma" />
          </div>
          {errors.name && <p className="mt-1 text-sm text-rose">{errors.name.message}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="email" type="email" className="field-input !rounded-full !pl-11" {...register("email")} placeholder="you@example.com" />
          </div>
          {errors.email && <p className="mt-1 text-sm text-rose">{errors.email.message}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="phone">Phone Number</label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="phone" type="tel" className="field-input !rounded-full !pl-11" {...register("phone")} placeholder="+91 98765 43210" />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-rose">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="password" type="password" className="field-input !rounded-full !pl-11" {...register("password")} placeholder="••••••••" />
          </div>
          {errors.password && <p className="mt-1 text-sm text-rose">{errors.password.message}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <input id="confirmPassword" type="password" className="field-input !rounded-full !pl-11" {...register("confirmPassword")} placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-rose">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full">
          Create Account
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-rose font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}