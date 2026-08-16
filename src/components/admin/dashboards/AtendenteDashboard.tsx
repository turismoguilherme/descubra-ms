import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  RefreshCw
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { attendanceAI } from '@/services/ai/attendanceAI';

interface CheckInRecord {
  id: string;
  type: 'check-in' | 'check-out';
  timestamp: Date;
  location: string;
  notes?: string;
}

interface TouristInfo {
  id: string;
  name: string;
  origin: string;
  interests: string[];
  checkInTime: Date;
  status: 'active' | 'completed' | 'cancelled';
}

const AtendenteDashboard = () => {
  const { userRole, regionId, cityId } = useRoleBasedAccess();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [touristCount, setTouristCount] = useState(0);
  const [aiAssistantStatus, setAiAssistantStatus] = useState<'online' | 'offline'>('offline');
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [recentTourists, setRecentTourists] = useState<TouristInfo[]>([]);
  const [location, setLocation] = useState('CAT Bonito - Centro de Atendimento ao Turista');

  // Atualizar hora atual
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular dados de turistas
  useEffect(() => {
    const mockTourists: TouristInfo[] = [
      {
        id: '1',
        name: 'João Silva',
        origin: 'São Paulo - SP',
        interests: ['Ecoturismo', 'Aventura'],
        checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: '2',
        name: 'Maria Santos',
        origin: 'Rio de Janeiro - RJ',
        interests: ['Cultura', 'Gastronomia'],
        checkInTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        id: '3',
        name: 'Carlos Lima',
        origin: 'Brasília - DF',
        interests: ['História', 'Arquitetura'],
        checkInTime: new Date(Date.now() - 30 * 60 * 1000),
        status: 'completed'
      }
    ];

    setRecentTourists(mockTourists);
    setTouristCount(mockTourists.filter(t => t.status === 'active').length);
  }, []);

  const handleCheckIn = () => {
    const record: CheckInRecord = {
      id: Date.now().toString(),
      type: 'check-in',
      timestamp: new Date(),
      location: location,
      notes: 'Início do turno de trabalho'
    };

    setCheckInRecords(prev => [record, ...prev]);
    setIsCheckedIn(true);
    setCheckInTime(new Date());
    
    console.log('✅ Check-in realizado:', record);
  };

  const handleCheckOut = () => {
    const record: CheckInRecord = {
      id: Date.now().toString(),
      type: 'check-out',
      timestamp: new Date(),
      location: location,
      notes: 'Fim do turno de trabalho'
    };

    setCheckInRecords(prev => [record, ...prev]);
    setIsCheckedIn(false);
    setCheckInTime(null);
    
    console.log('✅ Check-out realizado:', record);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWorkDuration = () => {
    if (!checkInTime) return '00:00:00';
    
    const now = new Date();
    const diff = now.getTime() - checkInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Funções da IA de Atendimento
  const initializeAI = async () => {
    try {
      const status = attendanceAI.getStatus();
      setAiAssistantStatus(status.online ? 'online' : 'offline');
      console.log('🤖 Status da IA:', status);
    } catch (error) {
      console.error('❌ Erro ao inicializar IA:', error);
      setAiAssistantStatus('offline');
    }
  };

  const handleAIMessage = async () => {
    if (!aiMessage.trim() || isProcessingAI) return;

    setIsProcessingAI(true);
    try {
      const response = await attendanceAI.processMessage(aiMessage);
      setAiResponse(response.content);
      setAiMessage('');
      console.log('🤖 Resposta da IA:', response);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem da IA:', error);
      setAiResponse('Desculpe, não consegui processar sua mensagem. Tente novamente.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  const testAITranslation = async () => {
    try {
      const translation = await attendanceAI.translateText(
        'Bem-vindo ao Mato Grosso do Sul! Como posso ajudá-lo?',
        'en-US'
      );
      setAiResponse(`Tradução: ${translation}`);
    } catch (error) {
      console.error('❌ Erro no teste de tradução:', error);
      setAiResponse('Erro no teste de tradução');
    }
  };

  const testAIRoutes = async () => {
    try {
      const touristProfile = {
        id: 'test-tourist',
        name: 'Turista Teste',
        language: 'pt-BR',
        interests: ['ecoturismo', 'cultura'],
        accessibility: [],
        preferences: {}
      };
      
      const suggestions = await attendanceAI.suggestRoutes(touristProfile);
      setAiResponse(`Sugestões de roteiros: ${suggestions.length} encontrados`);
    } catch (error) {
      console.error('❌ Erro no teste de roteiros:', error);
      setAiResponse('Erro no teste de roteiros');
    }
  };

  // Inicializar IA quando componente montar
  useEffect(() => {
    initializeAI();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Dashboard do Atendente
              </h1>
              <p className="text-blue-100">
                Centro de Atendimento ao Turista - {location}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  {userRole}
                </Badge>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Phone className="mr-2 h-4 w-4" />
                Suporte
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Mail className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sistema de Check-in/Checkout */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <UserCheck className="h-5 w-5" />
                  Controle de Ponto Eletrônico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-blue-700">
                      {formatDate(currentTime)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-900">
                      Status: {isCheckedIn ? 'Trabalhando' : 'Fora do Trabalho'}
                    </div>
                    <Badge 
                      variant={isCheckedIn ? "default" : "secondary"}
                      className={isCheckedIn ? "bg-green-500" : "bg-gray-500"}
                    >
                      {isCheckedIn ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-900">
                      Tempo de Trabalho
                    </div>
                    <div className="text-sm text-blue-700 font-mono">
                      {getWorkDuration()}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {!isCheckedIn ? (
                    <Button 
                      onClick={handleCheckIn}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Fazer Check-in
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCheckOut}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Fazer Check-out
                    </Button>
                  )}
                </div>
                
                <div className="text-sm text-blue-700">
                  <strong>Local:</strong> {location}
                </div>
              </CardContent>
            </Card>

            {/* IA de Atendimento Presencial */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Bot className="h-5 w-5" />
                  Assistente IA - Atendimento Presencial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${aiAssistantStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      Status: {aiAssistantStatus === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-purple-700 border-purple-300">
                    Fase 3 - Em Desenvolvimento
                  </Badge>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">Funcionalidades da IA:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Tradução automática para turistas estrangeiros</li>
                    <li>• Sugestões personalizadas de roteiros</li>
                    <li>• Informações em tempo real sobre destinos</li>
                    <li>• Assistência para reservas e agendamentos</li>
                    <li>• Suporte para pessoas com deficiência</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={testAITranslation}
                      disabled={isProcessingAI}
                    >
                      <Wifi className="mr-2 h-4 w-4" />
                      Testar Tradução
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={testAIRoutes}
                      disabled={isProcessingAI}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Testar Roteiros
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Digite uma mensagem para testar a IA..."
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAIMessage()}
                      disabled={isProcessingAI}
                    />
                    <Button 
                      onClick={handleAIMessage}
                      disabled={!aiMessage.trim() || isProcessingAI}
                      className="w-full"
                    >
                      {isProcessingAI ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-4 w-4" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {aiResponse && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="text-sm font-medium text-purple-900 mb-1">Resposta da IA:</div>
                      <div className="text-sm text-purple-700">{aiResponse}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Turistas Atendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Turistas Atendidos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTourists.map((tourist) => (
                    <div key={tourist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{tourist.name}</div>
                        <div className="text-sm text-gray-600">{tourist.origin}</div>
                        <div className="text-xs text-gray-500">
                          Interesses: {tourist.interests.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={tourist.status === 'active' ? 'default' : 'secondary'}
                          className={tourist.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                        >
                          {tourist.status === 'active' ? 'Ativo' : 'Finalizado'}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatTime(tourist.checkInTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Estatísticas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas do Dia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Turistas Atendidos</span>
                  <span className="font-bold text-2xl text-blue-600">{touristCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo de Trabalho</span>
                  <span className="font-bold text-lg text-green-600">{getWorkDuration()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Check-ins Realizados</span>
                  <span className="font-bold text-lg text-purple-600">
                    {checkInRecords.filter(r => r.type === 'check-in').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Ponto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {checkInRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className={`w-2 h-2 rounded-full ${record.type === 'check-in' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {record.type === 'check-in' ? 'Check-in' : 'Check-out'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(record.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {checkInRecords.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Nenhum registro de ponto ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contatos de Emergência */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contatos Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
                  <Phone className="h-4 w-4 text-red-600" />
                  <div>
                    <div className="text-sm font-medium">Emergências</div>
                    <div className="text-xs text-gray-600">190 - Polícia</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">Fundtur-MS</div>
                    <div className="text-xs text-gray-600">(67) 3318-6000</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">CAT Bonito</div>
                    <div className="text-xs text-gray-600">(67) 3255-1414</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtendenteDashboard; 