import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, MapPin, FileText, Download, Eye, Users, DollarSign } from 'lucide-react';

const swotData = {
  strengths: ["Localização privilegiada", "Atendimento diferenciado", "Preços competitivos"],
  weaknesses: ["Marketing digital limitado", "Baixa presença online", "Sazonalidade alta"],
  opportunities: ["Crescimento do ecoturismo", "Turismo de aventura", "Eventos corporativos"],
  threats: ["Concorrência crescente", "Mudanças climáticas", "Instabilidade econômica"]
};

const performanceData = [
  { month: 'Jan', receita: 45000, visitantes: 320, ocupacao: 65 },
  { month: 'Fev', receita: 52000, visitantes: 380, ocupacao: 78 },
  { month: 'Mar', receita: 48000, visitantes: 350, ocupacao: 72 },
  { month: 'Abr', receita: 55000, visitantes: 420, ocupacao: 85 },
  { month: 'Mai', receita: 62000, visitantes: 480, ocupacao: 92 },
  { month: 'Jun', receita: 58000, visitantes: 440, ocupacao: 88 }
];

const segmentData = [
  { name: 'Turismo de Lazer', value: 45, color: '#8B5CF6' },
  { name: 'Negócios', value: 25, color: '#10B981' },
  { name: 'Eventos', value: 20, color: '#F59E0B' },
  { name: 'Ecoturismo', value: 10, color: '#EF4444' }
];

export function BusinessIntelligenceDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Intelligence</h1>
            <p className="text-muted-foreground">Ferramentas de análise empresarial para o turismo</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        <Tabs defaultValue="diagnostico" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="diagnostico">Diagnóstico SWOT</TabsTrigger>
            <TabsTrigger value="inventario">Inventário Turístico</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostico" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Forças
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {swotData.strengths.map((item, index) => (
                      <li key={index} className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <Target className="h-5 w-5 mr-2" />
                    Fraquezas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {swotData.weaknesses.map((item, index) => (
                      <li key={index} className="flex items-center text-red-600">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-700">
                    <Eye className="h-5 w-5 mr-2" />
                    Oportunidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {swotData.opportunities.map((item, index) => (
                      <li key={index} className="flex items-center text-blue-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <Users className="h-5 w-5 mr-2" />
                    Ameaças
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {swotData.threats.map((item, index) => (
                      <li key={index} className="flex items-center text-orange-600">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventario" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Atrativos Mapeados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">24</div>
                  <p className="text-muted-foreground">Pontos turísticos catalogados</p>
                  <Progress value={80} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Serviços Registrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">156</div>
                  <p className="text-muted-foreground">Produtos e serviços</p>
                  <Progress value={65} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Valor Estimado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">R$ 2.4M</div>
                  <p className="text-muted-foreground">Potencial de receita</p>
                  <Progress value={90} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="receita" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Segmentação de Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Relatório Mensal", desc: "Análise completa do mês", price: "R$ 99", badge: "Básico" },
                { title: "Estudo de Mercado", desc: "Análise competitiva detalhada", price: "R$ 299", badge: "Premium" },
                { title: "Previsão de Demanda", desc: "Projeções para próximos 6 meses", price: "R$ 499", badge: "Enterprise" },
                { title: "Perfil do Turista", desc: "Segmentação e comportamento", price: "R$ 199", badge: "Premium" },
                { title: "Benchmark Competitivo", desc: "Comparação com concorrentes", price: "R$ 399", badge: "Enterprise" },
                { title: "ROI de Marketing", desc: "Análise de campanhas", price: "R$ 149", badge: "Básico" }
              ].map((report, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <Badge variant="outline">{report.badge}</Badge>
                    </div>
                    <CardDescription>{report.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{report.price}</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Solicitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}