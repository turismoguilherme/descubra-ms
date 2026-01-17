import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { MapPin, CheckCircle2, Clock, KeyRound, Lock, Camera } from 'lucide-react';
import CheckpointCheckin from './CheckpointCheckin';
import type { RouteCheckpointExtended, StampProgress } from '@/types/passportDigital';

interface CheckpointListProps {
  checkpoints: RouteCheckpointExtended[];
  routeId: string;
  progress?: StampProgress;
  requireSequential?: boolean;
  onCheckinSuccess?: () => void;
}

const CheckpointList: React.FC<CheckpointListProps> = ({
  checkpoints,
  routeId,
  progress,
  requireSequential = false,
  onCheckinSuccess,
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<RouteCheckpointExtended | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Verificar se um checkpoint foi completado
  const isCheckpointCompleted = (checkpointId: string): boolean => {
    if (!progress?.fragments) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointList.tsx:36',message:'Verificando checkpoint - sem fragments',data:{checkpointId,hasProgress:!!progress},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return false;
    }
    const fragment = progress.fragments.find(f => f.checkpoint_id === checkpointId);
    const isCompleted = fragment?.collected || false;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e9b66640-dbd2-4546-ba6c-00c5465b68fe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CheckpointList.tsx:38',message:'Verificando checkpoint completado',data:{checkpointId,isCompleted,hasFragment:!!fragment,fragmentsCount:progress.fragments.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    return isCompleted;
  };

  // Obter informações do fragmento coletado
  const getFragmentInfo = (checkpointId: string) => {
    if (!progress?.fragments) return null;
    return progress.fragments.find(f => f.checkpoint_id === checkpointId);
  };

  // Verificar se checkpoint está bloqueado (ordem sequencial)
  const isCheckpointBlocked = (checkpoint: RouteCheckpointExtended): boolean => {
    if (!requireSequential) return false;
    
    const sortedCheckpoints = [...checkpoints].sort((a, b) => a.order_sequence - b.order_sequence);
    const currentIndex = sortedCheckpoints.findIndex(cp => cp.id === checkpoint.id);
    
    if (currentIndex === 0) return false; // Primeiro checkpoint sempre disponível
    
    // Verificar se checkpoints anteriores foram completados
    for (let i = 0; i < currentIndex; i++) {
      const prevCheckpoint = sortedCheckpoints[i];
      if (!isCheckpointCompleted(prevCheckpoint.id)) {
        return true; // Bloqueado se houver checkpoint anterior não completado
      }
    }
    
    return false;
  };

  const handleCheckinClick = (checkpoint: RouteCheckpointExtended) => {
    setSelectedCheckpoint(checkpoint);
    setIsDialogOpen(true);
  };

  const handleCheckinSuccess = () => {
    setIsDialogOpen(false);
    setSelectedCheckpoint(null);
    if (onCheckinSuccess) {
      onCheckinSuccess();
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      setSelectedCheckpoint(null);
    }
  };

  if (!checkpoints || checkpoints.length === 0) {
    return (
      <Card className="bg-white rounded-2xl shadow-lg border-0">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">Nenhum checkpoint disponível para esta rota.</p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar checkpoints por order_sequence
  const sortedCheckpoints = [...checkpoints].sort((a, b) => a.order_sequence - b.order_sequence);

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-ms-primary-blue/5 to-ms-discovery-teal/5 p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold flex items-center gap-3 text-ms-primary-blue">
            <div className="bg-ms-primary-blue/10 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-ms-primary-blue" />
            </div>
            Checkpoints da Rota
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            {sortedCheckpoints.map((checkpoint, index) => {
              const isCompleted = isCheckpointCompleted(checkpoint.id);
              const fragmentInfo = getFragmentInfo(checkpoint.id);
              const isBlocked = isCheckpointBlocked(checkpoint);

              return (
                <div
                  key={checkpoint.id}
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-ms-pantanal-green/5 to-green-50 border-ms-pantanal-green/30'
                      : isBlocked
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200 hover:border-ms-primary-blue/50 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                          isCompleted
                            ? 'bg-ms-pantanal-green text-white'
                            : isBlocked
                            ? 'bg-gray-300 text-gray-500'
                            : 'bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal text-white'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : checkpoint.order_sequence || index + 1}
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900">{checkpoint.name}</h4>
                        {isCompleted && (
                          <Badge className="bg-ms-pantanal-green hover:bg-ms-pantanal-green text-white rounded-full px-3 py-1 text-xs font-bold">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                        {isBlocked && !isCompleted && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full px-3 py-1 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Complete os anteriores primeiro
                          </Badge>
                        )}
                      </div>

                      {checkpoint.description && (
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {checkpoint.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {checkpoint.validation_mode && (
                          <Badge variant="outline" className="text-xs rounded-full px-3 border-ms-primary-blue/30 text-ms-primary-blue">
                            {checkpoint.validation_mode === 'geofence' && (
                              <>
                                <MapPin className="h-3 w-3 mr-1" />
                                Geolocalização
                              </>
                            )}
                            {checkpoint.validation_mode === 'code' && (
                              <>
                                <KeyRound className="h-3 w-3 mr-1" />
                                Código do Parceiro
                              </>
                            )}
                            {checkpoint.validation_mode === 'mixed' && (
                              <>
                                <MapPin className="h-3 w-3 mr-1" />
                                +
                                <KeyRound className="h-3 w-3 ml-1 mr-1" />
                                Misto
                              </>
                            )}
                          </Badge>
                        )}
                        {checkpoint.requires_photo && (
                          <Badge variant="outline" className="text-xs rounded-full px-3 border-purple-300 text-purple-600">
                            <Camera className="h-3 w-3 mr-1" />
                            Foto necessária
                          </Badge>
                        )}
                        {checkpoint.geofence_radius && (
                          <Badge variant="outline" className="text-xs rounded-full px-3 border-gray-300 text-gray-600">
                            Raio: {checkpoint.geofence_radius}m
                          </Badge>
                        )}
                      </div>

                      {fragmentInfo && fragmentInfo.collected_at && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-ms-pantanal-green font-medium bg-ms-pantanal-green/10 px-3 py-2 rounded-full w-fit">
                          <Clock className="h-3 w-3" />
                          Completado em{' '}
                          {new Date(fragmentInfo.collected_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                      
                      {isBlocked && !isCompleted && requireSequential && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 font-medium">
                            ⚠️ Este checkpoint está bloqueado porque você precisa completar os checkpoints anteriores em ordem sequencial.
                          </p>
                        </div>
                      )}
                    </div>

                    {!isCompleted && (
                      <Button
                        onClick={() => handleCheckinClick(checkpoint)}
                        disabled={isBlocked}
                        className={`shrink-0 rounded-full px-6 font-bold shadow-lg transition-all duration-300 ${
                          isBlocked
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal text-white hover:shadow-xl hover:scale-105'
                        }`}
                        title={isBlocked ? 'Complete os checkpoints anteriores primeiro' : ''}
                      >
                        Fazer Check-in
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Check-in - Redesign */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl text-ms-primary-blue flex items-center gap-2">
              <div className="bg-ms-primary-blue/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-ms-primary-blue" />
              </div>
              {selectedCheckpoint?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Valide sua presença neste checkpoint para coletar o fragmento do carimbo.
            </DialogDescription>
          </DialogHeader>
          {selectedCheckpoint && (
            <CheckpointCheckin
              checkpoint={selectedCheckpoint}
              routeId={routeId}
              onCheckinSuccess={handleCheckinSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckpointList;
