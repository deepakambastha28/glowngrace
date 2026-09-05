import { Hero } from "@/components/home/hero";
import { ShopCategories, Bestsellers } from "@/components/home/shop-section";
import { PlacementServices } from "@/components/home/placement-services";
import { JobVacancies } from "@/components/home/job-vacancies";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner, Newsletter } from "@/components/home/cta-sections";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <ShopCategories />
      <Bestsellers />
      <PlacementServices />
      <JobVacancies />
      <CtaBanner />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
