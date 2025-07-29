import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Building2,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Edit,
  Plus,
  Bot,
  Brain,
  AlertTriangle,
  Clock,
  Download,
  Bell,
  Award
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import ChatInterface from '@/components/ai/ChatInterface';
import AdvancedAnalyticsDashboard from '@/components/ai/AdvancedAnalyticsDashboard';
import ReportGenerator from '@/components/ai/ReportGenerator';
import AlertsAndRecommendations from '@/components/ai/AlertsAndRecommendations';
import TourismHeatmap from '@/components/management/TourismHeatmap';
import CommunityContributionsManager from '@/components/admin/CommunityContributionsManager';
import RouteManagement from '@/components/admin/RouteManagement';

const RegionalDashboard = () => {
  const { cityId, regionId, getDisplayName } = useRoleBasedAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [regionalStats] = useState([
    {
      title: 'Cidades na Região',
      value: '8',
      change: '+0',
      icon: <Building2 className="h-6 w-6 text-blue-600" />,
      description: 'Municípios da região turística'
    },
    {
      title: 'Destinos Ativos',
      value: '45',
      change: '+5',
      icon: <MapPin className="h-6 w-6 text-green-600" />,
      description: 'Destinos turísticos regionais'
    },
    {
      title: 'Visitantes Regionais',
      value: '1.234',
      change: '+15%',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      description: 'Turistas na região hoje'
    },
    {
      title: 'Receita Regional',
      value: 'R$ 156.8k',
      change: '+12%',
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      description: 'Receita turística mensal'
    }
  ]);

  const [cities] = useState([
    {
      id: 1,
      name: 'Corumbá',
      status: 'active',
      destinations: 12,
      visitors: 456,
      revenue: 'R$ 45.2k',
      lastUpdate: '1 hora atrás'
    },
    {
      id: 2,
      name: 'Aquidauana',
      status: 'active',
      destinations: 8,
      visitors: 234,
      revenue: 'R$ 23.1k',
      lastUpdate: '2 horas atrás'
    },
    {
      id: 3,
      name: 'Miranda',
      status: 'active',
      destinations: 6,
      visitors: 189,
      revenue: 'R$ 18.9k',
      lastUpdate: '3 horas atrás'
    },
    {
      id: 4,
      name: 'Anastácio',
      status: 'maintenance',
      destinations: 4,
      visitors: 67,
      revenue: 'R$ 6.7k',
      lastUpdate: '1 dia atrás'
    }
  ]);

  const [regionalEvents] = useState([
    {
      id: 1,
      name: 'Festival do Pantanal',
      date: '20-25 Julho',
      status: 'upcoming',
      attendees: 2500,
      location: 'Corumbá',
      cities: ['Corumbá', 'Aquidauana', 'Miranda']
    },
    {
      id: 2,
      name: 'Rota Gastronômica',
      date: '15-17 Agosto',
      status: 'planning',
      attendees: 1200,
      location: 'Região Pantanal',
      cities: ['Corumbá', 'Aquidauana']
    },
    {
      id: 3,
      name: 'Ecoturismo Regional',
      date: '5-10 Setembro',
      status: 'upcoming',
      attendees: 800,
      location: 'Miranda',
      cities: ['Miranda', 'Anastácio']
    }
  ]);

  const [quickActions] = useState([
    {
      name: 'Gerenciar Cidades',
      description: 'Administrar municípios da região',
      icon: <Building2 className="h-4 w-4" />,
      action: 'manage-cities'
    },
    {
      name: 'Criar Evento Regional',
      description: 'Organizar evento para toda região',
      icon: <Calendar className="h-4 w-4" />,
      action: 'create-regional-event'
    },
    {
      name: 'Relatórios Regionais',
      description: 'Visualizar analytics da região',
      icon: <BarChart3 className="h-4 w-4" />,
      action: 'regional-reports'
    },
    {
      name: 'Configurações Regionais',
      description: 'Configurar preferências da região',
      icon: <Settings className="h-4 w-4" />,
      action: 'regional-settings'
    }
  ]);

  const renderOverview = () => (
    <>
      {/* Regional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {regionalStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                </div>
                <div className="flex flex-col items-end">
                  {stat.icon}
                  <Badge 
                    variant={stat.change.startsWith('+') ? 'default' : 'secondary'}
                    className="mt-3 text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300" 
              onClick={() => setActiveTab('analytics')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Analytics Regionais</h3>
                <p className="text-sm text-gray-600 mt-1">Análises avançadas da região</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveTab('reports')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Relatórios</h3>
                <p className="text-sm text-gray-600 mt-1">Gerar relatórios regionais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setActiveTab('ia-consultora')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">IA Consultora</h3>
                <p className="text-sm text-gray-600 mt-1">Consultoria inteligente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderAnalytics = () => (
    <AdvancedAnalyticsDashboard />
  );

  const renderReports = () => (
    <ReportGenerator />
  );

  const renderAlerts = () => (
    <AlertsAndRecommendations />
  );

  const renderCities = () => (
    <div className="space-y-6">
      {/* Cities Management Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cities.map((city) => (
          <Card key={city.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{city.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={city.status === 'active' ? 'default' : 'secondary'}>
                      {city.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Destinos:</span>
                  <span className="font-medium">{city.destinations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visitantes:</span>
                  <span className="font-medium">{city.visitors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receita:</span>
                  <span className="font-medium text-green-600">{city.revenue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Atualizado:</span>
                  <span className="text-xs text-gray-500">{city.lastUpdate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHeatmap = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mapas de Calor Regionais</h2>
          <p className="text-gray-600 mt-1">Visualização de fluxos turísticos entre cidades da região</p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1">
          <MapPin className="h-3 w-3 mr-1" />
          Visão Regional
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cidades Ativas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                <p className="text-xs text-gray-500 mt-2">Com fluxo turístico</p>
              </div>
              <div className="h-5 w-5 text-purple-500">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fluxo Inter-cidades</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">2.8k</p>
                <p className="text-xs text-gray-500 mt-2">Movimentações/dia</p>
              </div>
              <div className="h-5 w-5 text-green-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rotas Ativas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
                <p className="text-xs text-gray-500 mt-2">Roteiros regionais</p>
              </div>
              <div className="h-5 w-5 text-blue-500">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiência Regional</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
                <p className="text-xs text-gray-500 mt-2">Ocupação balanceada</p>
              </div>
              <div className="h-5 w-5 text-orange-500">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Mapa de Calor Regional - Coordenação de Fluxos</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Atualizado: {new Date().toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Relatório Regional
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TourismHeatmap />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Coordenação Inter-Municipal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-medium text-purple-900">Bonito ↔ Aquidauana</h4>
              <p className="text-sm text-purple-700 mt-1">
                Rota de alta intensidade: 45% do fluxo regional
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-900">Miranda ↔ Corumbá</h4>
              <p className="text-sm text-blue-700 mt-1">
                Crescimento de 23% no fluxo pantaneiro
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-900">Jardim ↔ Bodoquena</h4>
              <p className="text-sm text-green-700 mt-1">
                Rota emergente com potencial de crescimento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Estratégias Regionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <h4 className="font-medium text-orange-900">Balanceamento</h4>
              <p className="text-sm text-orange-700 mt-1">
                Redistribuir 15% do fluxo de Bonito para cidades menores
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
              <h4 className="font-medium text-indigo-900">Integração</h4>
              <p className="text-sm text-indigo-700 mt-1">
                Criar passaporte regional conectando todas as cidades
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
              <h4 className="font-medium text-emerald-900">Inovação</h4>
              <p className="text-sm text-emerald-700 mt-1">
                Implementar sensores IoT para dados em tempo real
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configurações Regionais</h2>
      <p className="text-gray-600">Gerencie as preferências e configurações da região.</p>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Receber alertas por email</span>
              <Badge variant="outline" className="text-xs">
                Desativado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Receber recomendações de IA</span>
              <Badge variant="outline" className="text-xs">
                Ativado
              </Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Notificações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Configurações de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permitir acesso aos dados da região</span>
              <Badge variant="outline" className="text-xs">
                Privado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Permitir acesso aos dados de cidades</span>
              <Badge variant="outline" className="text-xs">
                Privado
              </Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Configurar Acesso
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Configurações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alterar senha</span>
              <Badge variant="outline" className="text-xs">
                Necessário
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mudar tema</span>
              <Badge variant="outline" className="text-xs">
                Claro
              </Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Configurar Segurança
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
          <div className="px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Dashboard Regional
                </h1>
                <p className="text-purple-100 text-lg">
                  Bem-vindo(a), {getDisplayName()}. Gerencie a região turística do Pantanal.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-purple-200">Região</p>
                  <p className="font-semibold text-lg">Pantanal</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content with Tabs Modernos */}
        <section className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex w-full bg-transparent h-auto p-0 justify-start gap-2 overflow-x-auto">
                <TabsTrigger 
                  value="overview" 
                  title="Resumo executivo e métricas regionais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <TrendingUp className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="cities" 
                  title="Gestão das cidades da região"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <Building2 className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Cidades</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  title="Análises e estatísticas regionais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <BarChart3 className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  title="Relatórios regionais e documentos"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <FileText className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Relatórios</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="passport" 
                  title="Gerenciar roteiros e gamificação regional"
                  className="group relative flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <div className="relative">
                    <Award className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-medium text-center">Passaporte</span>
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">
                    Novo
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="heatmap" 
                  title="Visualização de fluxos regionais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <MapPin className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Mapas de Calor</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="community" 
                  title="Contribuições da comunidade regional"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <Users className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Comunidade</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ia-consultora" 
                  title="Assistente estratégico regional inteligente"
                  className="group relative flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <div className="relative">
                    <Bot className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-medium text-center">IA Consultora</span>
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">
                    Novo
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="alertas" 
                  title="Notificações regionais importantes"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-50 data-[state=active]:to-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-blue-50/50"
                >
                  <AlertTriangle className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Alertas</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="overview" className="mt-0">
                  {renderOverview()}
                </TabsContent>

                <TabsContent value="cities" className="mt-0">
                  {renderCities()}
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  {renderAnalytics()}
                </TabsContent>

                <TabsContent value="reports" className="mt-0">
                  {renderReports()}
                </TabsContent>

                <TabsContent value="passport" className="mt-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Passaporte Digital Regional</h2>
                        <p className="text-gray-600">
                          Gerencie roteiros turísticos regionais, checkpoints e gamificação para engajar turistas
                        </p>
                      </div>
                    </div>
                    <RouteManagement userRegion={regionId} />
                  </div>
                </TabsContent>

                <TabsContent value="alertas" className="mt-0">
                  {renderAlerts()}
                </TabsContent>

                <TabsContent value="ia-consultora" className="mt-0">
                  <div className="h-[700px]">
                    <ChatInterface className="h-full" />
                  </div>
                </TabsContent>

                <TabsContent value="heatmap" className="mt-0">
                  {renderHeatmap()}
                </TabsContent>

                <TabsContent value="community" className="mt-0">
                  <CommunityContributionsManager />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>
      </div>

      {/* Search Bar */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Buscar cidades, destinos ou eventos regionais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 text-lg"
              />
            </div>
            <Button className="h-12 px-6">
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento Regional
            </Button>
          </div>
        </div>
      </section>

      {/* Regional Stats */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regionalStats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cities and Events */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cities */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      Cidades da Região
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cities.map((city) => (
                      <div key={city.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{city.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{city.destinations} destinos</span>
                              <span>{city.visitors} visitantes</span>
                              <span>{city.revenue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={city.status === 'active' ? 'default' : 'secondary'}
                          >
                            {city.status === 'active' ? 'Ativa' : 'Manutenção'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Events */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Eventos Regionais
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Evento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionalEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{event.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{event.date}</span>
                              <span>{event.location}</span>
                              <span>{event.attendees} participantes</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">Cidades:</span>
                              {event.cities.map((city, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {city}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                          >
                            {event.status === 'upcoming' ? 'Próximo' : 'Planejamento'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Ações Regionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button key={index} variant="outline" className="w-full justify-start h-auto p-3">
                        {action.icon}
                        <div className="ml-3 text-left">
                          <p className="font-semibold">{action.name}</p>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Analytics */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Regional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Visitantes este mês</span>
                      <span className="font-semibold">8.456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receita regional</span>
                      <span className="font-semibold">R$ 234.5k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cidades ativas</span>
                      <span className="font-semibold">7/8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Eventos ativos</span>
                      <span className="font-semibold">3</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Ver Relatório Regional
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Activity */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Atividade Regional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Novo evento regional - Festival do Pantanal</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Cidade Corumbá atualizada - 12 destinos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Relatório regional gerado - Julho 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Rota gastronômica planejada - 3 cidades</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegionalDashboard; 