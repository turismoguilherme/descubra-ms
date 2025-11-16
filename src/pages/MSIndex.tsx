import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import TourismDescription from "@/components/home/TourismDescription";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";

const MSIndex = () => {
  return (
    <UniversalLayout>
      <UniversalHero />
      <TourismDescription />
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </UniversalLayout>
  );
};

export default MSIndex;