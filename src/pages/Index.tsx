
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
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data, loading, error } = useTourismData();
  const { user } = useAuth();

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
      
      {/* FlowTrip Section */}
      {user && (
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-secondary text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Novidade
                    </Badge>
                    <CardTitle className="text-3xl mb-2">
                      Descubra o FlowTrip
                    </CardTitle>
                    <p className="text-white/90 text-lg">
                      Transforme sua experiência turística em uma jornada gamificada
                    </p>
                  </div>
                  <Trophy className="h-16 w-16 text-white/80" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-white/80" />
                    <h3 className="font-semibold mb-1">Sistema de Pontos</h3>
                    <p className="text-sm text-white/70">
                      Ganhe pontos por cada destino visitado
                    </p>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 mx-auto mb-2 text-white/80" />
                    <h3 className="font-semibold mb-1">Níveis & Conquistas</h3>
                    <p className="text-sm text-white/70">
                      Evolua de Iniciante a Mestre
                    </p>
                  </div>
                  <div className="text-center">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-white/80" />
                    <h3 className="font-semibold mb-1">Passaporte Digital</h3>
                    <p className="text-sm text-white/70">
                      Colecione selos únicos
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/flowtrip">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="text-lg px-8 py-4 w-full sm:w-auto"
                    >
                      Conhecer FlowTrip
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/flowtrip/dashboard">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                    >
                      Meu Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
      
      <DestaquesSection />
      <ExperienceSection />
      <CatsSection />
    </Layout>
  );
};

export default Index;
