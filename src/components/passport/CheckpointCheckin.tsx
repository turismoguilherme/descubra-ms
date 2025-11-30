import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePassport } from '@/hooks/usePassport';
import { geolocationService } from '@/services/passport/geolocationService';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { RouteCheckpointExtended, GeofenceValidation } from '@/types/passportDigital';

interface CheckpointCheckinProps {
  checkpoint: RouteCheckpointExtended;
  routeId: string;
  onCheckinSuccess?: () => void;
}

const CheckpointCheckin: React.FC<CheckpointCheckinProps> = ({
  checkpoint,
  routeId,
  onCheckinSuccess,
}) => {
  const { checkIn } = usePassport();
  const { toast } = useToast();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<GeofenceValidation | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  /**
   * Obter localização atual
   */
  const getCurrentLocation = async () => {
    try {
      setValidating(true);
      const loc = await geolocationService.getCurrentLocation();
      setLocation({ lat: loc.latitude, lon: loc.longitude });

      // Validar proximidade
      if (checkpoint.latitude && checkpoint.longitude) {
        const validation = await geolocationService.validateProximity(
          checkpoint.id,
          loc.latitude,
          loc.longitude
        );
        setValidation(validation);
      } else {
        // Se checkpoint não tem coordenadas, permitir check-in
        setValidation({
          valid: true,
          distance: 0,
          within_radius: true,
          checkpoint_id: checkpoint.id,
          checkpoint_name: checkpoint.name,
          required_radius: checkpoint.geofence_radius || 100,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao obter localização',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  /**
   * Capturar foto
   */
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Fazer check-in
   */
  const handleCheckin = async () => {
    if (!location) {
      toast({
        title: 'Localização necessária',
        description: 'Por favor, obtenha sua localização primeiro.',
        variant: 'destructive',
      });
      return;
    }

    if (validation && !validation.valid) {
      toast({
        title: 'Fora do alcance',
        description: `Você está a ${validation.distance}m do checkpoint. Aproxime-se mais.`,
        variant: 'destructive',
      });
      return;
    }

    // Upload de foto se necessário
    let photoUrl: string | undefined;
    if (photo) {
      // TODO: Implementar upload de foto para Supabase Storage
      // Por enquanto, apenas salvar referência
      photoUrl = photoPreview || undefined;
    }

    try {
      setCheckingIn(true);
      const result = await checkIn(checkpoint.id, location.lat, location.lon, photoUrl);

      if (result.success) {
        toast({
          title: 'Check-in realizado!',
          description: result.route_completed
            ? 'Parabéns! Você completou o roteiro!'
            : `Você coletou o fragmento ${result.fragment_collected || ''} do carimbo.`,
        });

        if (result.rewards_unlocked && result.rewards_unlocked.length > 0) {
          toast({
            title: 'Recompensas desbloqueadas!',
            description: `${result.rewards_unlocked.length} recompensa(s) disponível(is).`,
          });
        }

        onCheckinSuccess?.();
      } else {
        toast({
          title: 'Erro no check-in',
          description: result.error || 'Não foi possível fazer o check-in.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Obter localização automaticamente ao montar
  useEffect(() => {
    getCurrentLocation();
  }, [checkpoint.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {checkpoint.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkpoint.description && (
          <p className="text-muted-foreground">{checkpoint.description}</p>
        )}

        {/* Status de Localização */}
        <div className="space-y-2">
          {validating ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Obtendo localização...
            </div>
          ) : location ? (
            <div className="space-y-2">
              {validation ? (
                <div
                  className={`p-3 rounded-md border ${
                    validation.valid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validation.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">
                        {validation.valid
                          ? 'Você está no local correto!'
                          : 'Você está muito longe'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Distância: {validation.distance}m (raio permitido: {validation.required_radius}m)
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Badge variant="outline">Localização obtida</Badge>
              )}
            </div>
          ) : (
            <Button onClick={getCurrentLocation} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Obter Localização
            </Button>
          )}
        </div>

        {/* Upload de Foto */}
        {(checkpoint.requires_photo || photo) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Foto (opcional)</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
                id="photo-input"
              />
              <label
                htmlFor="photo-input"
                className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
              >
                <Camera className="h-4 w-4" />
                {photo ? 'Trocar Foto' : 'Tirar Foto'}
              </label>
            </div>
            {photoPreview && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full max-w-xs rounded-md border"
                />
              </div>
            )}
          </div>
        )}

        {/* Botão de Check-in */}
        <Button
          onClick={handleCheckin}
          disabled={!location || (validation && !validation.valid) || checkingIn}
          className="w-full"
          size="lg"
        >
          {checkingIn ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Fazer Check-in
            </>
          )}
        </Button>

        {!checkpoint.requires_photo && (
          <p className="text-xs text-muted-foreground text-center">
            A foto é opcional, mas ajuda a comprovar sua visita
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckpointCheckin;

