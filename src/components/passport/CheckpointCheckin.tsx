import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePassport } from '@/hooks/usePassport';
import { geolocationService } from '@/services/passport/geolocationService';
import { passportService } from '@/services/passport/passportService';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Camera, CheckCircle2, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const [location, setLocation] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<GeofenceValidation | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [partnerCode, setPartnerCode] = useState('');

  // Log do estado do botão sempre que mudar
  useEffect(() => {
    const isDisabled = !location || (validation && !validation.valid) || checkingIn;
    console.log('🔵 [CheckpointCheckin] Estado do botão atualizado', {
      hasLocation: !!location,
      validationValid: validation?.valid,
      checkingIn,
      isDisabled,
      location,
      validation,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:useEffect',message:'Estado do botão atualizado',data:{hasLocation:!!location,validationValid:validation?.valid,checkingIn,isDisabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch((e)=>{console.error('❌ [CheckpointCheckin] Erro ao enviar log:',e);});
    // #endregion
  }, [location, validation, checkingIn]);

  /**
   * Obter localização atual
   */
  const getCurrentLocation = async () => {
    try {
      console.log('🔵 [CheckpointCheckin] getCurrentLocation chamado');
      setValidating(true);
      const loc = await geolocationService.getCurrentLocation();
      console.log('🔵 [CheckpointCheckin] Localização obtida', {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        accuracyInMeters: Math.round(loc.accuracy || 0),
      });
      setLocation({ 
        lat: loc.latitude, 
        lon: loc.longitude,
        accuracy: loc.accuracy,
      });

      // Validar proximidade
      if (checkpoint.latitude && checkpoint.longitude) {
        console.log('🔵 [CheckpointCheckin] Validando proximidade', {
          checkpointId: checkpoint.id,
          checkpointLat: checkpoint.latitude,
          checkpointLon: checkpoint.longitude,
          userLat: loc.latitude,
          userLon: loc.longitude,
        });
        const validation = await geolocationService.validateProximity(
          checkpoint.id,
          loc.latitude,
          loc.longitude
        );
        console.log('🔵 [CheckpointCheckin] Validação de proximidade', validation);
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro ao obter localização',
        description: err.message,
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
    console.log('🔵 [CheckpointCheckin] handleCheckin chamado', {
      hasLocation: !!location,
      hasValidation: !!validation,
      validationValid: validation?.valid,
      validationMode: checkpoint.validation_mode,
      hasPartnerCode: !!partnerCode,
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:92',message:'handleCheckin chamado',data:{hasLocation:!!location,hasValidation:!!validation,validationValid:validation?.valid,validationMode:checkpoint.validation_mode,hasPartnerCode:!!partnerCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch((e)=>{console.error('❌ [CheckpointCheckin] Erro ao enviar log:',e);});
    // #endregion
    
    if (!location) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:94',message:'Check-in bloqueado - sem localização',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      toast({
        title: 'Localização necessária',
        description: 'Por favor, obtenha sua localização primeiro.',
        variant: 'destructive',
      });
      return;
    }

    if (validation && !validation.valid && (checkpoint.validation_mode === 'geofence' || checkpoint.validation_mode === 'mixed')) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:102',message:'Check-in bloqueado - fora do alcance',data:{distance:validation.distance,validationMode:checkpoint.validation_mode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      toast({
        title: 'Fora do alcance',
        description: `Você está a ${validation.distance}m do checkpoint. Aproxime-se mais.`,
        variant: 'destructive',
      });
      return;
    }

    // Se este checkpoint exige código (code ou mixed), garantir que o usuário digitou algo
    if ((checkpoint.validation_mode === 'code' || checkpoint.validation_mode === 'mixed') && !partnerCode.trim()) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:112',message:'Check-in bloqueado - código necessário',data:{validationMode:checkpoint.validation_mode,partnerCodeLength:partnerCode.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      toast({
        title: 'Código do parceiro necessário',
        description: 'Peça o código no balcão/recepção do parceiro e digite para concluir o check-in.',
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

    console.log('🔵 [CheckpointCheckin] Antes do try block', {
      hasPhoto: !!photo,
      photoUrl,
      partnerCode,
      checkpointId: checkpoint.id,
      locationLat: location?.lat,
      locationLon: location?.lon,
    });

    try {
      console.log('🔵 [CheckpointCheckin] Dentro do try, antes de setCheckingIn');
      setCheckingIn(true);
      console.log('🔵 [CheckpointCheckin] setCheckingIn(true) executado');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:131',message:'Iniciando check-in',data:{checkpointId:checkpoint.id,hasLocation:!!location,hasPhoto:!!photo,hasPartnerCode:!!partnerCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log('🔵 [CheckpointCheckin] Antes de chamar checkIn', {
        checkpointId: checkpoint.id,
        lat: location.lat,
        lon: location.lon,
        photoUrl,
        partnerCode,
      });
      const result = await checkIn(checkpoint.id, location.lat, location.lon, photoUrl, partnerCode);
      console.log('🔵 [CheckpointCheckin] checkIn retornou', result);
      console.log('🔵 [CheckpointCheckin] Resultado completo:', JSON.stringify(result, null, 2));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:133',message:'Resultado do check-in',data:{success:result.success,routeCompleted:result.route_completed,error:result.error,fullResult:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

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

        // Se completou a rota mas não ganhou voucher, explicar o motivo (sem travar selo/pontos)
        if (result.route_completed && (!result.rewards_unlocked || result.rewards_unlocked.length === 0)) {
          try {
            const summary = await passportService.getRewardAvailabilitySummary(result.route_id);
            if (!summary.hasActiveRewards) {
              toast({
                title: 'Roteiro concluído ✅',
                description: 'Seu selo e pontos foram garantidos. No momento não há recompensas cadastradas para este roteiro.',
              });
            } else if (!summary.anyAvailable) {
              toast({
                title: 'Roteiro concluído ✅',
                description: 'A campanha de recompensas está esgotada. Seu selo e pontos foram garantidos normalmente.',
              });
            }
          } catch {
            // Se falhar a checagem, não bloquear a experiência
          }
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:168',message:'Chamando onCheckinSuccess callback',data:{hasCallback:!!onCheckinSuccess},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        onCheckinSuccess?.();
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:178',message:'Check-in falhou',data:{error:result.error,hasCallback:!!onCheckinSuccess},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Se o erro for "check-in já realizado", mostrar mensagem informativa e atualizar progresso
        if (result.error?.includes('já realizado') || result.error?.includes('Check-in já realizado')) {
          console.log('🔵 [CheckpointCheckin] Check-in já realizado, atualizando progresso');
          toast({
            title: 'Check-in já realizado',
            description: 'Você já fez check-in neste checkpoint anteriormente. Atualizando progresso...',
            variant: 'default',
          });
          // Sempre atualizar progresso quando check-in já existe
          if (onCheckinSuccess) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:256',message:'Atualizando progresso - check-in já existe',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            onCheckinSuccess();
          }
        } else {
          // Outros erros: mostrar mensagem de erro
          toast({
            title: 'Erro no check-in',
            description: result.error || 'Não foi possível fazer o check-in.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message,
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
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">
                        {validation.valid
                          ? 'Você está no local correto!'
                          : 'Você está muito longe'}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          Distância: <strong>{validation.distance}m</strong> (raio permitido: {validation.required_radius}m)
                        </div>
                        {location?.accuracy !== undefined && (
                          <div className={`text-xs ${location.accuracy > 50 ? 'text-orange-600' : 'text-gray-600'}`}>
                            Precisão do GPS: {Math.round(location.accuracy)}m
                            {location.accuracy > 50 && (
                              <span className="ml-1">⚠️ Baixa precisão</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Badge variant="outline">Localização obtida</Badge>
                  {location?.accuracy !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      Precisão do GPS: {Math.round(location.accuracy)}m
                    </div>
                  )}
                </div>
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

        {/* Código do parceiro (quando necessário) */}
        {(checkpoint.validation_mode === 'code' || checkpoint.validation_mode === 'mixed') && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">
                Código do parceiro *
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p><strong>⚠️ Este é diferente do "Código do Voucher" usado nas recompensas!</strong></p>
                    <p className="mt-2 text-xs">O <strong>Código do Parceiro</strong> é fornecido pelo estabelecimento para validar seu check-in neste checkpoint.</p>
                    <p className="mt-2 text-xs"><strong>Como usar:</strong></p>
                    <p className="text-xs">1. Chegue no local físico</p>
                    <p className="text-xs">2. Peça o código ao atendente/parceiro</p>
                    <p className="text-xs">3. Digite o código aqui</p>
                    <p className="mt-2 text-xs text-yellow-600">💡 O "Código do Voucher" é usado depois, quando você ganha uma recompensa ao completar a rota.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
              placeholder="Peça o código no balcão e digite aqui (ex.: MS-4281)"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Este ponto exige confirmação do estabelecimento. Mostre seu passaporte digital e peça o código.
            </p>
          </div>
        )}

        {/* Botão de Check-in */}
        {(() => {
          const isDisabled = !location || (validation && !validation.valid) || checkingIn;
          const disabledReason = !location 
            ? 'Obtenha a localização primeiro' 
            : (validation && !validation.valid) 
            ? 'Você está fora do alcance' 
            : checkingIn 
            ? 'Processando...' 
            : '';
          
          return (
            <div className="space-y-2">
              {isDisabled && disabledReason && (
                <p className="text-xs text-muted-foreground text-center">{disabledReason}</p>
              )}
              <Button
                onClick={() => {
                  console.log('🔵 [CheckpointCheckin] Botão clicado', {
                    hasLocation: !!location,
                    validationValid: validation?.valid,
                    checkingIn,
                    disabled: isDisabled,
                  });
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointCheckin.tsx:389',message:'Botão Fazer check-in clicado',data:{hasLocation:!!location,validationValid:validation?.valid,checkingIn,disabled:isDisabled},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch((e)=>{console.error('❌ [CheckpointCheckin] Erro ao enviar log:',e);});
                  // #endregion
                  handleCheckin();
                }}
                disabled={isDisabled}
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
            </div>
          );
        })()}

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

