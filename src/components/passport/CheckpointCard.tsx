
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, Navigation } from "lucide-react";
import { RouteCheckpoint } from "@/types/passport";
import { calculateDistance } from "@/services/passport";

interface CheckpointCardProps {
  checkpoint: RouteCheckpoint;
  isCompleted: boolean;
  onCheckIn: (checkpoint: RouteCheckpoint, userLocation: { lat: number; lng: number }) => void;
  userLocation: { lat: number; lng: number } | null;
}

const CheckpointCard: React.FC<CheckpointCardProps> = ({
  checkpoint,
  isCompleted,
  onCheckIn,
  userLocation
}) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const distance = userLocation 
    ? calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        checkpoint.latitude, 
        checkpoint.longitude
      )
    : null;

  const validationRadius = checkpoint.validation_radius_meters || 100;
  const isNearby = distance !== null && distance <= validationRadius;

  const handleCheckIn = async () => {
    if (!userLocation || !isNearby) return;

    setIsCheckingIn(true);
    try {
      await onCheckIn(checkpoint, userLocation);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Card className={`${isCompleted ? 'border-green-500 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
              {checkpoint.order_index}
            </span>
            {checkpoint.name}
          </CardTitle>
          {isCompleted && (
            <Badge className="bg-green-600 text-white">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {checkpoint.description && (
          <p className="text-gray-600 mb-4">{checkpoint.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span>Lat: {checkpoint.latitude}, Lng: {checkpoint.longitude}</span>
          </div>

          {checkpoint.required_time_minutes && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>Tempo mínimo: {checkpoint.required_time_minutes} minutos</span>
            </div>
          )}

          {distance !== null && (
            <div className="flex items-center text-sm">
              <Navigation className="w-4 h-4 mr-2" />
              <span className={isNearby ? 'text-green-600' : 'text-orange-600'}>
                Distância: {distance.toFixed(0)}m (raio: {validationRadius}m)
              </span>
            </div>
          )}
        </div>

        {checkpoint.promotional_text && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">{checkpoint.promotional_text}</p>
          </div>
        )}

        {checkpoint.image_url && (
          <div className="mb-4">
            <img 
              src={checkpoint.image_url} 
              alt={checkpoint.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {checkpoint.video_url && (
          <div className="mb-4">
            <video 
              controls 
              className="w-full rounded-lg"
              poster={checkpoint.image_url}
            >
              <source src={checkpoint.video_url} type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        )}

        {!isCompleted && (
          <Button
            onClick={handleCheckIn}
            disabled={!isNearby || isCheckingIn}
            className="w-full"
            variant={isNearby ? "default" : "outline"}
          >
            {isCheckingIn ? 'Fazendo Check-in...' : 
             !userLocation ? 'Localização necessária' :
             !isNearby ? `Aproxime-se mais (${distance?.toFixed(0)}m de ${validationRadius}m)` :
             'Fazer Check-in'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckpointCard;
