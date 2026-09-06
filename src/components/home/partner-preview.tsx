import Link from "next/link";
import { partners } from "@/lib/data";
import { PartnerCard } from "@/components/partners/partner-card";

export function PartnerPreview() {
  const featured = partners
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <section className="section" data-testid="partners-preview-section">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="section-head">
          <p className="eyebrow">Our Network</p>
          <h2>Featured Partner Parlours</h2>
          <p>
            Premium beauty parlours &amp; salons partnered with{" "}
            <span className="font-semibold">Glow &amp; Grace</span> across
            Lucknow.
          </p>
        </div>
        <div className="partner-grid">
          {featured.map((p) => (
            <PartnerCard key={p.id} partner={p} />
          ))}
        </div>
        <div className="text-center mt-11">
          <Link href="/partners" className="btn-primary">
            View All Partners →
          </Link>
        </div>
      </div>
    </section>
  );
}