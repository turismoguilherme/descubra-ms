
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CATLocation, CATCheckin } from '@/types/cat';

interface UseCATCheckinProps {
  assignedCAT?: string;
}

export const useCATCheckin = ({ assignedCAT }: UseCATCheckinProps = {}) => {
  const [catLocations, setCatLocations] = useState<CATLocation[]>([]);
  const [selectedCAT, setSelectedCAT] = useState<string>(assignedCAT || '');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkinHistory, setCheckinHistory] = useState<CATCheckin[]>([]);
  const [todayCheckins, setTodayCheckins] = useState<CATCheckin[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  
  const { toast } = useToast();

  // Buscar localizações dos CATs
  useEffect(() => {
    const fetchCATLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('cat_locations')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        setCatLocations(data || []);
      } catch (error) {
        console.error('Erro ao buscar localizações dos CATs:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as localizações dos CATs.",
          variant: "destructive",
        });
      }
    };

    fetchCATLocations();
  }, [toast]);

  // Buscar histórico de check-ins
  useEffect(() => {
    const fetchCheckinHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('cat_checkins')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        const formattedData = (data || []).map(item => ({
          ...item,
          checkin_time: item.timestamp // Alias para compatibilidade
        }));
        
        setCheckinHistory(formattedData);

        // Filtrar check-ins de hoje
        const today = new Date().toDateString();
        const todayData = formattedData.filter(checkin => 
          new Date(checkin.timestamp).toDateString() === today
        );
        setTodayCheckins(todayData);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    fetchCheckinHistory();
  }, []);

  // Obter localização atual
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada neste navegador.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setHasLocation(true);
        setLocationLoading(false);
      },
      (error) => {
        setLocationError('Não foi possível obter sua localização.');
        setLocationLoading(false);
        console.error('Erro de geolocalização:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Efeito para obter localização automaticamente
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const performCheckin = async () => {
    if (!selectedCAT || !latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Selecione um CAT e aguarde a localização ser obtida.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingIn(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para fazer check-in.",
          variant: "destructive",
        });
        return;
      }

      // Buscar localização do CAT selecionado
      const selectedCATLocation = catLocations.find(cat => cat.cat_name === selectedCAT);
      if (!selectedCATLocation) {
        toast({
          title: "Erro",
          description: "CAT selecionado não encontrado.",
          variant: "destructive",
        });
        return;
      }

      // Calcular distância
      const distance = calculateDistance(
        latitude,
        longitude,
        selectedCATLocation.latitude,
        selectedCATLocation.longitude
      );

      const status = distance <= 100 ? 'confirmado' : 'fora_da_area';

      const { error } = await supabase.from('cat_checkins').insert({
        user_id: user.id,
        cat_name: selectedCAT,
        latitude,
        longitude,
        distance_from_cat: Math.round(distance),
        status
      });

      if (error) throw error;

      toast({
        title: "Check-in realizado!",
        description: status === 'confirmado' 
          ? "Check-in confirmado com sucesso!" 
          : "Check-in registrado, mas você está fora da área do CAT.",
        variant: status === 'confirmado' ? "default" : "destructive",
      });

      // Recarregar histórico
      window.location.reload();
    } catch (error) {
      console.error('Erro no check-in:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o check-in.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const canCheckin = selectedCAT && hasLocation && !isCheckingIn && !locationLoading;

  return {
    catLocations,
    selectedCAT,
    setSelectedCAT,
    isCheckingIn,
    checkinHistory,
    todayCheckins,
    locationLoading,
    locationError,
    hasLocation,
    latitude,
    longitude,
    accuracy,
    performCheckin,
    canCheckin
  };
};
