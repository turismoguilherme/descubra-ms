import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import TourismDescription from "@/components/home/TourismDescription";
import TourismStatsSection from "@/components/home/TourismStatsSection";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";
import { useTourismData } from "@/hooks/useTourismData";

const MSIndex = () => {
  const { data: tourismData, isLoading } = useTourismData();

  return (
    <UniversalLayout>
      <UniversalHero />
      <TourismDescription />
      <TourismStatsSection data={tourismData} />
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </UniversalLayout>
  );
};

export default MSIndex;