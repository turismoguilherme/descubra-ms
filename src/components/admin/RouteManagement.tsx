import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Edit, Trash2, Users, MapPin, Award, Download, Star } from "lucide-react";
import { useRouteManagement } from "@/hooks/useRouteManagement";
import { supabase } from "@/integrations/supabase/client";

interface RouteManagementProps {
  userRegion?: string;
}

const RouteManagement = ({ userRegion }: RouteManagementProps) => {
  const [activeTab, setActiveTab] = useState("routes");
  const { routes, loading, getRouteStatistics } = useRouteManagement(userRegion);
  const [routeStats, setRouteStats] = useState<Record<string, { participants: number; completions: number }>>({});

  // Carregar estatísticas das rotas
  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, { participants: number; completions: number }> = {};
      for (const route of routes) {
        try {
          const stat = await getRouteStatistics(route.id);
          stats[route.id] = {
            participants: stat.uniqueUsers,
            completions: stat.totalCompletions
          };
        } catch (error) {
          stats[route.id] = { participants: 0, completions: 0 };
        }
      }
      setRouteStats(stats);
    };

    if (routes.length > 0) {
      loadStats();
    }
  }, [routes, getRouteStatistics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">Gestão de Roteiros</h2>
          <p className="text-gray-600 mt-1">
            Gerencie roteiros turísticos e gamificação do passaporte digital
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Roteiro
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes">Roteiros</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="completions">Conquistas</TabsTrigger>
          <TabsTrigger value="regions">Regiões</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando rotas...</div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma rota encontrada.</div>
          ) : (
            <div className="grid gap-4">
              {routes.map((route) => {
                const stats = routeStats[route.id] || { participants: 0, completions: 0 };
                const difficultyLabels: Record<string, string> = {
                  'facil': 'Fácil',
                  'medio': 'Médio',
                  'dificil': 'Difícil',
                  'easy': 'Fácil',
                  'medium': 'Médio',
                  'hard': 'Difícil'
                };
                const difficultyLabel = difficultyLabels[route.difficulty_level] || route.difficulty_level;
                
                return (
                  <Card key={route.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {difficultyLabel}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{route.description || 'Sem descrição'}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{route.region || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-gray-400" />
                              <span>{route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{stats.participants} participantes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>{stats.completions} concluídas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-center">Roteiros Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Carregando...</div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nenhuma rota encontrada.</div>
                ) : (
                  <div className="space-y-3">
                    {routes
                      .sort((a, b) => (routeStats[b.id]?.participants || 0) - (routeStats[a.id]?.participants || 0))
                      .slice(0, 3)
                      .map((route, index) => (
                        <div key={route.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium">{route.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{routeStats[route.id]?.participants || 0} participantes</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-center">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Carregando...</div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nenhuma rota encontrada.</div>
                ) : (
                  <div className="space-y-3">
                    {routes.map((route) => {
                      const stats = routeStats[route.id] || { participants: 0, completions: 0 };
                      const completionRate = stats.participants > 0 
                        ? Math.round((stats.completions / stats.participants) * 100) 
                        : 0;
                      return (
                        <div key={route.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{route.name}</span>
                            <span>{completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-center">Roteiros Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-gray-500">Carregando...</div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Nenhuma rota encontrada.</div>
                ) : (
                  <div className="space-y-3">
                    {routes.map((route) => {
                      const stats = routeStats[route.id] || { participants: 0, completions: 0 };
                      return (
                        <div key={route.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{route.name}</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{stats.completions} concluídas</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">Conquistas dos Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando conquistas...</div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Sistema de conquistas será implementado em breve.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando regiões...</div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma região encontrada.</div>
          ) : (
            <div className="grid gap-4">
              {Array.from(new Set(routes.map(r => r.region).filter(Boolean))).map((region) => {
                const regionRoutes = routes.filter(r => r.region === region);
                return (
                  <Card key={region}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{region}</h3>
                            <p className="text-sm text-gray-500">{regionRoutes.length} roteiro(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Ativo
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteManagement;




