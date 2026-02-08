/**
 * CAT Check-In Section
 * Seção padronizada de controle de ponto para atendentes dos CATs
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  MapPin, 
  CheckCircle, 
  XCircle,
  Wifi,
  WifiOff,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { catCheckinService, CATCheckin } from '@/services/catCheckinService';

interface CATCheckInSectionProps {
  catName?: string;
}

const CATCheckInSection: React.FC<CATCheckInSectionProps> = ({ catName = 'CAT Centro' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [activeCheckin, setActiveCheckin] = useState<CATCheckin | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CATCheckin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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

  useEffect(() => {
    if (user?.id) {
      loadActiveCheckin();
      loadCheckInHistory();
    }
  }, [user]);

  const loadActiveCheckin = async () => {
    if (!user?.id) return;
    
    try {
      const active = await catCheckinService.getActiveCheckin(user.id);
      if (active) {
        setActiveCheckin(active);
        setIsCheckedIn(true);
        if (active.checkin_time) {
          setCheckInTime(new Date(active.checkin_time));
        }
      } else {
        setActiveCheckin(null);
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    } catch (error) {
      console.error('Erro ao carregar check-in ativo:', error);
    }
  };

  const loadCheckInHistory = async () => {
    if (!user?.id) return;
    
    try {
      const history = await catCheckinService.getAttendantCheckins(user.id, 10);
      setCheckInHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleCheckIn = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    // Verificar se já tem check-in ativo
    if (isCheckedIn && activeCheckin) {
      toast({
        title: 'Aviso',
        description: 'Você já possui um check-in ativo. Faça check-out primeiro.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setLocationError(null);

    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Obter precisão do GPS se disponível
      let accuracy: number | undefined;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : undefined;
      } catch (e) {
        // Ignorar erro de precisão
      }

      // Usar método correto do service que valida via RPC
      const result = await catCheckinService.registerCheckin(
        user.id,
        currentLocation.lat,
        currentLocation.lng,
        accuracy
      );

      if (result.success && result.data?.is_valid) {
        setActiveCheckin(result.data);
        setIsCheckedIn(true);
        if (result.data.checkin_time) {
          setCheckInTime(new Date(result.data.checkin_time));
        }
        toast({
          title: 'Sucesso',
          description: result.message || 'Check-in realizado com sucesso'
        });
        await loadCheckInHistory();
      } else {
        // Check-in foi rejeitado pela validação
        const errorMsg = result.message || 'Localização fora da área permitida ou fora do horário de trabalho';
        setLocationError(errorMsg);
        toast({
          title: 'Check-in não autorizado',
          description: errorMsg,
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao fazer check-in:', err);
      setLocationError(err.message || 'Erro ao obter localização');
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível fazer check-in',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;
    }

    if (!activeCheckin?.id) {
      toast({
        title: 'Erro',
        description: 'Nenhum check-in ativo encontrado',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setLocationError(null);

    try {
      // Obter localização atual para validar check-out
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      // Validar que está na área permitida (mesma validação do check-in)
      const catLocation = await catCheckinService.getCATLocation(catName);
      if (catLocation) {
        const distance = catCheckinService.calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          catLocation.latitude,
          catLocation.longitude
        );

        if (distance > catLocation.allowed_radius) {
          toast({
            title: 'Check-out não autorizado',
            description: `Você está ${Math.round(distance)}m do CAT. É necessário estar na área permitida para fazer check-out.`,
            variant: 'destructive'
          });
          setIsLoading(false);
          return;
        }
      }

      // Registrar check-out
      const result = await catCheckinService.registerCheckout(
        user.id,
        activeCheckin.id,
        currentLocation.lat,
        currentLocation.lng
      );

      if (result.success) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setActiveCheckin(null);
        toast({
          title: 'Sucesso',
          description: result.message || 'Check-out realizado com sucesso'
        });
        await loadCheckInHistory();
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Não foi possível fazer check-out',
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao fazer check-out:', err);
      setLocationError(err.message || 'Erro ao obter localização');
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível fazer check-out',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const calculateWorkedTime = (): string => {
    if (!checkInTime) return '00:00';
    
    const diff = Math.max(0, currentTime.getTime() - checkInTime.getTime());
    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Sistema de Check-in/Checkout - Layout como na Imagem */}
      <Card className="border border-slate-200 bg-white shadow-sm rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <UserCheck className="h-5 w-5" />
              Controle de Ponto Eletrônico
            </CardTitle>
            <Badge className={`px-3 py-1 text-sm ${isOnline ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
              {isOnline ? <Wifi className="h-4 w-4 mr-2 inline" /> : <WifiOff className="h-4 w-4 mr-2 inline" />}
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hora e Data - Centralizado no Topo */}
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-900 mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-base text-blue-700 capitalize">
              {formatDate(currentTime)}
            </div>
          </div>

          {/* Cards de Status e Tempo Trabalhado - Lado a Lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status do Trabalho */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-600 mb-2 text-center">
                Status do Trabalho
              </div>
              <div className="text-center">
                <Badge 
                  className={`px-3 py-1.5 text-sm font-semibold ${
                    isCheckedIn 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-400 text-white'
                  }`}
                >
                  {isCheckedIn ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5 inline" />
                      TRABALHANDO
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1.5 inline" />
                      FORA DO TRABALHO
                    </>
                  )}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                {isCheckedIn ? 'Você está em serviço' : 'Aguardando check-in'}
              </div>
            </div>
            
            {/* Tempo Trabalhado */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="text-sm font-medium text-gray-600 mb-2 text-center">
                Tempo de Trabalho Hoje
              </div>
              <div className="text-3xl font-bold text-blue-900 font-mono text-center">
                {calculateWorkedTime()}
              </div>
              {isCheckedIn && checkInTime && (
                <div className="text-xs text-gray-500 text-center mt-1">
                  Desde {checkInTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
          
          {/* Botão de Ação - Grande na Parte Inferior */}
          <div>
            {!isCheckedIn ? (
              <Button 
                onClick={handleCheckIn}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-base font-semibold py-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Fazer Check-in
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleCheckOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-base font-semibold py-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-5 w-5" />
                    Fazer Check-out
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Localização */}
          <div className="text-sm text-blue-700">
            <strong>Local:</strong> {catName}
            {location && (
              <span className="ml-2">
                ({location.lat.toFixed(6)}, {location.lng.toFixed(6)})
              </span>
            )}
            {locationError && (
              <span className="ml-2 text-red-600">
                - Erro: {locationError}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pontos - Card Separado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkInHistory.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum registro de ponto encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {checkInHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${record.is_valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {record.checkout_time ? 'Check-out' : 'Check-in'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.checkin_time ? new Date(record.checkin_time).toLocaleString('pt-BR') : 'Data não disponível'}
                        {record.checkout_time && ` - ${new Date(record.checkout_time).toLocaleTimeString('pt-BR')}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    record.is_valid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {record.is_valid ? 'Válido' : 'Inválido'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CATCheckInSection;

