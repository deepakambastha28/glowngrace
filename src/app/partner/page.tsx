"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Users,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  Flower2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { partnerSchema, type PartnerFormData } from "@/lib/schemas";
import { submitPartnerForm } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serviceOptions = [
  "Hair & Beauty Salon",
  "Makeup Studio",
  "Bridal Studio",
  "Nail Salon",
  "Spa & Wellness",
  "Parlour",
];

const benefits = [
  {
    icon: Users,
    title: "Verified Talent Pool",
    description:
      "Access a growing pool of trained, background-checked beauticians and stylists ready to join your team.",
  },
  {
    icon: Megaphone,
    title: "Free Job Posting",
    description:
      "List vacancies on our platform at no cost and reach thousands of job-seeking beauty professionals.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Salon",
    description:
      "Attract more customers with your partner badge and premium listing across our storefront and channels.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Partnership",
    description:
      "Partner with a trusted Lucknow beauty brand and gain instant credibility in the local market.",
  },
];

const steps = [
  { number: "1", title: "Register", description: "Tell us about your salon in minutes." },
  { number: "2", title: "Get Verified", description: "Our team verifies and onboards your salon." },
  { number: "3", title: "Hire Talent", description: "Post jobs and interview vetted professionals." },
  { number: "4", title: "Grow Together", description: "Get customer leads and grow with us." },
];

function PartnerSuccess() {
  const searchParams = useSearchParams();
  if (!searchParams.get("success")) return null;

  return (
    <div className="mx-auto max-w-screen-xl px-6 pt-16">
      <div className="rounded-[18px] bg-emerald/10 border border-emerald/30 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald shrink-0" />
        <div>
          <p className="font-semibold text-emerald">Partner request received!</p>
          <p className="text-sm text-charcoal/70">
            Thank you for choosing Glow &amp; Grace. Our team will reach out to
            you within 2 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PartnerPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
  });

  const handleOnSubmit = async (data: PartnerFormData) => {
    setSubmitting(true);
    try {
      const res = await submitPartnerForm({
        ownerName: data.ownerName,
        salonName: data.salonName,
        email: data.email,
        phone: data.phone,
        city: data.city,
        services: data.services,
        message: data.message,
      });
      if (!res.ok) {
        toast.error(res.errorMessage ?? "Could not submit. Please try again.");
        return;
      }
    } catch {
      // best-effort — never block the request on persistence
    } finally {
      setSubmitting(false);
    }
    toast.success("Partner request submitted! 🎉");
    router.push("/partner?success=1");
  };

  return (
    <div className="pb-16">
      <div className="breadcrumb">
        <div className="mx-auto max-w-screen-xl px-6 flex flex-wrap items-center gap-2 text-[0.9rem]">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <span className="text-charcoal">Become a Partner</span>
        </div>
      </div>

      <Suspense fallback={null}>
        <PartnerSuccess />
      </Suspense>

      {/* Hero */}
      <div className="bg-rose-blush">
        <div className="mx-auto max-w-screen-xl px-6 pt-14 pb-16 text-center">
          <span className="eyebrow">Partner Program</span>
          <h1 className="mt-3 text-[2.4rem] md:text-[2.8rem] font-bold leading-tight">
            Become a <span className="text-rose italic">Partner</span> Salon
          </h1>
          <p className="mt-3 text-muted max-w-2xl mx-auto text-[1.05rem]">
            Join Lucknow&apos;s trusted beauty network. Post jobs, hire verified
            women professionals, and grow your salon with Glow &amp; Grace.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mx-auto max-w-screen-xl px-6 pt-16">
        <div className="section-head">
          <p className="eyebrow">Why Partner With Us</p>
          <h2>Perks of a Glow &amp; Grace Partnership</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card !rounded-[18px] p-[28px_24px]">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-gradient text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-[1.1rem] mb-2">{title}</h3>
              <p className="text-[0.88rem] text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-screen-xl px-6 pt-16">
        <div className="section-head">
          <p className="eyebrow">How It Works</p>
          <h2>From Sign-Up to Scaling</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-gradient text-[1.5rem] font-bold text-white shadow-gold">
                {step.number}
              </div>
              <h3 className="text-[1.1rem] mb-1.5">{step.title}</h3>
              <p className="text-[0.85rem] text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-screen-xl px-6 pt-16">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
          <div className="rounded-[24px] bg-dark-gradient p-[40px_32px] text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
              <Building2 className="h-7 w-7 text-rose-soft" />
            </div>
            <h2 className="mt-5 text-[1.6rem] font-bold">Let&apos;s Build Your Business</h2>
            <p className="mt-3 text-[#d9cbd8] text-[0.95rem] leading-relaxed">
              Fill in the form and our team will reach out within 2 business
              days to verify your salon and get you onboarded.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "Free partner registration",
                "No commission on hires",
                "Access to trained talent",
                "Premium customer listing",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[0.95rem]">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={handleSubmit(handleOnSubmit)}
            className="card !rounded-[20px] p-6 md:p-8 space-y-5"
            data-testid="partner-form"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="ownerName">Owner Name</label>
                <input id="ownerName" className="field-input" placeholder="e.g. Ritu Sharma" {...register("ownerName")} />
                {errors.ownerName && <p className="mt-1 text-[0.8rem] text-rose">{errors.ownerName.message}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="salonName">Salon / Studio Name</label>
                <input id="salonName" className="field-input" placeholder="e.g. Grace Beauty Lounge" {...register("salonName")} />
                {errors.salonName && <p className="mt-1 text-[0.8rem] text-rose">{errors.salonName.message}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="email">Email Address</label>
                <input id="email" type="email" className="field-input" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="mt-1 text-[0.8rem] text-rose">{errors.email.message}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="phone">Phone Number</label>
                <input id="phone" type="tel" className="field-input" placeholder="+91 98765 43210" {...register("phone")} />
                {errors.phone && <p className="mt-1 text-[0.8rem] text-rose">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="city">City / Area</label>
                <input id="city" className="field-input" placeholder="e.g. Gomti Nagar, Lucknow" {...register("city")} />
                {errors.city && <p className="mt-1 text-[0.8rem] text-rose">{errors.city.message}</p>}
              </div>
              <div>
                <span className="field-label">Primary Service</span>
                <div className="mt-1.5">
                  <Select onValueChange={(v) => setValue("services", v as PartnerFormData["services"])}>
                    <SelectTrigger className="field-input !h-[50px]">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.services && <p className="mt-1 text-[0.8rem] text-rose">{errors.services.message}</p>}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="message">Tell Us About Your Salon</label>
              <textarea
                id="message"
                className="field-textarea min-h-[120px]"
                placeholder="Share your team size, services, and how Glow & Grace can help you grow..."
                {...register("message")}
              />
              {errors.message && <p className="mt-1 text-[0.8rem] text-rose">{errors.message.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded accent-rose"
                {...register("acceptTerms")}
              />
              <span className="text-sm text-charcoal/70">
                I agree to the partner terms &amp; conditions and confirm the
                information provided is accurate.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-rose">{errors.acceptTerms.message}</p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full" data-testid="submit-partner">
              {submitting ? "Submitting…" : "Become a Partner"}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Flower2 className="h-4 w-4 text-rose" />
              No cost to join. Our team replies within 2 business days.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}