import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Trophy, ArrowLeft, CheckCircle } from "lucide-react";

interface PassportRoute {
  id: string;
  name: string;
  location: string;
  difficulty: string;
  duration: number;
  points: number;
  completed: boolean;
  completedAt?: Date;
}

const PassaporteSimple = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<PassportRoute | null>(null);

  // Dados mockados dos roteiros
  const routes: PassportRoute[] = [
    {
      id: "1",
      name: "Roteiro Pantanal - Corumbá",
      location: "Corumbá, MS",
      difficulty: "Fácil",
      duration: 120,
      points: 50,
      completed: true,
      completedAt: new Date("2024-01-15")
    },
    {
      id: "2",
      name: "Bonito - Capital do Ecoturismo",
      location: "Bonito, MS",
      difficulty: "Médio",
      duration: 180,
      points: 75,
      completed: true,
      completedAt: new Date("2024-01-20")
    },
    {
      id: "3",
      name: "Campo Grande - Capital Cultural",
      location: "Campo Grande, MS",
      difficulty: "Fácil",
      duration: 90,
      points: 30,
      completed: false
    },
    {
      id: "4",
      name: "Trilha da Serra da Bodoquena",
      location: "Bonito, MS",
      difficulty: "Difícil",
      duration: 240,
      points: 100,
      completed: false
    },
    {
      id: "5",
      name: "Rota do Peixe - Aquidauana",
      location: "Aquidauana, MS",
      difficulty: "Fácil",
      duration: 150,
      points: 40,
      completed: false
    }
  ];

  const completedRoutes = routes.filter(route => route.completed);
  const totalPoints = completedRoutes.reduce((sum, route) => sum + route.points, 0);
  const totalRoutes = routes.length;
  const completionRate = Math.round((completedRoutes.length / totalRoutes) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Fácil": return "bg-green-500";
      case "Médio": return "bg-yellow-500";
      case "Difícil": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <div className="text-white text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Carregando Passaporte...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Faça login para acessar seu passaporte digital.</p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/ms")}
                className="text-white hover:bg-white/20 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Trophy className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl font-bold text-white">Passaporte Digital</h1>
            </div>
            <p className="text-white/80 text-lg">
              Colecione carimbos e conquiste recompensas únicas!
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-ms-accent-orange mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{completedRoutes.length}</h3>
                <p className="text-white/80">Roteiros Concluídos</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{totalPoints}</h3>
                <p className="text-white/80">Pontos Totais</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{completionRate}%</h3>
                <p className="text-white/80">Taxa de Conclusão</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white">{totalRoutes}</h3>
                <p className="text-white/80">Roteiros Disponíveis</p>
              </CardContent>
            </Card>
          </div>

          {/* Routes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <Card 
                key={route.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  route.completed 
                    ? "bg-green-500/20 border-green-400/50" 
                    : "bg-white/10 backdrop-blur-sm border-white/20"
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-white text-lg">{route.name}</CardTitle>
                    {route.completed && (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  <div className="flex items-center text-white/80 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {route.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(route.difficulty)}>
                        {route.difficulty}
                      </Badge>
                      <div className="flex items-center text-white/80 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration}min
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="font-semibold">{route.points} pontos</span>
                      </div>
                      {route.completed && route.completedAt && (
                        <span className="text-green-400 text-sm">
                          Concluído em {route.completedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Route Details Modal */}
          {selectedRoute && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {selectedRoute.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRoute(null)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedRoute.location}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(selectedRoute.difficulty)}>
                        {selectedRoute.difficulty}
                      </Badge>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedRoute.duration} minutos
                      </div>
                    </div>
                    
                    <div className="flex items-center text-yellow-600">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="font-semibold">{selectedRoute.points} pontos</span>
                    </div>
                    
                    {selectedRoute.completed ? (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-semibold">Roteiro Concluído!</p>
                        {selectedRoute.completedAt && (
                          <p className="text-green-600 text-sm">
                            Concluído em {selectedRoute.completedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button className="w-full bg-ms-accent-orange hover:bg-ms-accent-orange/90">
                        Iniciar Roteiro
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PassaporteSimple;

