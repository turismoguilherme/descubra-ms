import { useEffect, useState } from "react";
import UniversalLayout from "@/components/layout/UniversalLayout";
import UniversalHero from "@/components/layout/UniversalHero";
import TourismDescription from "@/components/home/TourismDescription";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";
import TourismStatsSection from "@/components/home/TourismStatsSection";
import CommercialPartnersSection from "@/components/home/CommercialPartnersSection";
import { useTourismData } from "@/hooks/useTourismData";
import { Skeleton } from "@/components/ui/skeleton";

const MSIndex = () => {
  const { data, loading, error } = useTourismData();

  if (loading) {
    return (
      <UniversalLayout>
        <div className="h-[500px] bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green animate-pulse" />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </UniversalLayout>
    );
  }

  if (error) {
    console.error("Erro ao carregar dados de turismo:", error);
  }

  // Usar dados padrão se não houver dados carregados
  const tourismData = data || {
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

  return (
    <UniversalLayout>
      <UniversalHero />
      <TourismDescription />
      <TourismStatsSection data={tourismData} />
      <DestaquesSection />
      <ExperienceSection />
      <CommercialPartnersSection />
      <CatsSection />
    </UniversalLayout>
  );
};

export default MSIndex;