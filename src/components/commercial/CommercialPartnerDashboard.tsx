import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, Eye, MousePointer, Calendar, 
  Settings, Upload, Edit, Star, CheckCircle 
} from "lucide-react";
import { useCommercialPartners } from "@/hooks/useCommercialPartners";

export const CommercialPartnerDashboard = () => {
  const { partners, isLoading } = useCommercialPartners();
  
  // Mock data para demonstração
  const metricsData = [
    { name: 'Jan', views: 120, clicks: 24, conversions: 3 },
    { name: 'Fev', views: 150, clicks: 32, conversions: 5 },
    { name: 'Mar', views: 180, clicks: 45, conversions: 8 },
    { name: 'Abr', views: 200, clicks: 38, conversions: 6 },
    { name: 'Mai', views: 250, clicks: 55, conversions: 12 },
    { name: 'Jun', views: 300, clicks: 70, conversions: 15 },
  ];

  const trafficSources = [
    { name: 'Busca Orgânica', value: 40, color: '#8884d8' },
    { name: 'Redes Sociais', value: 30, color: '#82ca9d' },
    { name: 'Links Diretos', value: 20, color: '#ffc658' },
    { name: 'Campanhas', value: 10, color: '#ff7300' },
  ];

  // Simular dados do parceiro atual (primeiro parceiro para demo)
  const currentPartner = partners[0] || {
    company_name: "Minha Empresa",
    subscription_plan: "premium",
    total_views: 1200,
    total_clicks: 280,
    conversion_rate: 8.5,
    status: "approved",
    verified: true,
    featured: false
  };

  const planFeatures = {
    basic: { photos: 5, featured_days: 0, analytics: 'Básico' },
    premium: { photos: 20, featured_days: 10, analytics: 'Avançado' },
    enterprise: { photos: -1, featured_days: 30, analytics: 'Completo' }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações principais */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{currentPartner.company_name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant={currentPartner.subscription_plan === 'enterprise' ? 'default' : 'secondary'}
                >
                  {currentPartner.subscription_plan}
                </Badge>
                {currentPartner.verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                )}
                {currentPartner.featured && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Destaque
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Editar Perfil
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Upload Fotos
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-bold">{currentPartner.total_views?.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliques</p>
                <p className="text-2xl font-bold">{currentPartner.total_clicks?.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{currentPartner.conversion_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +2.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leads Gerados</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +15% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas com detalhes */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="plan">Meu Plano</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualizações e Cliques</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" name="Visualizações" />
                    <Bar dataKey="clicks" fill="#82ca9d" name="Cliques" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fontes de Tráfego</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Conversões ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#ff7300" 
                      strokeWidth={2}
                      name="Conversões"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Conteúdo</CardTitle>
              <p className="text-muted-foreground">
                Gerencie fotos, descrições e informações da sua empresa
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Fotos
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Descrição
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Atualizar Horários
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual: {currentPartner.subscription_plan}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Fotos</h3>
                    <p className="text-2xl font-bold">
                      {planFeatures[currentPartner.subscription_plan as keyof typeof planFeatures]?.photos === -1 
                        ? "Ilimitadas" 
                        : planFeatures[currentPartner.subscription_plan as keyof typeof planFeatures]?.photos}
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Destaque/mês</h3>
                    <p className="text-2xl font-bold">
                      {planFeatures[currentPartner.subscription_plan as keyof typeof planFeatures]?.featured_days} dias
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-semibold">Analytics</h3>
                    <p className="text-2xl font-bold">
                      {planFeatures[currentPartner.subscription_plan as keyof typeof planFeatures]?.analytics}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Upgrade do Plano</Button>
                  <Button variant="outline">Histórico de Pagamentos</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações Gerais
                </Button>
                <Button variant="outline">Alterar Senha</Button>
                <Button variant="outline">Notificações</Button>
                <Button variant="destructive">Cancelar Conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};