import { FeaturedRail } from "@/components/home/featured-rail";
import {
  CategoryGrid,
  CateringCta,
  Faq,
  Gallery,
  Hero,
  RewardsTeaser,
  Testimonials,
  VisitUs,
  Welcome,
  WhyMitea,
} from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedRail />
      <Welcome />
      <CategoryGrid />
      <Gallery />
      <CateringCta />
      <WhyMitea />
      <VisitUs />
      <Testimonials />
      <Faq />
      <RewardsTeaser />
    </>
  );
}
