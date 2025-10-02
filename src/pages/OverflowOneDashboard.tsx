import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  BarChart3, 
  Map, 
  FileText, 
  TrendingUp, 
  Target, 
  Users, 
  Building2,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Eye,
  Download,
  Settings,
  Bell
} from 'lucide-react';
import { IAGuilhermeInterface } from '@/components/ai-assistant/IAGuilhermeInterface';
import { BusinessIntelligenceDashboard } from '@/components/business-intelligence/BusinessIntelligenceDashboard';
import { DataMarketplace } from '@/components/data-marketplace/DataMarketplace';

const userStats = {
  totalServices: 4,
  activeServices: 3,
  monthlyReports: 12,
  aiInteractions: 45,
  inventoryItems: 28,
  totalViews: 1250
};

const recentActivity = [
  {
    id: 1,
    type: 'ai',
    message: 'IA Guilherme gerou relatório de análise de mercado',
    time: '2 min atrás',
    icon: Brain
  },
  {
    id: 2,
    type: 'report',
    message: 'Relatório de ocupação hoteleira exportado',
    time: '15 min atrás',
    icon: FileText
  },
  {
    id: 3,
    type: 'inventory',
    message: 'Novo ativo adicionado ao inventário',
    time: '1 hora atrás',
    icon: Map
  },
  {
    id: 4,
    type: 'analysis',
    message: 'Análise de benchmarking concluída',
    time: '2 horas atrás',
    icon: BarChart3
  }
];

const services = [
  {
    id: 'market-analysis',
    name: 'Análise de Mercado',
    status: 'active',
    usage: 85,
    lastUsed: 'Hoje',
    icon: TrendingUp
  },
  {
    id: 'guilherme-ai',
    name: 'IA Guilherme',
    status: 'active',
    usage: 92,
    lastUsed: '2 min atrás',
    icon: Brain
  },
  {
    id: 'custom-reports',
    name: 'Relatórios Personalizados',
    status: 'active',
    usage: 67,
    lastUsed: 'Ontem',
    icon: FileText
  },
  {
    id: 'asset-mapping',
    name: 'Mapeamento de Ativos',
    status: 'inactive',
    usage: 0,
    lastUsed: 'Nunca',
    icon: Map
  }
];

const OverflowOneDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Empresarial</h1>
              <p className="text-gray-600">Gerencie seus serviços e análises</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="ai">IA Guilherme</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Serviços Ativos</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.activeServices}/{userStats.totalServices}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Relatórios Gerados</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.monthlyReports}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Interações IA</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.aiInteractions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Map className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Itens no Inventário</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.inventoryItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <service.icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-gray-500">Último uso: {service.lastUsed}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(service.status)}>
                            {getStatusLabel(service.status)}
                          </Badge>
                          {service.status === 'active' && (
                            <div className="w-20">
                              <Progress value={service.usage} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <activity.icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab("ai")}
                  >
                    <Brain className="h-6 w-6 mb-2" />
                    <span>Consultar IA</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span>Ver Analytics</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab("reports")}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <span>Gerar Relatório</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab("inventory")}
                  >
                    <Map className="h-6 w-6 mb-2" />
                    <span>Inventário</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IA Guilherme */}
          <TabsContent value="ai">
            <IAGuilhermeInterface />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <BusinessIntelligenceDashboard />
          </TabsContent>

          {/* Relatórios */}
          <TabsContent value="reports">
            <DataMarketplace />
          </TabsContent>

          {/* Inventário */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventário Turístico</CardTitle>
                <p className="text-muted-foreground">
                  Gerencie seus ativos físicos e serviços
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Inventário em Desenvolvimento
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
                  </p>
                  <Button>
                    <Bell className="h-4 w-4 mr-2" />
                    Notificar quando disponível
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OverflowOneDashboard;





