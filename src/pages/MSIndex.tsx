import { Suspense, lazy } from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import TourismDescription from "@/components/home/TourismDescription";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading para componentes pesados
const TourismStatsSection = lazy(() => import("@/components/home/TourismStatsSection"));

// Dados padrão otimizados para evitar carregamento lento
const defaultTourismData = {
  totalVisitors: 0,
  growthRate: 0,
  interests: [],
  origins: {},
  trends: [],
  demographics: { ageGroups: {}, origins: {} },
  events: [],
  regions: [],
  regionsCount: 0,
  citiesCount: 0,
  cadasturServices: [],
  visitors: 0,
  revenue: 0,
  hotspots: [],
  source: 'mock' as const,
  lastUpdate: new Date().toISOString()
};

// Componente de loading otimizado
const LoadingSkeleton = () => (
  <div className="space-y-8">
    <div className="h-[500px] bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green animate-pulse" />
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
);

const MSIndex = () => {
  return (
    <UniversalLayout>
      <Suspense fallback={<LoadingSkeleton />}>
        <UniversalHero />
        <TourismDescription />
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <TourismStatsSection data={defaultTourismData} />
        </Suspense>
        <DestaquesSection />
        <ExperienceSection />
        <CatsSection />
      </Suspense>
    </UniversalLayout>
  );
};

export default MSIndex;