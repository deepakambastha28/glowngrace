"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupFormData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    toast.success("Account created successfully!");
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-blush">
          <Sparkles className="h-8 w-8 text-rose" />
        </div>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-charcoal">
          Create <span className="text-gradient italic">Account</span>
        </h1>
        <p className="mt-2 text-charcoal/60">Join the Glow & Grace family</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="name" className="pl-10" {...register("name")} placeholder="Priya Sharma" />
          </div>
          {errors.name && <p className="mt-1 text-sm text-rose">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="email" type="email" className="pl-10" {...register("email")} placeholder="you@example.com" />
          </div>
          {errors.email && <p className="mt-1 text-sm text-rose">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="phone" type="tel" className="pl-10" {...register("phone")} placeholder="+91 98765 43210" />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-rose">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="password" type="password" className="pl-10" {...register("password")} placeholder="••••••••" />
          </div>
          {errors.password && <p className="mt-1 text-sm text-rose">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
            <Input id="confirmPassword" type="password" className="pl-10" {...register("confirmPassword")} placeholder="••••••••" />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-rose">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" className="btn-primary w-full">
          Create Account
        </button>

        <p className="text-center text-sm text-charcoal/60">
          Already have an account?{" "}
          <Link href="/login" className="text-rose font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}