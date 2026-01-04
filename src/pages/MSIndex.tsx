import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import DestaquesSection from "@/components/home/DestaquesSection";
import EventosDestaqueSection from "@/components/home/EventosDestaqueSection";
import RoteiroPersonalizadoBanner from "@/components/home/RoteiroPersonalizadoBanner";
import AvataresSection from "@/components/home/AvataresSection";
import CatsSection from "@/components/home/CatsSection";

const MSIndex = () => {
  return (
    <UniversalLayout>
      <UniversalHero />
      <DestaquesSection />
      <EventosDestaqueSection />
      <RoteiroPersonalizadoBanner />
      <AvataresSection />
      <CatsSection />
    </UniversalLayout>
  );
};

export default MSIndex;