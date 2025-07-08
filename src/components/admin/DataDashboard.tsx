
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Download, RefreshCcw, Users, MapPin, Calendar, Star } from "lucide-react";

// Dados fictícios para os gráficos
const regionData = [
  { name: 'Campo Grande', visitors: 12453, checkins: 8734, events: 36, satisfaction: 4.2 },
  { name: 'Bonito', visitors: 28765, checkins: 22543, events: 24, satisfaction: 4.7 },
  { name: 'Pantanal', visitors: 15432, checkins: 11235, events: 18, satisfaction: 4.5 },
  { name: 'Corumbá', visitors: 7865, checkins: 5987, events: 12, satisfaction: 4.3 },
  { name: 'Ponta Porã', visitors: 5432, checkins: 3976, events: 9, satisfaction: 4.1 },
  { name: 'Dourados', visitors: 8976, checkins: 7123, events: 15, satisfaction: 4.4 },
];

const monthlyData = [
  { month: 'Jan', visitors: 6500, satisfaction: 4.3, events: 15 },
  { month: 'Fev', visitors: 7200, satisfaction: 4.2, events: 18 },
  { month: 'Mar', visitors: 8400, satisfaction: 4.4, events: 20 },
  { month: 'Abr', visitors: 9100, satisfaction: 4.5, events: 22 },
  { month: 'Mai', visitors: 11200, satisfaction: 4.6, events: 25 },
  { month: 'Jun', visitors: 13500, satisfaction: 4.7, events: 30 },
  { month: 'Jul', visitors: 18900, satisfaction: 4.8, events: 40 },
  { month: 'Ago', visitors: 17400, satisfaction: 4.7, events: 32 },
  { month: 'Set', visitors: 14300, satisfaction: 4.6, events: 28 },
  { month: 'Out', visitors: 12100, satisfaction: 4.5, events: 25 },
  { month: 'Nov', visitors: 10800, satisfaction: 4.4, events: 22 },
  { month: 'Dez', visitors: 15700, satisfaction: 4.6, events: 35 },
];

const visitorInterests = [
  { name: 'Ecoturismo', value: 35 },
  { name: 'Gastronomia', value: 25 },
  { name: 'Cultural', value: 18 },
  { name: 'Aventura', value: 12 },
  { name: 'Eventos', value: 10 },
];

const visitorOrigins = [
  { name: 'SP', value: 32 },
  { name: 'MS', value: 24 },
  { name: 'PR', value: 15 },
  { name: 'RJ', value: 10 },
  { name: 'MG', value: 8 },
  { name: 'Outros', value: 11 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DataDashboard = () => {
  const [year, setYear] = useState("2025");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // Filtrar dados por região selecionada
  const filteredRegionData = selectedRegion === "all" 
    ? regionData 
    : regionData.filter(region => region.name === selectedRegion);

  // Calcular totais para métricas principais
  const totalVisitors = regionData.reduce((sum, region) => sum + region.visitors, 0);
  const totalCheckins = regionData.reduce((sum, region) => sum + region.checkins, 0);
  const totalEvents = regionData.reduce((sum, region) => sum + region.events, 0);
  const avgSatisfaction = regionData.reduce((sum, region) => sum + region.satisfaction, 0) / regionData.length;

  return (
    <div className="space-y-6">
      {/* Filtros e controles */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-32">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Regiões</SelectItem>
                {regionData.map(region => (
                  <SelectItem key={region.name} value={region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total de Visitantes</p>
                <h3 className="text-2xl font-bold">{totalVisitors.toLocaleString()}</h3>
                <p className="text-xs text-green-600">+12% vs ano anterior</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Check-ins</p>
                <h3 className="text-2xl font-bold">{totalCheckins.toLocaleString()}</h3>
                <p className="text-xs text-green-600">+8% vs ano anterior</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Eventos Cadastrados</p>
                <h3 className="text-2xl font-bold">{totalEvents}</h3>
                <p className="text-xs text-green-600">+15% vs ano anterior</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Satisfação Média</p>
                <h3 className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5</h3>
                <p className="text-xs text-green-600">+0.3 vs ano anterior</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e dados detalhados */}
      <Tabs defaultValue="visitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="regions">Regiões</TabsTrigger>
          <TabsTrigger value="interests">Interesses & Origem</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors">
          <Card>
            <CardHeader>
              <CardTitle>Visitantes por Mês ({year})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      name="Visitantes"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="regions">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredRegionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visitors" name="Visitantes" fill="#8884d8" />
                    <Bar dataKey="checkins" name="Check-ins" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interests">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Interesses dos Visitantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={visitorInterests}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {visitorInterests.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Origem dos Visitantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={visitorOrigins}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {visitorOrigins.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataDashboard;
