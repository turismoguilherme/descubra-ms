
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import TourismDescription from "@/components/home/TourismDescription";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";
import TourismStatsSection from "@/components/home/TourismStatsSection";
import { useTourismData } from "@/hooks/useTourismData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data, loading, error } = useTourismData();

  if (loading) {
    return (
      <Layout>
        <div className="h-[500px] bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green animate-pulse" />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
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
    <Layout>
      <Hero />
      <TourismDescription />
      <TourismStatsSection data={tourismData} />
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </Layout>
  );
};

export default Index;
