
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, MapPin, Calendar } from "lucide-react";
import { TourismData } from "@/types/tourism";

interface TourismStatsSectionProps {
  data: TourismData;
}

const TourismStatsSection = ({ data }: TourismStatsSectionProps) => {
  const stats = [
    {
      title: "Visitantes Totais",
      value: data.totalVisitors?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Taxa de Crescimento",
      value: `${data.growthRate || 0}%`,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Principais Interesses",
      value: data.interests?.length || 0,
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: "Regiões de Origem",
      value: Object.keys(data.origins || {}).length,
      icon: Calendar,
      color: "text-orange-600"
    }
  ];

  const monthlyData = data.trends?.map(trend => ({
    month: trend.month,
    visitors: trend.visitors,
    revenue: trend.revenue / 1000000 // Converter para milhões
  })) || [];

  const topOrigins = Object.entries(data.origins || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, visitors]) => ({ name, visitors }));

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Panorama do Turismo em MS
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dados e estatísticas sobre o desenvolvimento do turismo no estado
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof stat.value === 'number' ? stat.value : stat.value}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Tendências Mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Visitantes por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Visitantes']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Origem dos Visitantes */}
          <Card>
            <CardHeader>
              <CardTitle>Principais Origens</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topOrigins} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Visitantes']}
                  />
                  <Bar 
                    dataKey="visitors" 
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Destaques dos Interesses */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Principais Interesses Turísticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.interests?.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {interest}
                </span>
              )) || <span className="text-gray-500">Nenhum interesse registrado</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TourismStatsSection;
