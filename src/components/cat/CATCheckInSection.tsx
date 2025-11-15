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
    loadCheckInHistory();
  }, [user]);

  const loadCheckInHistory = async () => {
    if (!user?.id) return;
    
    try {
      // TODO: Implementar busca de histórico do Supabase
      // Por enquanto usar dados mockados
      setCheckInHistory([]);
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

    setIsLoading(true);
    setLocationError(null);

    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      const catLocation = await catCheckinService.getCATLocation(catName);
      if (!catLocation) {
        throw new Error('CAT não encontrado');
      }

      const distance = catCheckinService.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        catLocation.latitude,
        catLocation.longitude
      );

      const status = distance <= catLocation.radius_meters ? 'confirmado' : 'fora_da_area';

      const checkinData: Omit<CATCheckin, 'id'> = {
        attendant_id: user.id,
        attendant_name: user.email || 'Atendente',
        cat_name: catName,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        status,
        distance_from_cat: Math.round(distance),
        device_info: navigator.userAgent
      };

      const result = await catCheckinService.registerCheckin(checkinData);

      if (result && status === 'confirmado') {
        setIsCheckedIn(true);
        setCheckInTime(new Date());
        toast({
          title: 'Sucesso',
          description: 'Check-in realizado com sucesso'
        });
        await loadCheckInHistory();
      } else {
        toast({
          title: 'Aviso',
          description: `Você está ${Math.round(distance)}m do CAT. Verifique sua localização.`,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Erro ao fazer check-in:', error);
      setLocationError(error.message || 'Erro ao obter localização');
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

    setIsLoading(true);

    try {
      // TODO: Implementar check-out no Supabase
      setIsCheckedIn(false);
      setCheckInTime(null);
      toast({
        title: 'Sucesso',
        description: 'Check-out realizado com sucesso'
      });
      await loadCheckInHistory();
    } catch (error) {
      console.error('Erro ao fazer check-out:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer check-out',
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
                    <div className={`w-2 h-2 rounded-full ${record.status === 'confirmado' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {record.status === 'confirmado' ? 'Check-in' : 'Check-out'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {record.created_at ? new Date(record.created_at).toLocaleString('pt-BR') : 'Data não disponível'}
                      </p>
                    </div>
                  </div>
                  <Badge className={
                    record.status === 'confirmado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {record.status === 'confirmado' ? 'Confirmado' : 'Fora da área'}
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

