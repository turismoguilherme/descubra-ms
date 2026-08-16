
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Navigation, AlertCircle } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance } from "./utils/geoUtils";
import { catLocations } from "./data/mockData";

interface AttendantLocation {
  id: string;
  name: string;
  cat: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy: number;
  };
  isOnDuty: boolean;
  distanceFromCAT?: number;
}

interface CATAttendantGeolocationProps {
  attendantId: string;
  attendantName: string;
  assignedCAT: string;
  onLocationUpdate?: (location: { lat: number; lng: number; accuracy: number }) => void;
}

const CATAttendantGeolocation = ({ 
  attendantId, 
  attendantName, 
  assignedCAT,
  onLocationUpdate 
}: CATAttendantGeolocationProps) => {
  const [attendantLocation, setAttendantLocation] = useState<AttendantLocation | null>(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
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
    timeout: 10000,
    watchPosition: trackingEnabled
  });

  // Atualizar localização quando obtida
  useEffect(() => {
    if (hasLocation && latitude && longitude && accuracy) {
      const catCoords = catLocations[assignedCAT as keyof typeof catLocations];
      let distanceFromCAT = 0;
      
      if (catCoords) {
        distanceFromCAT = calculateDistance(
          latitude,
          longitude,
          catCoords.lat,
          catCoords.lng
        );
      }

      const locationData = {
        id: attendantId,
        name: attendantName,
        cat: assignedCAT,
        lastLocation: {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
          accuracy
        },
        isOnDuty: distanceFromCAT <= 100, // Consideramos que está em serviço se estiver a menos de 100m do CAT
        distanceFromCAT
      };

      setAttendantLocation(locationData);
      
      if (onLocationUpdate) {
        onLocationUpdate({ 
          lat: latitude, 
          lng: longitude, 
          accuracy 
        });
      }

      // Salvar no localStorage para persistência
      localStorage.setItem(`attendant_location_${attendantId}`, JSON.stringify(locationData));
    }
  }, [latitude, longitude, accuracy, attendantId, attendantName, assignedCAT, hasLocation, onLocationUpdate]);

  // Carregar localização salva no localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem(`attendant_location_${attendantId}`);
    if (savedLocation) {
      try {
        setAttendantLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Erro ao carregar localização salva:', error);
      }
    }
  }, [attendantId]);

  const handleStartTracking = () => {
    setTrackingEnabled(true);
    getCurrentPosition();
    toast({
      title: "Rastreamento iniciado",
      description: "Sua localização será monitorada enquanto estiver em serviço.",
    });
  };

  const handleStopTracking = () => {
    setTrackingEnabled(false);
    toast({
      title: "Rastreamento parado",
      description: "O monitoramento de localização foi interrompido.",
    });
  };

  const getStatusColor = () => {
    if (!attendantLocation?.lastLocation) return 'gray';
    if (attendantLocation.isOnDuty) return 'green';
    if (attendantLocation.distanceFromCAT && attendantLocation.distanceFromCAT > 1000) return 'red';
    return 'yellow';
  };

  const getStatusText = () => {
    if (!attendantLocation?.lastLocation) return 'Localização não disponível';
    if (attendantLocation.isOnDuty) return 'Em serviço no CAT';
    if (attendantLocation.distanceFromCAT && attendantLocation.distanceFromCAT > 1000) return 'Fora do CAT';
    return 'Próximo ao CAT';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="w-5 h-5 mr-2" />
            Localização do Atendente
          </div>
          <Badge 
            variant={getStatusColor() === 'green' ? 'default' : 'secondary'}
            className={
              getStatusColor() === 'green' ? 'bg-green-500' :
              getStatusColor() === 'red' ? 'bg-red-500' :
              getStatusColor() === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500'
            }
          >
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{attendantName}</p>
            <p className="text-sm text-gray-600">{assignedCAT}</p>
          </div>
          
          {!trackingEnabled ? (
            <Button onClick={handleStartTracking} disabled={loading}>
              <MapPin className="w-4 h-4 mr-2" />
              {loading ? 'Obtendo...' : 'Iniciar Rastreamento'}
            </Button>
          ) : (
            <Button onClick={handleStopTracking} variant="outline">
              Parar Rastreamento
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {attendantLocation?.lastLocation && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Última localização:</span>
              <span className="text-gray-600">
                {new Date(attendantLocation.lastLocation.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <br />
                <span className="font-mono">{attendantLocation.lastLocation.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <br />
                <span className="font-mono">{attendantLocation.lastLocation.longitude.toFixed(6)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Precisão:</span>
              <span className="text-gray-600">{attendantLocation.lastLocation.accuracy.toFixed(0)}m</span>
            </div>
            
            {attendantLocation.distanceFromCAT !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span>Distância do CAT:</span>
                <span className="text-gray-600">
                  {attendantLocation.distanceFromCAT > 1000 
                    ? `${(attendantLocation.distanceFromCAT / 1000).toFixed(2)} km`
                    : `${attendantLocation.distanceFromCAT.toFixed(0)} m`
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {trackingEnabled && (
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm text-blue-700">
              Rastreamento ativo - Localização sendo monitorada
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CATAttendantGeolocation;
