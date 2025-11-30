import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Users,
  Star,
  ArrowRight,
  Compass
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// Removido useRouteManagement - usando query direta

interface PassaporteRoute {
  id: string;
  name: string;
  description: string;
  image: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  duration: string;
  checkpoints: number;
  completed: boolean;
  progress: number;
}

const mockRoutes: PassaporteRoute[] = [
  {
    id: 'rota-pantanal',
    name: 'Rota do Pantanal',
    description: 'Explore a rica biodiversidade do Pantanal Sul.',
    image: '/images/pantanal-route.jpg',
    difficulty: 'Médio',
    duration: '3 dias',
    checkpoints: 8,
    completed: false,
    progress: 25
  },
  {
    id: 'rota-bonito',
    name: 'Rota de Bonito',
    description: 'Descubra as águas cristalinas e cachoeiras de Bonito.',
    image: '/images/bonito-route.jpg',
    difficulty: 'Fácil',
    duration: '2 dias',
    checkpoints: 6,
    completed: true,
    progress: 100
  },
  {
    id: 'rota-dourados',
    name: 'Rota de Dourados',
    description: 'Conheça a cultura e história de Dourados.',
    image: '/images/dourados-route.jpg',
    difficulty: 'Fácil',
    duration: '1 dia',
    checkpoints: 4,
    completed: false,
    progress: 50
  },
  {
    id: 'rota-corumba',
    name: 'Rota de Corumbá',
    description: 'Aventure-se na fronteira com a Bolívia.',
    image: '/images/corumba-route.jpg',
    difficulty: 'Difícil',
    duration: '4 dias',
    checkpoints: 10,
    completed: false,
    progress: 0
  },
  {
    id: 'rota-tres-lagoas',
    name: 'Rota de Três Lagoas',
    description: 'Explore as lagoas e belezas naturais.',
    image: '/images/tres-lagoas-route.jpg',
    difficulty: 'Médio',
    duration: '2 dias',
    checkpoints: 5,
    completed: false,
    progress: 20
  },
  {
    id: 'rota-campo-grande',
    name: 'Rota de Campo Grande',
    description: 'Descubra a capital do estado.',
    image: '/images/campo-grande-route.jpg',
    difficulty: 'Fácil',
    duration: '1 dia',
    checkpoints: 3,
    completed: true,
    progress: 100
  }
];

const PassaporteLista = () => {
  console.log("📱 PASSAPORTE LISTA: Componente PassaporteLista sendo renderizado");
  
  const [routes, setRoutes] = useState<PassaporteRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  // Buscar rotas diretamente, sem usar o hook
  useEffect(() => {
    const loadRoutesDirectly = async () => {
      try {
        console.log("📱 PASSAPORTE LISTA: Carregando rotas diretamente...");
        setLoading(true);
        
        // Usar fetch diretamente para contornar problemas com o cliente Supabase
        const SUPABASE_URL = "https://hvtrpkbjgbuypkskqcqm.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q";
        
        console.log("📱 PASSAPORTE LISTA: Fazendo fetch direto na API REST...");
        
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/routes?is_active=eq.true&order=name`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("📱 PASSAPORTE LISTA: Resposta recebida, status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ PASSAPORTE LISTA: Erro na resposta:", response.status, errorText);
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const routesData = await response.json();

        console.log("📱 PASSAPORTE LISTA: Resultado da query:", {
          routesCount: routesData?.length || 0,
          routes: routesData?.map((r: any) => ({ id: r.id, name: r.name, difficulty: r.difficulty }))
        });
        
        const routesError = null;

        if (routesError) {
          console.error("❌ PASSAPORTE LISTA: Erro ao buscar rotas:", routesError);
          toast({
            title: "Erro",
            description: "Erro ao carregar rotas: " + routesError.message,
            variant: "destructive",
          });
          setRoutes([]);
          setLoading(false);
          return;
        }

        if (!routesData || routesData.length === 0) {
          console.log("📱 PASSAPORTE LISTA: Nenhuma rota encontrada");
          setRoutes([]);
      setLoading(false);
          return;
        }

        // Converter rotas do banco para formato PassaporteRoute
        const formattedRoutes: PassaporteRoute[] = routesData.map(route => {
          // Converter difficulty de inglês para português
          let difficultyText = 'Fácil';
          if (route.difficulty === 'easy') difficultyText = 'Fácil';
          else if (route.difficulty === 'medium') difficultyText = 'Média';
          else if (route.difficulty === 'hard') difficultyText = 'Difícil';

          // Converter estimated_duration de interval para string
          let durationText = 'N/A';
          if (route.estimated_duration) {
            const durationStr = route.estimated_duration.toString();
            if (durationStr.includes('day')) {
              const days = parseInt(durationStr) || 1;
              const hours = days * 24;
              durationText = `${hours}h`;
            } else if (durationStr.includes(':')) {
              const parts = durationStr.split(':');
              const hours = parseInt(parts[0]) || 0;
              const minutes = parseInt(parts[1]) || 0;
              if (hours > 0) {
                durationText = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
              } else {
                durationText = `${minutes}min`;
              }
            }
          }

          return {
            id: route.id,
            name: route.name,
            description: route.description || '',
            image: route.image_url || '/images/default-route.jpg',
            difficulty: difficultyText,
            duration: durationText,
            checkpoints: 0, // Será preenchido depois
            completed: false,
            progress: 0,
          };
        });

        // Buscar checkpoints para cada rota usando fetch direto
        console.log("📱 PASSAPORTE LISTA: Buscando checkpoints para cada rota...");
        
        const routesWithCheckpoints = await Promise.all(
          formattedRoutes.map(async (route) => {
            try {
              const checkpointResponse = await fetch(
                `${SUPABASE_URL}/rest/v1/route_checkpoints?route_id=eq.${route.id}&select=id`,
                {
                  headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'count=exact'
                  }
                }
              );
              
              if (!checkpointResponse.ok) {
                console.warn(`⚠️ Erro ao buscar checkpoints para ${route.name}`);
                return { ...route, checkpoints: 0 };
              }
              
              const checkpoints = await checkpointResponse.json();
              return {
                ...route,
                checkpoints: checkpoints?.length || 0,
              };
            } catch (e) {
              console.warn(`⚠️ Erro ao buscar checkpoints para ${route.name}:`, e);
              return { ...route, checkpoints: 0 };
            }
          })
        );

        console.log("✅ PASSAPORTE LISTA: Rotas carregadas com sucesso:", routesWithCheckpoints.length);
        setRoutes(routesWithCheckpoints);
        setLoading(false);
      } catch (error: any) {
        console.error("❌ PASSAPORTE LISTA: Erro geral:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar rotas: " + (error?.message || 'Erro desconhecido'),
          variant: "destructive",
        });
        setRoutes([]);
        setLoading(false);
      }
    };

    loadRoutesDirectly();
  }, [toast]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    console.log("📱 PASSAPORTE LISTA: Renderizando loading");
    return (
      <UniversalLayout>
        <div className="bg-gray-50 flex items-center justify-center py-16">
          <div className="text-center">
            <Compass className="w-16 h-16 mx-auto mb-4 animate-spin text-ms-primary-blue" />
            <p className="text-lg text-gray-600">Carregando rotas...</p>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  console.log("📱 PASSAPORTE LISTA: Renderizando lista de rotas");

  return (
    <UniversalLayout>
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-ms-primary-blue mb-4">
              Passaporte Digital
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Colecione selos virtuais explorando os destinos únicos de Mato Grosso do Sul
            </p>
          </div>

          {/* Routes Grid */}
          {routes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-lg p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold mb-4">Nenhuma Rota Disponível</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Não há rotas de passaporte configuradas no momento. 
                Configure rotas através do painel administrativo para começar a usar o sistema de passaporte digital.
              </p>
              <Button 
                onClick={() => navigate('/viajar/admin/descubra-ms/passport')}
                className="mt-4"
              >
                Ir para Painel Administrativo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <Card key={route.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-ms-primary-blue to-ms-secondary-green relative">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                  <Badge 
                    className={`absolute top-4 right-4 ${getDifficultyColor(route.difficulty)}`}
                  >
                    {route.difficulty}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{route.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{route.description}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {route.checkpoints} pontos
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{route.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-ms-accent-orange h-2 rounded-full transition-all duration-300"
                          style={{ width: `${route.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      variant={route.completed ? "outline" : "default"}
                      onClick={() => {
                        console.log('🔍 [PassaporteLista] Botão clicado - Rota:', route.id);
                        try {
                          const targetUrl = `/descubramatogrossodosul/passaporte/${route.id}`;
                          console.log('✅ [PassaporteLista] Navegando para:', targetUrl);
                          navigate(targetUrl);
                        } catch (err) {
                          console.error('❌ [PassaporteLista] Erro:', err);
                          window.location.href = `/descubramatogrossodosul/passaporte/${route.id}`;
                        }
                      }}
                    >
                        {route.completed ? 'Ver Detalhes' : 'Iniciar Rota'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}

          {/* Stats Section */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Suas Conquistas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-ms-primary-blue">
                  {routes.filter(r => r.completed).length}
                </div>
                <div className="text-gray-600">Rotas Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ms-accent-orange">
                  {routes.reduce((sum, r) => sum + r.checkpoints, 0)}
                </div>
                <div className="text-gray-600">Pontos Totais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-ms-accent-orange">
                  {routes.reduce((sum, r) => sum + (r.completed ? r.checkpoints : 0), 0)}
                </div>
                <div className="text-gray-600">Selos Coletados</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </UniversalLayout>
  );
};

export default PassaporteLista;