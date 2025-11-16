import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Map,
  Calendar,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  BarChart3,
  FileText,
  Settings,
  Award,
  Bot,
  Brain,
  Bell,
  Clock,
  Download
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import ChatInterface from '@/components/ai/ChatInterface';
import AdvancedAnalyticsDashboard from '@/components/ai/AdvancedAnalyticsDashboard';
import ReportGenerator from '@/components/ai/ReportGenerator';
import AlertsAndRecommendations from '@/components/ai/AlertsAndRecommendations';
import AttendantGeoManager from '@/components/admin/AttendantGeoManager';
// TourismHeatmap removido - componente deletado
import CommunityContributionsManager from '@/components/admin/CommunityContributionsManager';
import RouteManagement from '@/components/admin/RouteManagement';
import CATGeolocationManager from '@/components/overflow-one/CATGeolocationManager';

const MunicipalDashboard = () => {
  console.log('🚀 MunicipalDashboard: Componente iniciando...');
  
  try {
    const { cityId, regionId, getDisplayName } = useRoleBasedAccess();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    console.log('📊 MunicipalDashboard: Hook funcionando. CityId:', cityId, 'RegionId:', regionId);

    // Dados simulados para o dashboard
    const municipalData = {
      totalVisitors: 1245,
      checkIns: 892,
      events: 12,
      avgRating: 4.3,
      growth: '+15%',
      cityName: getDisplayName() || 'Sua Cidade'
    };

    const tabs = [
      { id: 'overview', label: 'Visão Geral', icon: Building2, description: 'Resumo executivo e métricas principais' },
      { id: 'events', label: 'Eventos', icon: Calendar, description: 'Gestão de eventos e programação' },
      { id: 'attendants', label: 'Atendentes', icon: Users, description: 'Equipe e controle de ponto' },
      { id: 'cats', label: 'CATs', icon: MapPin, description: 'Gestão de CATs com geolocalização', isNew: true },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Análises e estatísticas avançadas' },
      { id: 'reports', label: 'Relatórios', icon: FileText, description: 'Relatórios e documentos' },
      { id: 'passport', label: 'Passaporte Digital', icon: Award, description: 'Gerenciar roteiros e gamificação', isNew: true },
      { id: 'heatmap', label: 'Mapas de Calor', icon: MapPin, description: 'Visualização de fluxos turísticos' },
      { id: 'community', label: 'Comunidade', icon: Users, description: 'Contribuições da comunidade' },
      { id: 'ia-consultora', label: 'IA Consultora', icon: Brain, description: 'Assistente estratégico inteligente', isNew: true },
      { id: 'settings', label: 'Configurações', icon: Settings, description: 'Ajustes e configurações do sistema' },
      { id: 'alerts', label: 'Alertas', icon: Bell, description: 'Notificações e avisos importantes' }
    ];

    const renderOverview = () => (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Municipal - {municipalData.cityName}
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie o turismo da sua cidade com dados inteligentes
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="default" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button size="default">
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Visitantes</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{municipalData.totalVisitors.toLocaleString()}</div>
              <p className="text-sm text-gray-500 mt-2">
                <span className="text-green-600 font-medium">{municipalData.growth}</span> vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Check-ins</CardTitle>
              <MapPin className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{municipalData.checkIns}</div>
              <p className="text-sm text-gray-500 mt-2">Este mês</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Eventos Ativos</CardTitle>
              <Calendar className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{municipalData.events}</div>
              <p className="text-sm text-gray-500 mt-2">Em andamento</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avaliação Média</CardTitle>
              <Award className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-gray-900">{municipalData.avgRating}</div>
              <p className="text-sm text-gray-500 mt-2">De 5 estrelas</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-blue-500" />
                Consultar IA Estratégica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Obtenha insights inteligentes sobre o turismo da sua cidade
              </p>
              <Button 
                size="default" 
                className="w-full"
                onClick={() => setActiveTab('ia-consultora')}
              >
                <Brain className="h-4 w-4 mr-2" />
                Abrir IA Consultora
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-green-500" />
                Gestão de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Crie e gerencie eventos turísticos da sua cidade
              </p>
              <Button 
                size="default" 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('events')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Gerenciar Eventos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                Analytics Avançado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Análise detalhada do comportamento dos visitantes
              </p>
              <Button 
                size="default" 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Ver Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Notificações */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>Insights Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Bot className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    IA Consultora disponível!
                  </p>
                  <p className="text-sm text-blue-700">
                    Faça perguntas estratégicas sobre o turismo da sua cidade e receba insights baseados em dados reais.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Crescimento de 15% na visitação
                  </p>
                  <p className="text-sm text-green-700">
                    Sua cidade registrou aumento significativo no número de visitantes este mês.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Eventos Recentes */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-500" />
              Lista de Eventos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Festival de Inverno', date: '2024-07-15', status: 'Confirmado', participants: 250 },
                { name: 'Trilha Ecológica', date: '2024-07-20', status: 'Planejamento', participants: 50 },
                { name: 'Feira Gastronômica', date: '2024-07-25', status: 'Em Andamento', participants: 180 }
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{event.participants} participantes</p>
                      <Badge variant={event.status === 'Confirmado' ? 'default' : event.status === 'Em Andamento' ? 'secondary' : 'outline'}>
                        {event.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

    const renderAIConsultant = () => (
      <div className="space-y-6">
        {/* Header da IA Consultora */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="h-7 w-7 text-blue-500" />
              IA Consultora Estratégica
            </h1>
            <p className="text-gray-600 mt-1">
              Análise inteligente de dados turísticos para {municipalData.cityName}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            Powered by Gemini AI
          </Badge>
        </div>

        {/* Interface da IA - Layout Responsivo */}
        <div className="min-h-[500px] max-h-[700px] lg:h-[600px]">
          <ChatInterface className="h-full w-full" />
        </div>

        {/* Cards Informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Como funciona</span>
              </div>
              <p className="text-sm text-blue-700">
                A IA analisa dados de visitação, eventos e avaliações para fornecer insights estratégicos personalizados.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Análises Disponíveis</span>
              </div>
              <p className="text-sm text-green-700">
                Tendências, previsões, segmentação de visitantes, otimização de eventos e muito mais.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Dados em Tempo Real</span>
              </div>
              <p className="text-sm text-purple-700">
                Todas as análises são baseadas nos dados mais recentes da sua cidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );

    const renderEvents = () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Eventos</h1>
            <p className="text-gray-600 mt-1">Crie e gerencie eventos turísticos da sua cidade</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Estatísticas de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Eventos Ativos</span>
              </div>
              <div className="text-2xl font-bold mt-2">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Total Participantes</span>
              </div>
              <div className="text-2xl font-bold mt-2">2,450</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Taxa Ocupação</span>
              </div>
              <div className="text-2xl font-bold mt-2">87%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Avaliação Média</span>
              </div>
              <div className="text-2xl font-bold mt-2">4.6</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista Detalhada de Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Todos os Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Festival de Inverno', date: '2024-07-15', status: 'Confirmado', attendees: 250, capacity: 300 },
                { name: 'Trilha Ecológica', date: '2024-07-20', status: 'Planejamento', attendees: 50, capacity: 80 },
                { name: 'Feira Gastronômica', date: '2024-07-25', status: 'Em Andamento', attendees: 180, capacity: 200 },
                { name: 'Exposição Cultural', date: '2024-07-30', status: 'Planejamento', attendees: 120, capacity: 150 },
              ].map((event, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{event.attendees}/{event.capacity}</p>
                        <p className="text-xs text-gray-500">Participantes</p>
                      </div>
                      <Badge variant={event.status === 'Confirmado' ? 'default' : event.status === 'Em Andamento' ? 'secondary' : 'outline'}>
                        {event.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );

    const renderAttendants = () => (
      <AttendantGeoManager />
    );

    const renderCATs = () => (
      <CATGeolocationManager />
    );

    const renderAnalytics = () => (
      <div className="space-y-6">
        <AdvancedAnalyticsDashboard />
      </div>
    );

    const renderReports = () => (
      <div className="space-y-6">
        <ReportGenerator />
      </div>
    );

    const renderAlerts = () => (
      <div className="space-y-6">
        <AlertsAndRecommendations />
      </div>
    );

    const renderHeatmap = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mapas de Calor Turísticos</h2>
            <p className="text-gray-600 mt-1">Visualização de concentrações e fluxos turísticos em tempo real</p>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1">
            <MapPin className="h-3 w-3 mr-1" />
            Dados em Tempo Real
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards de Métricas do Mapa */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pontos de Concentração</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                  <p className="text-xs text-gray-500 mt-2">Ativos agora</p>
                </div>
                <div className="h-5 w-5 text-red-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fluxo Atual</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">1.2k</p>
                  <p className="text-xs text-gray-500 mt-2">Turistas ativos</p>
                </div>
                <div className="h-5 w-5 text-green-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacidade</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">78%</p>
                  <p className="text-xs text-gray-500 mt-2">Ocupação média</p>
                </div>
                <div className="h-5 w-5 text-orange-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Componente de Mapa de Calor */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Mapa de Calor - Concentração Turística</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Atualizado: {new Date().toLocaleTimeString()}
                </Badge>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Map className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Mapas de Calor</p>
              <p className="text-sm">Funcionalidade em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        {/* Insights do Mapa de Calor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Zonas de Alta Concentração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Centro Histórico</span>
                </div>
                <span className="text-sm text-gray-600">89% ocupação</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">Mercado Municipal</span>
                </div>
                <span className="text-sm text-gray-600">67% ocupação</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Rodoviária</span>
                </div>
                <span className="text-sm text-gray-600">45% ocupação</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Recomendações Inteligentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-900">Redistribuir Fluxo</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Centro está com 89% de ocupação. Promover atrativos alternativos.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-green-900">Oportunidade</h4>
                <p className="text-sm text-green-700 mt-1">
                  Zona Sul com baixa ocupação (23%). Potencial para novos eventos.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <h4 className="font-medium text-purple-900">Tendência</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Crescimento de 15% no fluxo para áreas naturais.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );

    const renderCommunity = () => (
      <CommunityContributionsManager />
    );

    const renderSettings = () => (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações da sua cidade na plataforma</p>
        </div>

        {/* Configurações da Cidade */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Cidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome da Cidade</label>
                <Input defaultValue={municipalData.cityName} />
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Input defaultValue="Mato Grosso do Sul" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <textarea 
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                defaultValue="Uma cidade incrível com muito a oferecer aos turistas..."
              />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Eventos</p>
                <p className="text-sm text-gray-500">Receba notificações sobre novos eventos</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Relatórios Semanais</p>
                <p className="text-sm text-gray-500">Resumo semanal das atividades</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Insights da IA</p>
                <p className="text-sm text-gray-500">Receba insights automáticos da IA Consultora</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </CardContent>
        </Card>

        {/* Configurações da IA */}
        <Card>
          <CardHeader>
            <CardTitle>IA Consultora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Análises Automáticas</p>
                <p className="text-sm text-gray-500">Gerar insights automaticamente</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas Proativos</p>
                <p className="text-sm text-gray-500">Receber alertas sobre tendências importantes</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          </CardContent>
        </Card>
      </div>
    );

    const renderPassport = () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Passaporte Digital</h2>
            <p className="text-gray-600">
              Gerencie roteiros turísticos, checkpoints e gamificação para engajar turistas
            </p>
          </div>
        </div>
        <RouteManagement userRegion={regionId} />
      </div>
    );

    const renderContent = () => {
      switch (activeTab) {
        case 'overview':
          return renderOverview();
        case 'events':
          return renderEvents();
        case 'attendants':
          return renderAttendants();
        case 'cats':
          return renderCATs();
        case 'analytics':
          return renderAnalytics();
        case 'reports':
          return renderReports();
        case 'passport':
          return renderPassport();
        case 'ia-consultora':
          return renderAIConsultant();
        case 'alerts':
          return renderAlerts();
        case 'heatmap':
          return renderHeatmap();
        case 'community':
          return renderCommunity();
        case 'settings':
          return renderSettings();
        default:
          return renderOverview();
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Navegação por Tabs Melhorada */}
          <div className="bg-white border-b border-gray-200 px-6 shadow-sm">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.description}
                    className={`group relative flex flex-col items-center gap-2 px-6 py-4 rounded-t-lg transition-all duration-200 min-w-[140px] ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-b from-blue-50 to-white text-blue-600 border-b-3 border-blue-500 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 border-b-3 border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`h-6 w-6 transition-transform duration-200 ${
                        activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      {tab.isNew && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <span className={`text-xs font-medium text-center leading-tight ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                    }`}>
                      {tab.label}
                    </span>
                    {tab.isNew && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] bg-gradient-to-r from-blue-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">
                        Novo
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('❌ Erro no MunicipalDashboard:', error);
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">❌ Erro ao carregar dashboard</div>
        <Button onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
      </div>
    );
  }
};

export default MunicipalDashboard;