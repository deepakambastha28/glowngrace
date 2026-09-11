"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, Phone, Sparkles, Shield, Briefcase,
  ShoppingBag, ChevronRight, Check, UserSearch,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signupSchema, type SignupFormData } from "@/lib/schemas";
import { registerUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const accountTypes = [
  {
    value: "user" as const,
    label: "Shopper",
    icon: ShoppingBag,
    description: "Browse & buy beauty products, track orders, and manage your cart.",
    features: ["Shop cosmetics & skincare", "Track orders & deliveries", "Save wishlists & favourites"],
    gradient: "from-gold/10 to-[#fbf3e2]/60",
    border: "border-gold/30",
    activeBorder: "border-gold",
    activeBg: "bg-[#fbf3e2]/40",
    iconBg: "bg-[#fbf3e2] text-gold",
    iconActiveBg: "bg-gold text-white",
  },
  {
    value: "candidate" as const,
    label: "Candidate",
    icon: Briefcase,
    description: "Create a profile, showcase your work, and apply for beauty careers.",
    features: ["Build your portfolio", "Showcase gallery of work", "Apply to top salons"],
    gradient: "from-rose/5 to-blush/60",
    border: "border-rose/20",
    activeBorder: "border-rose",
    activeBg: "bg-blush/50",
    iconBg: "bg-blush text-rose",
    iconActiveBg: "bg-rose text-white",
  },
  {
    value: "admin" as const,
    label: "Admin",
    icon: Shield,
    description: "Manage products, jobs, reviews, and candidates from the dashboard.",
    features: ["Full dashboard access", "Manage listings & reviews", "View analytics & reports"],
    gradient: "from-[#e9f1fa]/60 to-white",
    border: "border-[#3b82c9]/20",
    activeBorder: "border-[#3b82c9]",
    activeBg: "bg-[#e9f1fa]/40",
    iconBg: "bg-[#e9f1fa] text-[#3b82c9]",
    iconActiveBg: "bg-[#3b82c9] text-white",
  },
  {
    value: "recruiter" as const,
    label: "Recruiter",
    icon: UserSearch,
    description: "Browse candidate profiles, contact and hire talent for your salon or agency.",
    features: ["View candidate profiles", "Contact & shortlist talent", "Hire & manage placements"],
    gradient: "from-emerald/5 to-[#eaf7f0]/60",
    border: "border-emerald/20",
    activeBorder: "border-emerald",
    activeBg: "bg-[#eaf7f0]/40",
    iconBg: "bg-[#eaf7f0] text-emerald",
    iconActiveBg: "bg-emerald text-white",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("user");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { accountType: "user" },
  });

  const selectType = (value: string) => {
    setSelectedType(value);
    setValue("accountType", value as SignupFormData["accountType"], { shouldValidate: true });
  };

  const onSubmit = (data: SignupFormData) => {
    const ok = registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.accountType,
    });

    if (!ok) {
      toast.error("An account with this email already exists.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("glow-grace-just-signed-up", "true");
    }
    toast.success("Account created successfully! 🎉");
    router.push("/login");
  };

  const activeType = accountTypes.find((t) => t.value === selectedType);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-blush">
            <Sparkles className="h-7 w-7 text-rose" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">
            Create <span className="text-rose italic">Account</span>
          </h1>
          <p className="mt-2 text-muted">Join the Glow &amp; Grace family</p>
        </div>

        {/* 2-Column layout */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
          {/* Left — Account type selector */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Choose your account type</h2>
              <p className="text-sm text-muted mt-1">Select how you want to use Glow &amp; Grace</p>
            </div>

            <div className="space-y-3">
              {accountTypes.map((t) => {
                const active = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => selectType(t.value)}
                    className={cn(
                      "w-full text-left rounded-[16px] border-2 p-5 transition-all duration-200 cursor-pointer",
                      active
                        ? `${t.activeBorder} bg-gradient-to-br ${t.gradient} shadow-md ring-1 ring-black/[0.03]`
                        : `${t.border} bg-white hover:shadow-sm hover:border-line-soft`
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-[11px] transition-colors",
                        active ? t.iconActiveBg : t.iconBg
                      )}>
                        <t.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{t.label}</span>
                          {active && (
                            <div className="grid h-6 w-6 place-items-center rounded-full bg-rose text-white">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.description}</p>
                        {active && (
                          <ul className="mt-3 space-y-1.5">
                            {t.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs text-charcoal/70">
                                <Check className="h-3 w-3 text-rose shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.accountType && (
              <p className="text-sm text-rose">{errors.accountType.message}</p>
            )}


          </div>

          {/* Right — Form */}
          <div className="card !rounded-[20px] p-7 md:p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                {activeType?.label} Registration
              </h2>
              <p className="text-sm text-muted mt-1">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register("accountType")} value={selectedType} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label" htmlFor="name">Full Name</label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
                    <input id="name" className="field-input !rounded-full !pl-11" {...register("name")} placeholder="Priya Sharma" />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-rose">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="phone">Phone Number</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
                    <input id="phone" type="tel" className="field-input !rounded-full !pl-11" {...register("phone")} placeholder="+91 98765 43210" />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-rose">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="email">Email Address</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose" />
                  <input id="email" type="email" className="field-input !rounded-full !pl-11" {...register("email")} placeholder="you@example.com" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-rose">{errors.email.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
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
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  Create {activeType?.label} Account
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>


            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
