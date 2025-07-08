
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
  });

  const { toast } = useToast();

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      const error = 'Geolocalização não é suportada neste navegador';
      setState(prev => ({ ...prev, error, loading: false }));
      toast({
        title: "Geolocalização não suportada",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy || true,
      timeout: options.timeout || 15000,
      maximumAge: options.maximumAge || 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Localização obtida:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada pelo usuário';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informações de localização não estão disponíveis';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout na solicitação de localização';
            break;
        }
        
        console.error('Geolocation error:', error);
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        
        toast({
          title: "Erro de Geolocalização",
          description: errorMessage,
          variant: "destructive",
        });
      },
      geolocationOptions
    );
  };

  useEffect(() => {
    if (options.watchPosition) {
      getCurrentPosition();
    }
  }, [options.watchPosition]);

  return {
    ...state,
    getCurrentPosition,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
};
