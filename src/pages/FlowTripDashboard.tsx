import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, User, Map, Trophy, Zap, Star, MessageSquare, Calendar } from 'lucide-react';
import TouristDashboard from '@/components/flowtrip/TouristDashboard';
import PointsSystem from '@/components/flowtrip/PointsSystem';
import DigitalPassport from '@/components/flowtrip/DigitalPassport';
import EventsList from '@/components/flowtrip/EventsList';
import InteractiveMap from '@/components/flowtrip/InteractiveMap';
import AIChat from '@/components/flowtrip/AIChat';
import { FlowTripProvider } from '@/context/FlowTripContext';

const FlowTripDashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <FlowTripProvider>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">FlowTrip Dashboard</h1>
                <p className="text-muted-foreground">
                  Acompanhe sua jornada turística e conquiste novos níveis!
                </p>
              </div>
            </div>
          </div>

          {/* Tabs principais */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="points" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Pontos
              </TabsTrigger>
              <TabsTrigger value="passport" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Passaporte
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <TouristDashboard />
            </TabsContent>

            <TabsContent value="points">
              <PointsSystem />
            </TabsContent>

            <TabsContent value="passport">
              <DigitalPassport />
            </TabsContent>

            <TabsContent value="events">
              <EventsList />
            </TabsContent>

            <TabsContent value="map">
              <InteractiveMap />
            </TabsContent>

            <TabsContent value="ai">
              <AIChat />
            </TabsContent>
          </Tabs>

          {/* Cards de acesso rápido */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Map className="h-5 w-5 text-primary" />
                  Explorar Destinos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Descubra novos lugares e ganhe pontos por cada check-in
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-secondary" />
                  Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Participe de eventos locais e ganhe pontos extras
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-ms-discovery-teal" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Desbloqueie conquistas especiais e mostre suas habilidades
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </FlowTripProvider>
  );
};

export default FlowTripDashboard;