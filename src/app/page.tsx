import { Fragment } from "react";
import { Hero } from "@/components/home/hero";
import { ShopCategories, Bestsellers } from "@/components/home/shop-section";
import { PartnerPreview } from "@/components/home/partner-preview";
import { JobVacancies } from "@/components/home/job-vacancies";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-sections";
import { getHomeConfig } from "@/lib/home-config-server";
import type { HomeConfig } from "@/lib/home-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const config = await getHomeConfig();

  const sections: Record<HomeConfig["sections"][number]["key"], React.ReactNode> = {
    hero: <Hero content={config.hero} />,
    categories: <ShopCategories content={config.categories} />,
    bestsellers: <Bestsellers content={config.bestsellers} />,
    partners: <PartnerPreview content={config.partners} />,
    jobs: <JobVacancies content={config.jobs} />,
    cta: <CtaBanner content={config.cta} />,
    testimonials: <Testimonials content={config.testimonials} />,
  };

  return (
    <div className="w-full">
      {config.sections
        .filter((section) => section.visible)
        .map((section) => (
          <Fragment key={section.key}>{sections[section.key]}</Fragment>
        ))}
    </div>
  );
}
