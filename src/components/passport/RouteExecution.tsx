
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Camera, CheckCircle, Clock, Navigation } from "lucide-react";
import { TouristRoute, RouteCheckpoint } from "@/types/passport";
import { fetchRouteCheckpoints, createUserCheckin, calculateDistance } from "@/services/passport";
import { useToast } from "@/hooks/use-toast";

interface RouteExecutionProps {
  route: TouristRoute;
  onComplete: (routeId: string, proofPhoto?: File, notes?: string) => void;
}

const RouteExecution = ({ route, onComplete }: RouteExecutionProps) => {
  const [checkpoints, setCheckpoints] = useState<RouteCheckpoint[]>([]);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<string>>(new Set());
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCheckpoints();
    getCurrentLocation();
  }, [route.id]);

  const loadCheckpoints = async () => {
    try {
      setLoading(true);
      const data = await fetchRouteCheckpoints(route.id);
      // Ensure all checkpoints have required timestamp fields
      const formattedData = data.map(checkpoint => ({
        ...checkpoint,
        created_at: checkpoint.created_at || new Date().toISOString(),
        updated_at: checkpoint.updated_at || new Date().toISOString()
      }));
      setCheckpoints(formattedData);
    } catch (error) {
      console.error("Error loading checkpoints:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pontos de checkin do roteiro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Localização não disponível",
            description: "Não foi possível obter sua localização atual",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleCheckIn = async (checkpoint: RouteCheckpoint) => {
    if (!currentLocation) {
      toast({
        title: "Localização necessária",
        description: "É necessário permitir acesso à localização para fazer check-in",
        variant: "destructive",
      });
      return;
    }

    // Check if user is within valid range
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      checkpoint.latitude,
      checkpoint.longitude
    );

    const validationRadius = (checkpoint.validation_radius_meters || 50) / 1000; // Convert to km
    
    if (distance > validationRadius) {
      toast({
        title: "Muito longe do ponto",
        description: `Você precisa estar a menos de ${checkpoint.validation_radius_meters || 50}m do ponto para fazer check-in`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createUserCheckin({
        user_id: "", // Will be set by RLS
        route_id: route.id,
        checkpoint_id: checkpoint.id,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        checkin_at: new Date().toISOString()
      });

      setCompletedCheckpoints(prev => new Set([...prev, checkpoint.id]));
      
      toast({
        title: "Check-in realizado!",
        description: `Você fez check-in em ${checkpoint.name}`,
      });

      // Check if all checkpoints are completed
      if (completedCheckpoints.size + 1 === checkpoints.length) {
        toast({
          title: "Parabéns!",
          description: "Você completou todos os pontos do roteiro!",
        });
      }
    } catch (error) {
      console.error("Error creating checkin:", error);
      toast({
        title: "Erro no check-in",
        description: "Não foi possível registrar o check-in. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteRoute = () => {
    if (completedCheckpoints.size < checkpoints.length) {
      toast({
        title: "Roteiro incompleto",
        description: "Você precisa completar todos os pontos antes de finalizar o roteiro",
        variant: "destructive",
      });
      return;
    }

    onComplete(route.id);
  };

  const getDistanceToCheckpoint = (checkpoint: RouteCheckpoint) => {
    if (!currentLocation) return null;
    
    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      checkpoint.latitude,
      checkpoint.longitude
    );
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando pontos do roteiro...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            {route.name}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {route.estimated_duration} min
            </div>
            <Badge variant="outline">
              {completedCheckpoints.size}/{checkpoints.length} pontos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {route.description && (
            <p className="text-gray-600 mb-4">{route.description}</p>
          )}
          
          {completedCheckpoints.size === checkpoints.length && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Roteiro Completo!</span>
              </div>
              <p className="text-green-700 mt-1">
                Parabéns! Você visitou todos os pontos deste roteiro.
              </p>
              <Button 
                onClick={handleCompleteRoute}
                className="mt-3 bg-green-600 hover:bg-green-700"
              >
                Finalizar e Ganhar Selo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {checkpoints.map((checkpoint, index) => (
          <Card key={checkpoint.id} className={`${
            completedCheckpoints.has(checkpoint.id) 
              ? 'bg-green-50 border-green-200' 
              : 'bg-white'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      Ponto {index + 1}
                    </Badge>
                    {completedCheckpoints.has(checkpoint.id) && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  <h4 className="font-semibold mb-1">{checkpoint.name}</h4>
                  
                  {checkpoint.description && (
                    <p className="text-gray-600 text-sm mb-2">{checkpoint.description}</p>
                  )}
                  
                  {checkpoint.promotional_text && (
                    <p className="text-blue-600 text-sm mb-2 italic">
                      {checkpoint.promotional_text}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getDistanceToCheckpoint(checkpoint) || "Calculando..."}
                    </div>
                    {checkpoint.required_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {checkpoint.required_time_minutes} min
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  {completedCheckpoints.has(checkpoint.id) ? (
                    <Badge className="bg-green-600">
                      Concluído
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(checkpoint)}
                      disabled={!currentLocation}
                      className="flex items-center gap-1"
                    >
                      <Camera className="w-4 h-4" />
                      Check-in
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RouteExecution;
