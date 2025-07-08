import { useTourismData } from "@/hooks/useTourismData";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, MapPin, Calendar, Building, Globe } from "lucide-react";
import PDFExportButton from "@/components/exports/PDFExportButton";
import { Region } from "@/types/tourism";

const TourismData = () => {
  const { data, loading, error, source, lastUpdate } = useTourismData();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                Erro ao carregar dados de turismo. Tente novamente mais tarde.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const sourceColors = {
    supabase: "bg-green-100 text-green-800",
    mock: "bg-yellow-100 text-yellow-800",
    api: "bg-blue-100 text-blue-800"
  };

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
      title: "Regiões Turísticas",
      value: data.regionsCount || 0,
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: "Municípios",
      value: data.citiesCount || 0,
      icon: Building,
      color: "text-orange-600"
    }
  ];

  // Prepare chart data
  const monthlyData = data.trends?.map(trend => ({
    month: trend.month,
    visitors: trend.visitors,
    revenue: trend.revenue / 1000000 // Convert to millions
  })) || [];

  const regionData = data.regions?.map((region: Region) => ({
    name: region.name,
    visitors: region.visitors,
    growth: region.growth,
    density: region.density || 0
  })) || [];

  const originsData = Object.entries(data.origins || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ageGroupsData = Object.entries(data.demographics?.ageGroups || {})
    .map(([group, count]) => ({ group, count }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  // Fix the servicesData definition - ensure it's always an array
  const servicesData = Array.isArray(data.cadasturServices) 
    ? data.cadasturServices 
    : [];

  // Prepare data for PDF export - convert TourismData to array format
  const pdfExportData = [
    { category: "Visitantes Totais", value: data.totalVisitors?.toLocaleString() || "0" },
    { category: "Taxa de Crescimento", value: `${data.growthRate || 0}%` },
    { category: "Regiões Turísticas", value: data.regionsCount || 0 },
    { category: "Municípios", value: data.citiesCount || 0 },
    { category: "Receita Total", value: `R$ ${(data.revenue / 1000000)}M` },
    ...regionData.map(region => ({
      category: `Região: ${region.name}`,
      value: `${region.visitors.toLocaleString()} visitantes`
    }))
  ];

  const pdfColumns = [
    { header: "Categoria", dataKey: "category" },
    { header: "Valor", dataKey: "value" }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dados do Turismo em MS
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={sourceColors[source]}>
                <Globe className="w-3 h-3 mr-1" />
                Fonte: {source.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                Atualizado: {new Date(lastUpdate).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
          <PDFExportButton 
            data={pdfExportData}
            columns={pdfColumns}
            filename="relatorio-turismo-ms"
            title="Relatório de Turismo - Mato Grosso do Sul"
          />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência Mensal de Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Visitantes']} />
                  <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Regional Data */}
          <Card>
            <CardHeader>
              <CardTitle>Visitantes por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Visitantes']} />
                  <Bar dataKey="visitors" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Origins Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Origem dos Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={originsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {originsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Visitantes']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Age Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Faixa Etária</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroupsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Pessoas']} />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tourism Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Principais Interesses Turísticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data?.interests?.map((interest, index) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                )) || <span className="text-gray-500">Nenhum interesse registrado</span>}
              </div>
            </CardContent>
          </Card>

          {/* CADASTUR Services */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Cadastrados (CADASTUR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {servicesData.length > 0 ? (
                  servicesData.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{service.name}</span>
                      <Badge variant="outline">{service.count}</Badge>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Nenhum serviço cadastrado</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Section */}
        {data.events && data.events.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Principais Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.events.map((event, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{event.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">
                      Data: {new Date(event.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Participantes: {event.attendance.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TourismData;
