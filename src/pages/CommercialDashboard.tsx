import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CommercialPartnerDashboard } from "@/components/commercial/CommercialPartnerDashboard";
import { BusinessIntelligenceDashboard } from "@/components/business-intelligence/BusinessIntelligenceDashboard";
import { IAGuilhermeInterface } from "@/components/ai-assistant/IAGuilhermeInterface";
import { DataMarketplace } from "@/components/data-marketplace/DataMarketplace";
import { Building2, BarChart3, Bot, ShoppingCart, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';

const stats = [
  {
    title: "Parceiros Ativos",
    value: "1,247",
    change: "+12%",
    icon: Building2,
    color: "bg-blue-500"
  },
  {
    title: "Receita Mensal",
    value: "R$ 456K",
    change: "+8%",
    icon: DollarSign,
    color: "bg-green-500"
  },
  {
    title: "Consultas IA",
    value: "3,892",
    change: "+23%",
    icon: Bot,
    color: "bg-purple-500"
  },
  {
    title: "Relatórios Vendidos",
    value: "234",
    change: "+15%",
    icon: BarChart3,
    color: "bg-orange-500"
  }
];

const recentActivities = [
  {
    type: "partner",
    message: "Novo parceiro cadastrado: Hotel Fazenda Pantanal",
    time: "2 min atrás",
    icon: Building2
  },
  {
    type: "ai",
    message: "Guilherme gerou 15 relatórios personalizados",
    time: "5 min atrás",
    icon: Bot
  },
  {
    type: "sale",
    message: "Relatório 'Perfil do Turista MS' vendido",
    time: "10 min atrás",
    icon: ShoppingCart
  },
  {
    type: "upgrade",
    message: "Parceiro atualizou para plano Premium",
    time: "15 min atrás",
    icon: TrendingUp
  }
];

export default function CommercialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Comercial</h1>
            <p className="text-muted-foreground">Central de controle da plataforma comercial Overflow One</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Sistema Online
            </Badge>
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              <Eye className="h-4 w-4 mr-2" />
              Ver Relatórios
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="partners">Parceiros</TabsTrigger>
            <TabsTrigger value="bi">Business Intelligence</TabsTrigger>
            <TabsTrigger value="ai">Guilherme</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-8 h-8 rounded-full ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change} este mês
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance dos Módulos</CardTitle>
                    <CardDescription>Status e métricas dos principais componentes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Portal de Parceiros</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={85} className="w-20" />
                          <span className="text-xs text-muted-foreground">85%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Business Intelligence</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={92} className="w-20" />
                          <span className="text-xs text-muted-foreground">92%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Guilherme</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={78} className="w-20" />
                          <span className="text-xs text-muted-foreground">78%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">Marketplace de Dados</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={67} className="w-20" />
                          <span className="text-xs text-muted-foreground">67%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Acesso Rápido</CardTitle>
                    <CardDescription>Funcionalidades principais da plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("partners")}
                      >
                        <Building2 className="h-6 w-6 mb-2" />
                        <span>Gerenciar Parceiros</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("bi")}
                      >
                        <BarChart3 className="h-6 w-6 mb-2" />
                        <span>Analytics</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("ai")}
                      >
                        <Bot className="h-6 w-6 mb-2" />
                        <span>Consultar IA</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={() => setActiveTab("marketplace")}
                      >
                        <ShoppingCart className="h-6 w-6 mb-2" />
                        <span>Marketplace</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Atividades Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {activity.message}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="partners">
            <CommercialPartnerDashboard />
          </TabsContent>

          <TabsContent value="bi">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          <TabsContent value="ai">
            <IAGuilhermeInterface />
          </TabsContent>

          <TabsContent value="marketplace">
            <DataMarketplace />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}