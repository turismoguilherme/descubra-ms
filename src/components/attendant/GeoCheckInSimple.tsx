import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface CheckInRecord {
  id: string;
  user_id: string;
  cat_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  status: string;
}

const GeoCheckInSimple = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckInRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentLocation();
    checkCurrentStatus();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não suportada pelo seu navegador",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        toast({
          title: "Erro de Localização",
          description: "Não foi possível obter sua localização",
          variant: "destructive"
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const checkCurrentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('cat_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setIsCheckedIn(true);
        setLastCheckIn(data);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      toast({
        title: "Erro",
        description: "Localização não disponível",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('cat_checkins')
        .insert({
          user_id: user.id,
          cat_name: 'CAT Móvel', // Nome padrão
          latitude: location.lat,
          longitude: location.lng,
          status: 'active',
          distance_from_cat: 0 // Calculado no servidor se necessário
        })
        .select()
        .single();

      if (error) throw error;

      setIsCheckedIn(true);
      setLastCheckIn(data);
      
      toast({
        title: "Check-in Realizado",
        description: "Check-in realizado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o check-in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Check-in CAT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status atual */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Status:</span>
            <Badge variant={isCheckedIn ? "default" : "outline"}>
              {isCheckedIn ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ativo
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Inativo
                </>
              )}
            </Badge>
          </div>

          {/* Localização atual */}
          {location && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Localização Atual</span>
              </div>
              <p className="text-sm text-blue-700">
                Lat: {location.lat.toFixed(6)}<br />
                Lng: {location.lng.toFixed(6)}
              </p>
              {location.accuracy && (
                <p className="text-xs text-blue-600 mt-1">
                  Precisão: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
          )}

          {/* Último check-in */}
          {lastCheckIn && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Último Check-in</span>
              </div>
              <p className="text-sm text-green-700">
                {new Date(lastCheckIn.created_at).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-green-600">
                {lastCheckIn.cat_name}
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-2">
            <Button 
              onClick={getCurrentLocation} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Atualizar Localização
            </Button>
            
            <Button 
              onClick={handleCheckIn}
              className="w-full"
              disabled={loading || !location}
            >
              {loading ? "Processando..." : "Fazer Check-in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoCheckInSimple;