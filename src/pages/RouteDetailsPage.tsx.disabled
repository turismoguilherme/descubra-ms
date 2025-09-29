import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock, Star, PlayCircle, ImageIcon, ArrowRight } from "lucide-react";
import { tourismRouteService, Route } from "@/services/routes/tourismRouteService";
import { useToast } from "@/hooks/use-toast";

const RouteDetailsPage = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔎 RouteDetailsPage: params", { routeId });
    if (routeId) {
      const fetchRouteDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log("🔄 RouteDetailsPage: fetching route", routeId);
          const fetchedRoute = await tourismRouteService.getRouteById(routeId);
          console.log("✅ RouteDetailsPage: fetched route", fetchedRoute?.id);
          if (fetchedRoute) {
            setRoute(fetchedRoute);
          } else {
            setError("Roteiro não encontrado.");
          }
        } catch (err) {
          console.error("❌ RouteDetailsPage: error fetching route:", err);
          setError("Erro ao carregar detalhes do roteiro. Tente novamente mais tarde.");
          toast({
            title: "Erro",
            description: "Não foi possível carregar os detalhes do roteiro.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchRouteDetails();
    }
  }, [routeId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p>Carregando detalhes do roteiro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-600">
        <p>{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <p>Roteiro não disponível.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="ms-container">
          <h1 className="text-4xl font-bold text-ms-primary-blue mb-6 text-center">{route.name}</h1>
          {route.image_url && (
            <div className="w-full max-h-96 overflow-hidden rounded-lg shadow-lg mb-8">
              <img
                src={route.image_url}
                alt={route.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Sobre o Roteiro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {route.description || "Nenhuma descrição detalhada disponível para este roteiro."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dificuldade</CardTitle>
              </CardHeader>
              <CardContent>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor((route as any).difficulty_level)}`}>
                  {getDifficultyLabel((route as any).difficulty_level)}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Duração Estimada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(route as any).estimated_duration} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pontos de Recompensa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{(route as any).points || 0} pts</p>
              </CardContent>
            </Card>
          </div>

          {route.video_url && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center"><PlayCircle className="mr-2" /> Vídeo do Roteiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  <p>Vídeo: {route.video_url} (Player placeholder)</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-12 mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate(`/ms/passaporte/${routeId}`)} // Redireciona para a experiência do passaporte com o roteiro
            >
              <Star className="mr-3 h-6 w-6" />
              Começar Minha Jornada
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

// Funções auxiliares (copiadas de Roteiros.tsx, para manter a consistência)
const getDifficultyColor = (level: string) => {
  switch (level) {
    case 'facil': return 'bg-green-100 text-green-800';
    case 'medio': return 'bg-yellow-100 text-yellow-800';
    case 'dificil': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyLabel = (level: string) => {
  switch (level) {
    case 'facil': return 'Fácil';
    case 'medio': return 'Médio';
    case 'dificil': return 'Difícil';
    default: return 'N/A';
  }
};

export default RouteDetailsPage; 