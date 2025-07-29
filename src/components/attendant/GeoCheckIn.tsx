import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, AlertCircle, Loader2, Navigation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
}

interface AllowedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowed_radius: number;
  working_hours: {
    start: string;
    end: string;
  };
}

interface CheckInStatus {
  type: 'idle' | 'loading' | 'success' | 'error' | 'invalid_location' | 'outside_hours';
  message?: string;
}

const GeoCheckIn: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [status, setStatus] = useState<CheckInStatus>({ type: 'idle' });
  const [allowedLocations, setAllowedLocations] = useState<AllowedLocation[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadAllowedLocations();
    checkCurrentStatus();
    
    // Solicitar localização automaticamente ao carregar
    if (user && !location) {
      getCurrentLocation();
    }
  }, [user]);

  // Solicitar localização novamente se o usuário negar e depois quiser tentar
  useEffect(() => {
    if (user && !location && status.type === 'idle') {
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 1000); // Aguarda 1 segundo após carregar para solicitar localização
      
      return () => clearTimeout(timer);
    }
  }, [user, location, status.type]);

  const loadAllowedLocations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('attendant_location_assignments')
        .select(`
          attendant_allowed_locations (
            id,
            name,
            address,
            latitude,
            longitude,
            allowed_radius,
            working_hours
          )
        `)
        .eq('attendant_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const locations = data?.map(item => item.attendant_allowed_locations).filter(Boolean) || [];
      setAllowedLocations(locations);
    } catch (error) {
      console.error('Erro ao carregar locais permitidos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os locais permitidos",
        variant: "destructive"
      });
    }
  };

  const checkCurrentStatus = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendant_checkins')
        .select('*')
        .eq('attendant_id', user.id)
        .gte('checkin_time', `${today}T00:00:00`)
        .order('checkin_time', { ascending: false })
        .limit(1)
        .single();

      if (data && !data.checkout_time) {
        setIsCheckedIn(true);
        setLastCheckIn(data);
      }
    } catch (error) {
      // Sem check-in hoje
      setIsCheckedIn(false);
    }
  };

  const getCurrentLocation = () => {
    setStatus({ type: 'loading', message: 'Solicitando permissão de localização...' });

    if (!navigator.geolocation) {
      setStatus({ 
        type: 'error', 
        message: 'Geolocalização não é suportada pelo seu navegador' 
      });
      toast({
        title: "Erro",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(newLocation);
        setStatus({ type: 'idle' });
        
        toast({
          title: "✅ Localização obtida",
          description: `Precisão: ${Math.round(newLocation.accuracy)}m - Pronto para check-in!`
        });
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        let message = 'Erro ao obter localização';
        let description = '';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada';
            description = 'Você precisa permitir o acesso à localização para fazer check-in. Clique no ícone de localização na barra de endereços e permita.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível';
            description = 'Não foi possível obter sua localização. Verifique se o GPS está ativo.';
            break;
          case error.TIMEOUT:
            message = 'Timeout ao obter localização';
            description = 'A localização demorou muito para ser obtida. Tente novamente.';
            break;
          default:
            description = 'Erro desconhecido ao acessar a localização.';
        }
        
        setStatus({ type: 'error', message });
        toast({
          title: message,
          description: description,
          variant: "destructive"
        });
      },
      { 
        enableHighAccuracy: true,
        timeout: 15000, // Aumentei para 15 segundos
        maximumAge: 30000 // Reduzido para 30 segundos para dados mais frescos
      }
    );
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // metros
  };

  const findValidLocation = (): { location: AllowedLocation; distance: number } | null => {
    if (!location) return null;

    for (const allowedLocation of allowedLocations) {
      const distance = calculateDistance(
        location.lat, location.lng,
        allowedLocation.latitude, allowedLocation.longitude
      );
      
      if (distance <= allowedLocation.allowed_radius) {
        return { location: allowedLocation, distance };
      }
    }
    
    return null;
  };

  const isWithinWorkingHours = (workingHours: { start: string; end: string }): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutos desde meia-noite
    
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const handleCheckIn = async () => {
    if (!location || !user) return;

    setStatus({ type: 'loading', message: 'Validando check-in...' });

    const validLocationData = findValidLocation();
    
    if (!validLocationData) {
      setStatus({ 
        type: 'invalid_location', 
        message: 'Você deve estar em um dos locais autorizados para fazer check-in' 
      });
      return;
    }

    // Verificar horário de trabalho
    if (!isWithinWorkingHours(validLocationData.location.working_hours)) {
      setStatus({ 
        type: 'outside_hours', 
        message: `Fora do horário de trabalho (${validLocationData.location.working_hours.start} - ${validLocationData.location.working_hours.end})` 
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendant_checkins')
        .insert({
          attendant_id: user.id,
          location_id: validLocationData.location.id,
          latitude: location.lat,
          longitude: location.lng,
          accuracy: location.accuracy,
          is_valid: true,
          client_slug: 'ms' // ou pegar do contexto
        })
        .select()
        .single();

      if (error) throw error;

      setIsCheckedIn(true);
      setLastCheckIn(data);
      setStatus({ 
        type: 'success', 
        message: `Check-in realizado em ${validLocationData.location.name}` 
      });

      toast({
        title: "Check-in realizado!",
        description: `Local: ${validLocationData.location.name}`,
      });

    } catch (error) {
      console.error('Erro no check-in:', error);
      setStatus({ 
        type: 'error', 
        message: 'Erro ao realizar check-in. Tente novamente.' 
      });
    }
  };

  const handleCheckOut = async () => {
    if (!lastCheckIn || !user) return;

    setStatus({ type: 'loading', message: 'Realizando check-out...' });

    try {
      const { error } = await supabase
        .from('attendant_checkins')
        .update({ 
          checkout_time: new Date().toISOString(),
          checkout_latitude: location?.lat,
          checkout_longitude: location?.lng
        })
        .eq('id', lastCheckIn.id);

      if (error) throw error;

      setIsCheckedIn(false);
      setLastCheckIn(null);
      setStatus({ 
        type: 'success', 
        message: 'Check-out realizado com sucesso' 
      });

      toast({
        title: "Check-out realizado!",
        description: "Tenha um bom dia de trabalho!",
      });

    } catch (error) {
      console.error('Erro no check-out:', error);
      setStatus({ 
        type: 'error', 
        message: 'Erro ao realizar check-out. Tente novamente.' 
      });
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'success': return 'text-green-600';
      case 'error': 
      case 'invalid_location': 
      case 'outside_hours': return 'text-red-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': 
      case 'invalid_location': 
      case 'outside_hours': return <AlertCircle className="h-5 w-5" />;
      case 'loading': return <Loader2 className="h-5 w-5 animate-spin" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Alerta de Permissão de Localização */}
      {!location && status.type === 'error' && status.message.includes('negada') && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">Permissão de Localização Necessária</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Para fazer check-in, você precisa permitir o acesso à sua localização.
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-amber-600">
                    <strong>Como permitir:</strong>
                  </p>
                  <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                    <li>Clique no ícone 🔒 ou 📍 na barra de endereços</li>
                    <li>Selecione "Permitir" para localização</li>
                    <li>Recarregue a página se necessário</li>
                  </ul>
                </div>
                <Button 
                  onClick={getCurrentLocation}
                  className="mt-3 w-full bg-amber-600 hover:bg-amber-700"
                  size="sm"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Atual */}
      <Card>
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isCheckedIn ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isCheckedIn ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <Clock className="h-8 w-8 text-gray-600" />
            )}
          </div>
          <CardTitle className="text-xl">
            {isCheckedIn ? 'Você está trabalhando' : 'Fazer Check-in'}
          </CardTitle>
          {isCheckedIn && lastCheckIn && (
            <p className="text-sm text-gray-600">
              Desde: {new Date(lastCheckIn.checkin_time).toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Informações de Localização */}
      {status.type === 'loading' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Obtendo Localização...</p>
                <p className="text-xs text-blue-600">
                  {status.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {location && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Localização Confirmada</p>
                <p className="text-xs text-green-600 font-mono">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
                <p className="text-xs text-green-600">
                  Precisão: {Math.round(location.accuracy)}m ✅
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card quando não há localização ainda */}
      {!location && status.type === 'idle' && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Localização Necessária</p>
            <p className="text-xs text-gray-500 mb-3">
              Clique no botão abaixo para obter sua localização
            </p>
            <Button 
              onClick={getCurrentLocation}
              className="w-full"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Obter Localização
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Message */}
      {status.message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          status.type === 'success' ? 'bg-green-50' :
          status.type === 'error' || status.type === 'invalid_location' || status.type === 'outside_hours' ? 'bg-red-50' :
          status.type === 'loading' ? 'bg-blue-50' : 'bg-gray-50'
        }`}>
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <p className={`text-sm ${getStatusColor()}`}>
            {status.message}
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="space-y-3">
        {!location && (
          <Button 
            onClick={getCurrentLocation}
            disabled={status.type === 'loading'}
            className="w-full"
            size="lg"
          >
            {status.type === 'loading' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5 mr-2" />
            )}
            Obter Localização
          </Button>
        )}

        {location && !isCheckedIn && (
          <Button 
            onClick={handleCheckIn}
            disabled={status.type === 'loading' || allowedLocations.length === 0}
            className="w-full bg-green-500 hover:bg-green-600"
            size="lg"
          >
            {status.type === 'loading' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2" />
            )}
            Fazer Check-in
          </Button>
        )}

        {location && isCheckedIn && (
          <Button 
            onClick={handleCheckOut}
            disabled={status.type === 'loading'}
            className="w-full bg-red-500 hover:bg-red-600"
            size="lg"
          >
            {status.type === 'loading' ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Clock className="h-5 w-5 mr-2" />
            )}
            Fazer Check-out
          </Button>
        )}

        {location && (
          <Button 
            onClick={getCurrentLocation}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Atualizar Localização
          </Button>
        )}
      </div>

      {/* Locais Permitidos */}
      {allowedLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Locais Autorizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allowedLocations.map((loc) => (
              <div key={loc.id} className="border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{loc.name}</h4>
                    <p className="text-xs text-gray-600">{loc.address}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Raio: {loc.allowed_radius}m
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {loc.working_hours.start} - {loc.working_hours.end}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {allowedLocations.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Nenhum local autorizado encontrado.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Entre em contato com seu gestor.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeoCheckIn; 