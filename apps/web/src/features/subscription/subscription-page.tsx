import { AboutSection } from "./components/about-section";
import { Advantages } from "./components/advantages";
import { BannerCarousel } from "./components/banner-carousel";
import { FaqSummary } from "./components/faq-summary";
import { HowItWorks } from "./components/how-it-works";
import { PlanCalculator } from "./components/plan-calculator";
import { VehicleSlider } from "./components/vehicle-slider";
import { banners } from "./content";
import type { PublicVehicle } from "./public-site-api";

export function SubscriptionPage({ vehicles }: { vehicles: PublicVehicle[] }) {
  return (
    <main>
      <BannerCarousel banners={banners} />
      <VehicleSlider vehicles={vehicles} />
      <HowItWorks />
      <Advantages />
      <PlanCalculator />
      <AboutSection />
      <FaqSummary />
    </main>
  );
}
