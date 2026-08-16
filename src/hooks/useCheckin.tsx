
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from '@/components/management/utils/geoUtils';
import { catLocations } from '@/components/management/data/mockData';
import { useGeolocation } from './useGeolocation';
import { saveLocationToSupabase } from '@/services/geolocationService';

interface Attendant {
  id: string;
  name: string;
  cat: string;
  status: "active" | "inactive";
  lastCheckIn: string | null;
  lastCheckOut: string | null;
  coords?: { lat: number; lng: number };
  region: string;
}

export function useCheckin(attendants: Attendant[], setAttendants: React.Dispatch<React.SetStateAction<Attendant[]>>) {
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [selectedCat, setSelectedCat] = useState("");
  const { toast } = useToast();
  
  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    getCurrentPosition,
    hasLocation
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000
  });

  const initiateCheckIn = (catName: string) => {
    setSelectedCat(catName);
    getCurrentPosition();
    setShowLocationDialog(true);
  };

  const confirmCheckIn = async () => {
    if (!hasLocation || !selectedCat) {
      toast({
        title: "Erro no check-in",
        description: "Localização não disponível. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    const catCoords = catLocations[selectedCat as keyof typeof catLocations];
    if (!catCoords) {
      toast({
        title: "Erro no check-in",
        description: `Não foi possível encontrar as coordenadas do ${selectedCat}.`,
        variant: "destructive",
      });
      setShowLocationDialog(false);
      return;
    }
    
    const distance = calculateDistance(latitude!, longitude!, catCoords.lat, catCoords.lng);
    const isLocationValid = distance <= 2000; // 2km radius for testing
    
    if (isLocationValid) {
      try {
        // Save location to Supabase
        await saveLocationToSupabase({
          latitude: latitude!,
          longitude: longitude!,
          accuracy: accuracy || undefined,
          context: 'checkin',
          locationName: selectedCat
        });

        // Update local state
        const now = new Date().toISOString();
        const updatedAttendants = attendants.map(attendant => {
          if (attendant.cat === selectedCat) {
            return {
              ...attendant,
              lastCheckIn: now,
              lastCheckOut: null,
              status: "active" as const,
              coords: { lat: latitude!, lng: longitude! }
            };
          }
          return attendant;
        });
        
        setAttendants(updatedAttendants);
        
        toast({
          title: "Check-in realizado",
          description: `Check-in no ${selectedCat} registrado com sucesso. Precisão: ${accuracy?.toFixed(0)}m`,
        });
      } catch (error) {
        console.error("Erro ao salvar check-in:", error);
        toast({
          title: "Erro ao salvar check-in",
          description: "Check-in local realizado, mas não foi possível sincronizar com o servidor.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Localização inválida",
        description: `Você precisa estar próximo ao ${selectedCat} para fazer check-in (distância: ${distance.toFixed(2)}m).`,
        variant: "destructive",
      });
    }
    
    setShowLocationDialog(false);
  };

  return {
    showLocationDialog,
    setShowLocationDialog,
    selectedCat,
    userLocation: hasLocation ? { lat: latitude!, lng: longitude! } : null,
    initiateCheckIn,
    confirmCheckIn,
    loading,
    error
  };
}

export default useCheckin;
