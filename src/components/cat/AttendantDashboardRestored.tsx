/**
 * Dashboard do Atendente - Versão Restaurada
 * Layout conforme imagem fornecida
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  MapPin, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  Calendar,
  TrendingUp,
  Phone,
  Mail,
  Building2,
  UserCheck,
  Bot,
  Wifi,
  WifiOff,
  RefreshCw,
  LogIn,
  LogOut,
  Timer,
  Star,
  Heart,
  Globe,
  BarChart3,
  Settings
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AttendantDashboardRestored: React.FC = () => {
  // Verificar se o AuthProvider está disponível
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('AttendantDashboardRestored: AuthProvider não disponível:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de autenticação...</p>
        </div>
      </div>
    );
  }

  const { user } = auth;
  const { isAttendant } = useRoleBasedAccess();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('ai');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!user || !isAttendant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md p-6 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Você não tem permissão para acessar este dashboard.</p>
            <Button onClick={() => window.location.href = '/test-login'}>Voltar para Login de Teste</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ViaJARNavbar />
      
      {/* Header com gradiente azul-roxo */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard do Atendente</h1>
              <p className="text-blue-100 mt-2">Bem-vindo, {user?.name || 'Atendente'}</p>
            </div>
            <div className="flex gap-4">
              <Button className="bg-blue-700 hover:bg-blue-800 text-white">
                <UserCheck className="h-4 w-4 mr-2" />
                CAT Atendente
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar Esquerda */}
        <div className="w-64 bg-white shadow-lg h-full flex-shrink-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Atendente</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('checkin')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex flex-col items-center gap-2 ${
                  activeTab === 'checkin' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Controle de Ponto</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex flex-col items-center gap-2 ${
                  activeTab === 'ai' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bot className="h-5 w-5" />
                <span className="text-sm font-medium">IA Guatá</span>
              </button>
              <button
                onClick={() => setActiveTab('tourists')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex flex-col items-center gap-2 ${
                  activeTab === 'tourists' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Gestão de Turistas</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex flex-col items-center gap-2 ${
                  activeTab === 'reports' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">Relatórios</span>
              </button>
            </nav>
          </div>
                </div>
                
        {/* Conteúdo Principal */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {/* Seção IA Guatá */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Header da IA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8 text-purple-600" />
                  <h2 className="text-2xl font-bold text-purple-800">IA Guatá - Assistente Inteligente</h2>
                </div>
                </div>
                
              {/* Informações do Assistente */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Assistente IA - CAT Centro</h3>
                        <p className="text-sm text-gray-600">Atendente: Pedro Atendente</p>
                  </div>
                </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Histórico
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Chat Interface */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  {/* Mensagem de Boas-vindas */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 max-w-md">
                        <p className="text-gray-800">
                          Olá! Sou o assistente IA do CAT Centro. Como posso ajudá-lo hoje?
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>17:38</span>
                          <span>BR</span>
                          <button className="hover:text-gray-700">
                            <MessageCircle className="h-3 w-3" />
                          </button>
                          <button className="hover:text-gray-700">
                            <Star className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Ações Rápidas</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="rounded-full">
                        👋 Boas-vindas
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        🏖️ Atrativos
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        🍽️ Restaurantes
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        🏨 Hospedagem
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        🚗 Transporte
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full">
                        📅 Eventos
                      </Button>
                    </div>
                  </div>

                  {/* Campo de Entrada */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <select className="text-sm border-none bg-transparent text-gray-600">
                        <option>BR Português</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <Input placeholder="Digite sua pergunta..." />
                    </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Seção Controle de Ponto */}
          {activeTab === 'checkin' && (
            <div className="space-y-6">
              {/* Header do Controle de Ponto */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-800">Controle de Ponto</h2>
                </div>
                <Badge className={`px-3 py-1 text-sm ${isOnline ? 'bg-green-500/20 text-green-200 border-green-300/30' : 'bg-red-500/20 text-red-200 border-red-300/30'}`}>
                  {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>

              {/* Status Atual */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Pedro Atendente</h3>
                        <p className="text-sm text-gray-600">CAT Centro - Bonito, MS</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-green-100 text-green-800 px-3 py-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {currentTime.toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">08:30</div>
                      <p className="text-sm text-gray-600">Tempo trabalhado hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LogIn className="h-5 w-5 text-green-600" />
                      Check-in
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 mb-2">
                          <MapPin className="h-4 w-4 inline mr-2" />
                          Localização: CAT Centro, Bonito-MS
                        </p>
                        <p className="text-xs text-green-600">
                          Precisão: ±3 metros
                        </p>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <LogIn className="h-4 w-4 mr-2" />
                        Fazer Check-in
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LogOut className="h-5 w-5 text-red-600" />
                      Check-out
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800 mb-2">
                          <Timer className="h-4 w-4 inline mr-2" />
                          Tempo atual: 08:30
                        </p>
                        <p className="text-xs text-red-600">
                          Registro automático
                        </p>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <LogOut className="h-4 w-4 mr-2" />
                        Fazer Check-out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Pontos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Histórico de Pontos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Check-in</p>
                          <p className="text-xs text-gray-500">Hoje, 08:00</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Check-out</p>
                          <p className="text-xs text-gray-500">Ontem, 17:30</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Finalizado</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Check-in</p>
                          <p className="text-xs text-gray-500">Ontem, 08:15</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
                      </div>
          )}

          {/* Seção Gestão de Turistas */}
          {activeTab === 'tourists' && (
            <div className="space-y-6">
              {/* Header da Gestão de Turistas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <h2 className="text-2xl font-bold text-blue-800">Gestão de Turistas</h2>
                </div>
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Users className="h-4 w-4 mr-2" />
                  15 turistas hoje
                </Badge>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15</div>
                    <p className="text-sm text-gray-600">Turistas Hoje</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                    <p className="text-sm text-gray-600">Atendimentos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">8</div>
                    <p className="text-sm text-gray-600">Países</p>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Turistas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Turistas Atendidos Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Maria Silva</p>
                          <p className="text-sm text-gray-600">São Paulo, Brasil</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          5.0
                        </Badge>
                        <span className="text-sm text-gray-500">14:30</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">John Smith</p>
                          <p className="text-sm text-gray-600">New York, USA</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          4.5
                        </Badge>
                        <span className="text-sm text-gray-500">13:45</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Globe className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Carlos Rodriguez</p>
                          <p className="text-sm text-gray-600">Madrid, Espanha</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          4.8
                        </Badge>
                        <span className="text-sm text-gray-500">12:20</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avaliações Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Avaliações Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-2">5.0</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">
                        "Excelente atendimento! Muito prestativo e conhece bem a região."
                      </p>
                      <p className="text-xs text-gray-600">Maria Silva - 14:30</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <Star className="h-4 w-4 text-gray-300" />
                        <span className="text-sm font-medium ml-2">4.0</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">
                        "Bom atendimento, mas poderia ter mais informações em inglês."
                      </p>
                      <p className="text-xs text-gray-600">John Smith - 13:45</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
                </div>
          )}

          {/* Seção Relatórios */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Header dos Relatórios */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <h2 className="text-2xl font-bold text-purple-800">Relatórios</h2>
                </div>
                <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Últimos 30 dias
                </Badge>
              </div>

              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">247</div>
                        <p className="text-sm text-gray-600">Total de Atendimentos</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-sm font-semibold">85%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Meta mensal</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
                        <p className="text-sm text-gray-600">Avaliação Média</p>
                      </div>
                      <Star className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                        </div>
                        <span className="text-sm font-semibold">96%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Excelente</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
                        <p className="text-sm text-gray-600">Horas Trabalhadas</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-sm font-semibold">78%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Presença</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Relatórios Disponíveis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Relatório Diário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Data:</span>
                        <span className="font-semibold">Hoje</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Atendimentos:</span>
                        <span className="font-semibold">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tempo médio:</span>
                        <span className="font-semibold">8 min</span>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Relatório Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Período:</span>
                        <span className="font-semibold">Esta semana</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Atendimentos:</span>
                        <span className="font-semibold">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Crescimento:</span>
                        <span className="font-semibold text-green-600">+12%</span>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance dos Últimos 7 Dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-purple-800">Segunda-feira</p>
                        <p className="text-sm text-purple-600">12 atendimentos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '80%'}}></div>
                        </div>
                        <span className="text-sm font-semibold">80%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">Terça-feira</p>
                        <p className="text-sm text-blue-600">15 atendimentos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <span className="text-sm font-semibold">100%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">Quarta-feira</p>
                        <p className="text-sm text-green-600">18 atendimentos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '120%'}}></div>
                        </div>
                        <span className="text-sm font-semibold">120%</span>
                      </div>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendantDashboardRestored;
