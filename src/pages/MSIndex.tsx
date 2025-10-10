import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import TourismDescription from "@/components/home/TourismDescription";
import TourismStatsSection from "@/components/home/TourismStatsSection";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";

const MSIndex = () => {
  // Dados mock para evitar loading infinito
  const mockTourismData = {
    totalVisitors: 1250000,
    growthRate: 15.2,
    interests: [
      { name: "Ecoturismo", percentage: 35 },
      { name: "Turismo Rural", percentage: 25 },
      { name: "Turismo Cultural", percentage: 20 },
      { name: "Turismo de Aventura", percentage: 20 }
    ],
    trends: [
      { month: "Jan", visitors: 85000 },
      { month: "Fev", visitors: 92000 },
      { month: "Mar", visitors: 110000 },
      { month: "Abr", visitors: 125000 },
      { month: "Mai", visitors: 140000 },
      { month: "Jun", visitors: 160000 }
    ],
    origins: {
      "São Paulo": 35,
      "Rio de Janeiro": 20,
      "Minas Gerais": 15,
      "Paraná": 10,
      "Outros": 20
    },
    source: "mock",
    lastUpdate: new Date().toISOString()
  };

  return (
    <UniversalLayout>
      <UniversalHero />
      <TourismDescription />
      <TourismStatsSection data={mockTourismData} />
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </UniversalLayout>
  );
};

export default MSIndex;