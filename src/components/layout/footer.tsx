import Link from "next/link";

const shopLinks = [
  { label: "Makeup", href: "/products?category=Makeup" },
  { label: "Skincare", href: "/products?category=Skincare" },
  { label: "Fragrances", href: "/products?category=Fragrances" },
  { label: "Nail Care", href: "/products?category=Nail Care" },
];

const careersLinks = [
  { label: "Find Jobs", href: "/careers" },
  { label: "Skill Training", href: "/#services" },
  { label: "Hire Talent", href: "/#services" },
  { label: "Success Stories", href: "/#testimonials" },
];

export function Footer() {
  return (
    <footer className="bg-charcoal text-[#d9cbd8] pt-14 pb-6">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <div className="font-heading text-2xl font-bold text-white">
              Glow<span className="text-gold">&amp;</span>Grace
            </div>
            <p className="mt-4 text-[0.9rem] leading-relaxed max-w-xs">
              Lucknow&apos;s trusted destination for premium women&apos;s cosmetics
              and beauty career placement services. Empowering beauty, inside and
              out.
            </p>
          </div>

          <div>
            <h4 className="text-white text-[1.05rem] mb-5">Shop</h4>
            <ul className="space-y-2.5 text-[0.9rem]">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-rose-soft transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[1.05rem] mb-5">Careers</h4>
            <ul className="space-y-2.5 text-[0.9rem]">
              {careersLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-rose-soft transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[1.05rem] mb-5">Contact Us</h4>
            <ul className="space-y-3 text-[0.9rem]">
              <li className="flex gap-2.5 items-start">
                <span>📍</span> Hazratganj, Lucknow, UP 226001
              </li>
              <li className="flex gap-2.5 items-start">
                <span>📞</span> +91 98765 43210
              </li>
              <li className="flex gap-2.5 items-start">
                <span>✉️</span> hello@glowandgrace.in
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-[0.85rem] opacity-70">
          © 2026 Glow &amp; Grace, Lucknow. All rights reserved. | Privacy Policy |
          Terms of Service
        </div>
      </div>
    </footer>
  );
}