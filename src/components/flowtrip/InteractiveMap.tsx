import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, CheckCircle, Clock, Star } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  image_url?: string;
  region?: string;
}

interface CheckInLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  hasCheckedIn: boolean;
}

const InteractiveMap = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [checkInLocations, setCheckInLocations] = useState<CheckInLocation[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const { addStamp, passportStamps, currentState } = useFlowTrip();
  const { toast } = useToast();

  useEffect(() => {
    fetchDestinations();
    getUserLocation();
  }, [currentState]);

  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .limit(20);

      if (error) throw error;
      
      const destinationsWithCheckins = data?.map(dest => ({
        ...dest,
        hasCheckedIn: passportStamps.some(stamp => stamp.destination_id === dest.id)
      })) || [];

      setDestinations(destinationsWithCheckins);
      
      // Simular localizações para check-in (em produção seria baseado em coordenadas reais)
      const mockLocations: CheckInLocation[] = destinationsWithCheckins.map(dest => ({
        id: dest.id,
        name: dest.name,
        latitude: -20.4435 + (Math.random() - 0.5) * 0.1,
        longitude: -54.6478 + (Math.random() - 0.5) * 0.1,
        hasCheckedIn: passportStamps.some(stamp => stamp.destination_id === dest.id)
      }));
      
      setCheckInLocations(mockLocations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Usar localização padrão de Campo Grande, MS
          setUserLocation({
            lat: -20.4435,
            lng: -54.6478
          });
        }
      );
    } else {
      // Fallback para Campo Grande, MS
      setUserLocation({
        lat: -20.4435,
        lng: -54.6478
      });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCheckIn = async (location: CheckInLocation) => {
    if (!userLocation) {
      toast({
        title: 'Localização não disponível',
        description: 'Permita o acesso à localização para fazer check-in.',
        variant: 'destructive'
      });
      return;
    }

    setIsCheckingIn(true);
    try {
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        location.latitude, location.longitude
      );

      // Permitir check-in se estiver a menos de 5km (para demonstração)
      if (distance <= 5) {
        await addStamp({
          destination_id: location.id,
          activity_type: 'check_in',
          points_earned: 10,
          latitude: userLocation.lat,
          longitude: userLocation.lng
        });

        toast({
          title: '✅ Check-in realizado!',
          description: `+10 pontos! Você fez check-in em ${location.name}`,
        });

        // Atualizar status local
        setCheckInLocations(prev => 
          prev.map(loc => 
            loc.id === location.id 
              ? { ...loc, hasCheckedIn: true }
              : loc
          )
        );
      } else {
        toast({
          title: 'Muito longe',
          description: `Você precisa estar mais próximo de ${location.name} para fazer check-in.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Erro no check-in',
        description: 'Não foi possível realizar o check-in.',
        variant: 'destructive'
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader className="h-24 bg-muted/50" />
          <CardContent className="h-64 bg-muted/20" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            Mapa Interativo
          </CardTitle>
          <p className="text-white/80">
            Faça check-in nos destinos e ganhe pontos!
          </p>
        </CardHeader>
      </Card>

      {/* User Location Status */}
      {userLocation && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Navigation className="h-5 w-5" />
              <span>Localização ativa - Pronto para check-ins!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 text-center">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Mapa Interativo</h3>
            <p className="text-muted-foreground mb-4">
              Visualize destinos próximos e faça check-in para ganhar pontos
            </p>
            <Badge variant="outline" className="bg-white">
              Funcionalidade em desenvolvimento
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Destinations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Destinos Próximos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checkInLocations.map((location) => {
              const destination = destinations.find(d => d.id === location.id);
              const distance = userLocation 
                ? calculateDistance(userLocation.lat, userLocation.lng, location.latitude, location.longitude)
                : 0;

              return (
                <div
                  key={location.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedDestination?.id === location.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDestination(destination || null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {destination?.location || 'Localização'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {distance.toFixed(1)} km de distância
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {location.hasCheckedIn ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Visitado
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckIn(location);
                          }}
                          disabled={isCheckingIn}
                          className="gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          Check-in (+10pts)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Destination Details */}
      {selectedDestination && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{selectedDestination.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDestination.image_url && (
                <img 
                  src={selectedDestination.image_url} 
                  alt={selectedDestination.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <p className="text-muted-foreground">
                {selectedDestination.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedDestination.location}</span>
              </div>
              {selectedDestination.region && (
                <Badge variant="outline">{selectedDestination.region}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InteractiveMap;