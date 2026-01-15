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
import { MapPin, CheckCircle2, Clock, KeyRound } from 'lucide-react';
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
    if (!progress?.fragments) return false;
    const fragment = progress.fragments.find(f => f.checkpoint_id === checkpointId);
    return fragment?.collected || false;
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
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Nenhum checkpoint disponível para esta rota.</p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar checkpoints por order_sequence
  const sortedCheckpoints = [...checkpoints].sort((a, b) => a.order_sequence - b.order_sequence);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Checkpoints da Rota
          </h3>
          <div className="space-y-3">
            {sortedCheckpoints.map((checkpoint, index) => {
              const isCompleted = isCheckpointCompleted(checkpoint.id);
              const fragmentInfo = getFragmentInfo(checkpoint.id);
              const isBlocked = isCheckpointBlocked(checkpoint);

              return (
                <div
                  key={checkpoint.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : isBlocked
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : 'bg-white border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {checkpoint.order_sequence || index + 1}
                        </div>
                        <h4 className="font-semibold text-lg">{checkpoint.name}</h4>
                        {isCompleted && (
                          <Badge className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                        {isBlocked && !isCompleted && (
                          <Badge variant="secondary" className="bg-gray-400 text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            Complete os anteriores
                          </Badge>
                        )}
                      </div>

                      {checkpoint.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {checkpoint.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs">
                        {checkpoint.validation_mode && (
                          <Badge variant="outline" className="text-xs">
                            {checkpoint.validation_mode === 'geofence' && '📍 Geolocalização'}
                            {checkpoint.validation_mode === 'code' && (
                              <>
                                <KeyRound className="h-3 w-3 mr-1" />
                                Código do Parceiro
                              </>
                            )}
                            {checkpoint.validation_mode === 'mixed' && '📍 + 🔑 Misto'}
                          </Badge>
                        )}
                        {checkpoint.requires_photo && (
                          <Badge variant="outline" className="text-xs">
                            📷 Foto necessária
                          </Badge>
                        )}
                        {checkpoint.geofence_radius && (
                          <Badge variant="outline" className="text-xs">
                            Raio: {checkpoint.geofence_radius}m
                          </Badge>
                        )}
                      </div>

                      {fragmentInfo && fragmentInfo.collected_at && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
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
                    </div>

                    {!isCompleted && (
                      <Button
                        onClick={() => handleCheckinClick(checkpoint)}
                        disabled={isBlocked}
                        className="shrink-0"
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

      {/* Dialog para Check-in */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Check-in: {selectedCheckpoint?.name}
            </DialogTitle>
            <DialogDescription>
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

