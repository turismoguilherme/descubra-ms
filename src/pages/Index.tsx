
import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import TourismDescription from "@/components/home/TourismDescription";
import DestaquesSection from "@/components/home/DestaquesSection";
import ExperienceSection from "@/components/home/ExperienceSection";
import CatsSection from "@/components/home/CatsSection";
import { useTourismData } from "@/hooks/useTourismData";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { loading, error } = useTourismData();

  if (loading) {
    return (
      <Layout>
        <div className="h-[500px] bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green animate-pulse" />
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

  return (
    <Layout>
      <Hero />
      <TourismDescription />
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </Layout>
  );
};

export default Index;
