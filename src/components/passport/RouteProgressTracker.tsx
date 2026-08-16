import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, MapPin, Clock } from 'lucide-react';
import { RouteCheckpoint } from '@/types/passport';

interface RouteProgressTrackerProps {
  checkpoints: RouteCheckpoint[];
  completedCheckpoints: string[];
  currentIndex: number;
}

const RouteProgressTracker: React.FC<RouteProgressTrackerProps> = ({
  checkpoints,
  completedCheckpoints,
  currentIndex
}) => {
  const isCompleted = (checkpointId: string) => completedCheckpoints.includes(checkpointId);
  const isCurrent = (index: number) => index === currentIndex;

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Progresso da Jornada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checkpoints.map((checkpoint, index) => (
            <div
              key={checkpoint.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                isCurrent(index) 
                  ? 'bg-ms-accent-orange/20 border border-ms-accent-orange/50' 
                  : isCompleted(checkpoint.id)
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-white/5 border border-white/20'
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">
                {isCompleted(checkpoint.id) ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : isCurrent(index) ? (
                  <div className="w-6 h-6 bg-ms-accent-orange rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-white/40" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium truncate ${
                    isCurrent(index) ? 'text-white' : 
                    isCompleted(checkpoint.id) ? 'text-green-300' : 'text-white/70'
                  }`}>
                    {checkpoint.name}
                  </h4>
                  
                  {isCurrent(index) && (
                    <Badge className="bg-ms-accent-orange text-white text-xs">
                      Atual
                    </Badge>
                  )}
                  
                  {isCompleted(checkpoint.id) && (
                    <Badge className="bg-green-500 text-white text-xs">
                      ✓ Concluído
                    </Badge>
                  )}
                </div>

                <p className={`text-sm mb-2 line-clamp-2 ${
                  isCurrent(index) ? 'text-white/90' : 'text-white/60'
                }`}>
                  {checkpoint.description}
                </p>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-white/60">
                    <Clock className="w-3 h-3" />
                    <span>{checkpoint.required_time_minutes || 15} min</span>
                  </div>
                  
                  {checkpoint.points_reward && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <span>🏆</span>
                      <span>{checkpoint.points_reward} pts</span>
                    </div>
                  )}
                  
                  {checkpoint.requires_photo && (
                    <div className="flex items-center gap-1 text-blue-400">
                      <span>📷</span>
                      <span>Foto</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">
                {completedCheckpoints.length}
              </div>
              <div className="text-xs text-white/70">Concluídos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-ms-accent-orange">
                {currentIndex < checkpoints.length ? 1 : 0}
              </div>
              <div className="text-xs text-white/70">Atual</div>
            </div>
            <div>
              <div className="text-lg font-bold text-white/60">
                {checkpoints.length - completedCheckpoints.length - (currentIndex < checkpoints.length ? 1 : 0)}
              </div>
              <div className="text-xs text-white/70">Restantes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteProgressTracker;