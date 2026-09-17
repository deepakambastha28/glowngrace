"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Partner } from "@/lib/data";
import type { HomeTextSection } from "@/lib/home-config";
import { fetchPartners } from "@/lib/api";
import { PartnerCard } from "@/components/partners/partner-card";

export function PartnerPreview({ content }: { content: HomeTextSection }) {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    let active = true;
    fetchPartners().then((res) => {
      if (!active) return;
      if (res.data?.items?.length) setPartners(res.data.items);
    });
    return () => {
      active = false;
    };
  }, []);

  const featured = partners
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="section" data-testid="partners-preview-section">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="section-head">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
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