
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, MapPin, Calendar } from "lucide-react";
import { TourismData } from "@/types/tourism";

interface TourismStatsSectionProps {
  data?: TourismData;
}

const TourismStatsSection = ({ data }: TourismStatsSectionProps) => {
  // Dados padrão caso data seja undefined
  const defaultData = {
    totalVisitors: 0,
    growthRate: 0,
    interests: [],
    trends: [],
    origins: {}
  };

  const safeData = data || defaultData;

  const stats = [
    {
      title: "Visitantes Totais",
      value: safeData.totalVisitors?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Taxa de Crescimento",
      value: `${safeData.growthRate || 0}%`,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Principais Interesses",
      value: safeData.interests?.length || 0,
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: "Regiões de Origem",
      value: Object.keys(safeData.origins || {}).length,
      icon: Calendar,
      color: "text-orange-600"
    }
  ];

  const monthlyData = safeData.trends?.map(trend => ({
    month: trend.month,
    visitors: trend.visitors,
    revenue: trend.revenue / 1000000 // Converter para milhões
  })) || [];

  const topOrigins = Object.entries(safeData.origins || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, visitors]) => ({ name, visitors }));

  return (
    <section className="py-20 bg-gradient-to-br from-ms-primary-blue/5 via-white to-ms-pantanal-green/5">
      <div className="ms-container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ms-primary-blue mb-4">
            Panorama do Turismo em MS
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dados e estatísticas sobre o desenvolvimento do turismo no estado
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-gradient-to-br from-ms-pantanal-green/10 to-ms-discovery-teal/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-ms-primary-blue group-hover:text-ms-discovery-teal transition-colors">
                    {typeof stat.value === 'number' ? stat.value : stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Gráfico de Tendências Mensais */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-ms-primary-blue mb-2">Visitantes por Mês</h3>
              <p className="text-gray-600">Evolução mensal do número de visitantes</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Visitantes']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#1e40af" 
                  strokeWidth={3}
                  dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Origem dos Visitantes */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-ms-primary-blue mb-2">Principais Origens</h3>
              <p className="text-gray-600">Distribuição dos visitantes por região de origem</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topOrigins} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString(), 'Visitantes']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="visitors" 
                  fill="#059669"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TourismStatsSection;
