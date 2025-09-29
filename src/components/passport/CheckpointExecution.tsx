import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Camera, 
  Trophy,
  Navigation,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';
import { RouteCheckpoint } from '@/types/passport';
import PhotoUploadSection from './PhotoUploadSection';

interface CheckpointExecutionProps {
  checkpoint: RouteCheckpoint;
  onComplete: (checkpointId: string, points: number, photo?: File) => void;
  userLocation: { lat: number; lng: number } | null;
  checkpointNumber: number;
  totalCheckpoints: number;
}

const CheckpointExecution: React.FC<CheckpointExecutionProps> = ({
  checkpoint,
  onComplete,
  userLocation,
  checkpointNumber,
  totalCheckpoints
}) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);

  useEffect(() => {
    if (userLocation) {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        checkpoint.latitude,
        checkpoint.longitude
      );
      setDistance(dist);
      setIsNearby(dist <= (checkpoint.validation_radius_meters || 100));
    }
  }, [userLocation, checkpoint]);

  useEffect(() => {
    if (checkpoint.requires_photo) {
      setCanCheckIn(isNearby && uploadedPhoto !== null);
    } else {
      setCanCheckIn(isNearby);
    }
  }, [isNearby, uploadedPhoto, checkpoint.requires_photo]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const handleCheckIn = () => {
    if (canCheckIn) {
      onComplete(checkpoint.id, checkpoint.points_reward || 10, uploadedPhoto || undefined);
    }
  };

  const handlePhotoUpload = (file: File) => {
    setUploadedPhoto(file);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-ms-accent-orange text-white mb-2">
              Checkpoint {checkpointNumber} de {totalCheckpoints}
            </Badge>
            <CardTitle className="text-2xl">{checkpoint.name}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-1">📍</div>
            <div className="text-xs text-white/80">Localização</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Descrição */}
        <div>
          <p className="text-white/90 text-lg leading-relaxed">
            {checkpoint.description}
          </p>
        </div>

        {/* Status de proximidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4 text-center">
              <Navigation className={`w-8 h-8 mx-auto mb-2 ${isNearby ? 'text-green-400' : 'text-yellow-400'}`} />
              <div className="text-sm text-white/80">Distância</div>
              <div className="font-bold">
                {distance ? formatDistance(distance) : 'Calculando...'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-sm text-white/80">Pontos</div>
              <div className="font-bold">{checkpoint.points_reward || 10}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-4 text-center">
              <Target className={`w-8 h-8 mx-auto mb-2 ${isNearby ? 'text-green-400' : 'text-gray-400'}`} />
              <div className="text-sm text-white/80">Status</div>
              <div className="font-bold">
                {isNearby ? 'No local' : 'Distante'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicador de proximidade */}
        {!isNearby && distance && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="font-semibold text-yellow-100">Aproxime-se do local</div>
                <div className="text-sm text-yellow-200">
                  Você precisa estar a menos de {checkpoint.validation_radius_meters || 100}m para fazer o check-in
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload de foto */}
        {checkpoint.requires_photo && (
          <div>
            <h4 className="font-semibold mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-yellow-400" />
              Foto obrigatória
            </h4>
            <PhotoUploadSection
              onPhotoUploaded={handlePhotoUpload}
              isRequired={true}
              disabled={!isNearby}
            />
          </div>
        )}

        {/* Botão de check-in */}
        <div className="pt-4">
          <Button
            onClick={handleCheckIn}
            disabled={!canCheckIn}
            className={`w-full py-3 text-lg ${
              canCheckIn 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {canCheckIn ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Fazer Check-in
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                {!isNearby ? 'Aproxime-se do local' : 'Tire uma foto para continuar'}
              </>
            )}
          </Button>
        </div>

        {/* Dicas */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <h5 className="font-semibold text-blue-100 mb-2">💡 Dica cultural</h5>
          <p className="text-sm text-blue-200">
            Este local tem uma história rica na formação cultural de Mato Grosso do Sul. 
            Observe os detalhes arquitetônicos e a influência das diferentes culturas que moldaram nossa região.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckpointExecution;