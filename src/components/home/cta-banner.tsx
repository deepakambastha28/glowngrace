import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-screen-xl px-6">
        <div
          className="rounded-[28px] bg-rose-gradient px-8 py-[55px] text-center shadow-rose-lg relative overflow-hidden"
          data-testid="cta-banner"
        >
          <span className="pointer-events-none absolute top-[-30px] left-6 text-[5rem] opacity-20">
            ✿
          </span>
          <span className="pointer-events-none absolute bottom-[-30px] right-8 text-[5rem] opacity-20">
            ✿
          </span>
          <h2 className="text-white text-[2rem] md:text-[2.4rem] mb-3">
            Ready to Begin Your Beauty Journey?
          </h2>
          <p className="text-white/85 text-[1.05rem] mb-8 max-w-xl mx-auto">
            Whether you&apos;re shopping for the perfect glow or searching for
            your dream beauty career, Glow &amp; Grace is here for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products" className="btn btn-light">
              Get Started Today
            </Link>
            <Link href="/careers" className="btn btn-gold">
              Explore Careers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}