
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MapPin, Award, Calendar } from "lucide-react";
import { TouristRoute } from "@/types/passport";

interface RoutePerformanceProps {
  routes: TouristRoute[];
  userRegion?: string;
}

const RoutePerformance = ({ routes, userRegion }: RoutePerformanceProps) => {
  const [performanceData, setPerformanceData] = useState({
    totalRoutes: 0,
    totalParticipants: 0,
    averageCompletionRate: 0,
    mostPopularRoute: null as TouristRoute | null,
  });

  useEffect(() => {
    if (routes.length > 0) {
      const totalParticipants = routes.reduce((sum, route) => sum + (route.total_participants || 0), 0);
      const totalCompletionRate = routes.reduce((sum, route) => sum + (route.completion_rate || 0), 0);
      const averageCompletionRate = totalCompletionRate / routes.length;
      const mostPopular = routes.reduce((prev, current) => 
        (current.total_participants || 0) > (prev.total_participants || 0) ? current : prev
      );

      setPerformanceData({
        totalRoutes: routes.length,
        totalParticipants,
        averageCompletionRate: Math.round(averageCompletionRate),
        mostPopularRoute: mostPopular,
      });
    }
  }, [routes]);

  const chartData = routes.map(route => ({
    name: route.name.length > 15 ? route.name.substring(0, 15) + "..." : route.name,
    participantes: route.total_participants || 0,
    conclusao: route.completion_rate || 0,
  }));

  const difficultyData = routes.reduce((acc, route) => {
    const difficulty = route.difficulty_level;
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const difficultyChartData = Object.entries(difficultyData).map(([key, value]) => ({
    name: key === 'facil' ? 'Fácil' : key === 'medio' ? 'Médio' : 'Difícil',
    value,
  }));

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Roteiros</p>
                <p className="text-2xl font-bold">{performanceData.totalRoutes}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Participantes</p>
                <p className="text-2xl font-bold">{performanceData.totalParticipants}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa Média de Conclusão</p>
                <p className="text-2xl font-bold">{performanceData.averageCompletionRate}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Roteiro Mais Popular</p>
                <p className="text-sm font-bold line-clamp-2">
                  {performanceData.mostPopularRoute?.name || "N/A"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Participantes por Roteiro */}
        <Card>
          <CardHeader>
            <CardTitle>Participantes por Roteiro</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participantes" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição por Dificuldade */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Dificuldade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Conclusão por Roteiro */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conclusão por Roteiro</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Conclusão']} />
              <Bar dataKey="conclusao" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lista Detalhada de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{route.name}</h4>
                  <p className="text-sm text-gray-600">{route.region}</p>
                </div>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {route.total_participants || 0}
                    </div>
                    <div className="text-xs text-gray-500">Participantes</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {route.completion_rate || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Conclusão</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">
                      {route.estimated_duration}min
                    </div>
                    <div className="text-xs text-gray-500">Duração</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutePerformance;
