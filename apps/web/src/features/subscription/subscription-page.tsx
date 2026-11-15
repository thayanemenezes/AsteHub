import { banners, vehicles } from "./content";
import { AboutSection } from "./components/about-section";
import { Advantages } from "./components/advantages";
import { BannerCarousel } from "./components/banner-carousel";
import { FaqSummary } from "./components/faq-summary";
import { HowItWorks } from "./components/how-it-works";
import { PlanCalculator } from "./components/plan-calculator";
import { VehicleSlider } from "./components/vehicle-slider";

export function SubscriptionPage() {
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
