"use client";

import { useState } from "react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "subscribed">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("subscribed");
        toast.success("You're subscribed! Stay glowing, gorgeous. ✨");
      } else {
        toast.error(data.error ?? "Could not subscribe. Please try again.");
        setStatus("idle");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <section className="bg-rose-blush px-0">
      <div className="mx-auto max-w-screen-xl px-6 py-20">
        <div
          className="bg-white rounded-[20px] border border-line shadow-soft flex flex-col lg:flex-row items-center justify-between gap-8 px-10 py-10"
          data-testid="newsletter"
        >
          <div className="max-w-md text-center lg:text-left">
            <h2 className="text-2xl mb-2">Stay Glowing with Us ✨</h2>
            <p className="text-muted text-[0.95rem]">
              Subscribe for beauty tips, exclusive offers &amp; early access to
              new products.
            </p>
          </div>
          {status === "subscribed" ? (
            <div className="rounded-full bg-emerald/15 text-emerald font-semibold px-6 py-3 flex items-center gap-2">
              ✔ Subscribed successfully!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <input
                type="email"
                aria-label="Email address"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-full border-2 border-line focus:border-rose px-6 text-[0.95rem] focus:outline-none outline-none w-full sm:w-[300px]"
                data-testid="newsletter-email"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary disabled:opacity-60"
                data-testid="newsletter-submit"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}