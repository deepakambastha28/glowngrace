import { Hero } from "@/components/home/hero";
import { ShopCategories, Bestsellers } from "@/components/home/shop-section";
import { PartnerPreview } from "@/components/home/partner-preview";
import { JobVacancies } from "@/components/home/job-vacancies";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-sections";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <ShopCategories />
      <Bestsellers />
      <PartnerPreview />
      <JobVacancies />
      <CtaBanner />
      <Testimonials />
    </div>
  );
}
