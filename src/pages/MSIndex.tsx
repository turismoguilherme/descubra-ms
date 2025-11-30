import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";

const MSIndex = () => {
  return (
    <UniversalLayout>
      <UniversalHero />
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </UniversalLayout>
  );
};

export default MSIndex;