import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Edit, Trash2, Users, MapPin, Award, Download } from "lucide-react";

interface RouteManagementProps {
  userRegion?: string;
}

const RouteManagement = ({ userRegion }: RouteManagementProps) => {
  const [activeTab, setActiveTab] = useState("routes");

  // Dados simulados para demonstração
  const mockRoutes = [
    {
      id: '1',
      name: 'Rota Histórica do Centro',
      description: 'Passeio pelos principais pontos históricos da cidade',
      points: 8,
      duration: '4 horas',
      difficulty: 'Fácil',
      participants: 156,
      completions: 89,
      rating: 4.7
    },
    {
      id: '2',
      name: 'Trilha Ecológica do Pantanal',
      description: 'Caminhada pela natureza preservada do Pantanal',
      points: 12,
      duration: '6 horas',
      difficulty: 'Médio',
      participants: 78,
      completions: 45,
      rating: 4.9
    },
    {
      id: '3',
      name: 'Circuito Gastronômico',
      description: 'Degustação da culinária típica regional',
      points: 6,
      duration: '3 horas',
      difficulty: 'Fácil',
      participants: 234,
      completions: 198,
      rating: 4.8
    }
  ];

  const mockRegions = [
    { id: '1', name: 'Centro Histórico', routes: 3, active: true },
    { id: '2', name: 'Zona Sul', routes: 2, active: true },
    { id: '3', name: 'Zona Norte', routes: 1, active: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Roteiros</h2>
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
          <div className="grid gap-4">
            {mockRoutes.map((route) => (
              <Card key={route.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {route.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{route.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{route.points} pontos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span>{route.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{route.participants} participantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{route.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Roteiros Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRoutes
                    .sort((a, b) => b.participants - a.participants)
                    .slice(0, 3)
                    .map((route, index) => (
                      <div key={route.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{route.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{route.participants} participantes</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRoutes.map((route) => (
                    <div key={route.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{route.name}</span>
                        <span>{Math.round((route.completions / route.participants) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(route.completions / route.participants) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockRoutes
                    .sort((a, b) => b.rating - a.rating)
                    .map((route) => (
                      <div key={route.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{route.name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{route.rating}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conquistas dos Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Primeiro Roteiro', description: 'Complete seu primeiro roteiro', earned: 234, total: 500 },
                  { name: 'Explorador', description: 'Complete 5 roteiros diferentes', earned: 89, total: 200 },
                  { name: 'Aventureiro', description: 'Complete 10 roteiros', earned: 45, total: 100 },
                  { name: 'Mestre dos Roteiros', description: 'Complete todos os roteiros', earned: 12, total: 50 },
                  { name: 'Gourmet', description: 'Complete o circuito gastronômico', earned: 156, total: 300 },
                  { name: 'Historiador', description: 'Complete a rota histórica', earned: 198, total: 250 }
                ].map((achievement, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <h4 className="font-medium">{achievement.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{achievement.earned}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(achievement.earned / achievement.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-6">
          <div className="grid gap-4">
            {mockRegions.map((region) => (
              <Card key={region.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{region.name}</h3>
                        <p className="text-sm text-gray-500">{region.routes} roteiros</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        region.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {region.active ? 'Ativo' : 'Inativo'}
                      </span>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteManagement;




