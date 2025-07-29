import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  Globe,
  BarChart3,
  FileText,
  Settings,
  Eye,
  Edit,
  Plus,
  Building2,
  Bot,
  Brain,
  AlertTriangle,
  Clock,
  Download,
  Star,
  Bell
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import ChatInterface from '@/components/ai/ChatInterface';
import AdvancedAnalyticsDashboard from '@/components/ai/AdvancedAnalyticsDashboard';
import ReportGenerator from '@/components/ai/ReportGenerator';
import AlertsAndRecommendations from '@/components/ai/AlertsAndRecommendations';
import TourismHeatmap from '@/components/management/TourismHeatmap';
import CommunityContributionsManager from '@/components/admin/CommunityContributionsManager';
import RouteManagement from '@/components/admin/RouteManagement';

const EstadualDashboard = () => {
  const { cityId, regionId, getDisplayName } = useRoleBasedAccess();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [stateStats] = useState([
    {
      title: 'Regiões Turísticas',
      value: '10',
      change: '+0',
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      description: 'Regiões turísticas do MS'
    },
    {
      title: 'Municípios Ativos',
      value: '79',
      change: '+2',
      icon: <Building2 className="h-6 w-6 text-green-600" />,
      description: 'Cidades com turismo ativo'
    },
    {
      title: 'Visitantes Estaduais',
      value: '15.234',
      change: '+18%',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      description: 'Turistas no MS hoje'
    },
    {
      title: 'Receita Estadual',
      value: 'R$ 2.8M',
      change: '+22%',
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      description: 'Receita turística mensal'
    }
  ]);

  const [regions] = useState([
    {
      id: 1,
      name: 'Bonito / Serra da Bodoquena',
      status: 'active',
      cities: 8,
      destinations: 45,
      visitors: 3456,
      revenue: 'R$ 456.2k',
      lastUpdate: '1 hora atrás'
    },
    {
      id: 2,
      name: 'Pantanal',
      status: 'active',
      cities: 5,
      destinations: 32,
      visitors: 2890,
      revenue: 'R$ 389.1k',
      lastUpdate: '2 horas atrás'
    },
    {
      id: 3,
      name: 'Caminho dos Ipês',
      status: 'active',
      cities: 12,
      destinations: 28,
      visitors: 2456,
      revenue: 'R$ 321.4k',
      lastUpdate: '3 horas atrás'
    },
    {
      id: 4,
      name: 'Estrada Real do Pantanal',
      status: 'active',
      cities: 6,
      destinations: 22,
      visitors: 1987,
      revenue: 'R$ 287.6k',
      lastUpdate: '4 horas atrás'
    },
    {
      id: 5,
      name: 'Costa Leste',
      status: 'active',
      cities: 8,
      destinations: 19,
      visitors: 1654,
      revenue: 'R$ 198.3k',
      lastUpdate: '5 horas atrás'
    },
    {
      id: 6,
      name: 'Portal Sul',
      status: 'active',
      cities: 4,
      destinations: 15,
      visitors: 1234,
      revenue: 'R$ 156.7k',
      lastUpdate: '6 horas atrás'
    }
  ]);

  const renderOverview = () => (
    <>
      {/* State Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {stateStats.map((stat, index) => (
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
                <h3 className="font-semibold text-lg">Analytics Estaduais</h3>
                <p className="text-sm text-gray-600 mt-1">Análises avançadas do estado</p>
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
                <p className="text-sm text-gray-600 mt-1">Gerar relatórios estaduais</p>
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
                <p className="text-sm text-gray-600 mt-1">Consultoria estratégica</p>
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

  const renderRegions = () => (
    <div className="space-y-6">
      {/* Regions Management Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {regions.map((region) => (
          <Card key={region.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{region.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={region.status === 'active' ? 'default' : 'secondary'}>
                      {region.status === 'active' ? 'Ativo' : 'Inativo'}
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
                  <span className="text-gray-600">Cidades:</span>
                  <span className="font-medium">{region.cities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Destinos:</span>
                  <span className="font-medium">{region.destinations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Visitantes:</span>
                  <span className="font-medium">{region.visitors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Receita:</span>
                  <span className="font-medium text-green-600">{region.revenue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Atualizado:</span>
                  <span className="text-xs text-gray-500">{region.lastUpdate}</span>
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
          <h2 className="text-2xl font-bold text-gray-900">Mapas de Calor Estaduais</h2>
          <p className="text-gray-600 mt-1">Visualização completa dos fluxos turísticos em Mato Grosso do Sul</p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1">
          <MapPin className="h-3 w-3 mr-1" />
          Visão Estadual Completa
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regiões Ativas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                <p className="text-xs text-gray-500 mt-2">IGRs com fluxo</p>
              </div>
              <div className="h-5 w-5 text-orange-500">
                <Globe className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fluxo Estadual</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">25.3k</p>
                <p className="text-xs text-gray-500 mt-2">Turistas/dia</p>
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
                <p className="text-sm font-medium text-gray-600">Corredores Turísticos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
                <p className="text-xs text-gray-500 mt-2">Rotas principais</p>
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
                <p className="text-sm font-medium text-gray-600">Performance Estadual</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">92%</p>
                <p className="text-xs text-gray-500 mt-2">Eficiência geral</p>
              </div>
              <div className="h-5 w-5 text-emerald-500">
                <Star className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Mapa de Calor Estadual - Visão Estratégica MS</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Atualizado: {new Date().toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Relatório Estadual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TourismHeatmap />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Corredores Estratégicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <h4 className="font-medium text-orange-900">Corredor Pantanal</h4>
              <p className="text-sm text-orange-700 mt-1">
                35% do fluxo estadual - Alta prioridade
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-medium text-blue-900">Corredor Bonito</h4>
              <p className="text-sm text-blue-700 mt-1">
                28% do fluxo - Turismo de natureza
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-900">Corredor Campo Grande</h4>
              <p className="text-sm text-green-700 mt-1">
                22% do fluxo - Portal de entrada
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Políticas Estaduais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-medium text-purple-900">Diversificação</h4>
              <p className="text-sm text-purple-700 mt-1">
                Desenvolver regiões com menor fluxo turístico
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
              <h4 className="font-medium text-indigo-900">Infraestrutura</h4>
              <p className="text-sm text-indigo-700 mt-1">
                Investir em conectividade entre regiões
              </p>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg border-l-4 border-rose-400">
              <h4 className="font-medium text-rose-900">Sustentabilidade</h4>
              <p className="text-sm text-rose-700 mt-1">
                Equilibrar crescimento com preservação
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Benchmarking Nacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-400">
              <h4 className="font-medium text-emerald-900">Posição Nacional</h4>
              <p className="text-sm text-emerald-700 mt-1">
                5º lugar em turismo de natureza no Brasil
              </p>
            </div>
            <div className="p-4 bg-cyan-50 rounded-lg border-l-4 border-cyan-400">
              <h4 className="font-medium text-cyan-900">Crescimento</h4>
              <p className="text-sm text-cyan-700 mt-1">
                +18% acima da média nacional
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
              <h4 className="font-medium text-amber-900">Oportunidade</h4>
              <p className="text-sm text-amber-700 mt-1">
                Potencial para alcançar top 3 nacional
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Dados da Aplicação</h3>
          <p className="text-sm text-gray-600">
            Configure as fontes de dados, períodos de relatórios e alertas.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Segurança</h3>
          <p className="text-sm text-gray-600">
            Defina permissões de usuário, senhas e autenticação.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Integrações</h3>
          <p className="text-sm text-gray-600">
            Conecte-se a outros sistemas de turismo e dados.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Notificações</h3>
          <p className="text-sm text-gray-600">
            Configure como e quando receber alertas.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <section className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12">
          <div className="px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Dashboard Estadual
                </h1>
                <p className="text-orange-100 text-lg">
                  Bem-vindo(a), {getDisplayName()}. Gerencie o turismo de Mato Grosso do Sul.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-orange-200">Estado</p>
                  <p className="font-semibold text-lg">Mato Grosso do Sul</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6" />
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
                  title="Resumo executivo e métricas estaduais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <TrendingUp className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="regions" 
                  title="Gestão das regiões de Mato Grosso do Sul"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <Globe className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Regiões</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  title="Análises e estatísticas estaduais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <BarChart3 className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  title="Relatórios estaduais e documentos oficiais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <FileText className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Relatórios</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="passport" 
                  title="Gerenciar roteiros e gamificação estadual"
                  className="group relative flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <div className="relative">
                    <Star className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-medium text-center">Passaporte</span>
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full">
                    Novo
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="heatmap" 
                  title="Visualização de fluxos turísticos estaduais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <MapPin className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Mapas de Calor</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="community" 
                  title="Contribuições da comunidade estadual"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <Users className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Comunidade</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ia-consultora" 
                  title="Assistente estratégico estadual inteligente"
                  className="group relative flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <div className="relative">
                    <Bot className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-medium text-center">IA Consultora</span>
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full">
                    Novo
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="alertas" 
                  title="Notificações e alertas estaduais"
                  className="group flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[120px] data-[state=active]:bg-gradient-to-b data-[state=active]:from-orange-50 data-[state=active]:to-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm hover:bg-orange-50/50"
                >
                  <AlertTriangle className="h-6 w-6 transition-transform duration-200 group-hover:scale-105 data-[state=active]:scale-110" />
                  <span className="text-xs font-medium text-center">Alertas</span>
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="overview" className="mt-0">
                  {renderOverview()}
                </TabsContent>

                <TabsContent value="regions" className="mt-0">
                  {renderRegions()}
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
                        <h2 className="text-2xl font-bold text-gray-900">Passaporte Digital Estadual</h2>
                        <p className="text-gray-600">
                          Gerencie roteiros turísticos estaduais, checkpoints e gamificação para engajar turistas
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

                <TabsContent value="settings" className="mt-0">
                  {renderSettings()}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EstadualDashboard; 