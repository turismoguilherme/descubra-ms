import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Trophy, CheckCircle2 } from 'lucide-react';
import { RouteCheckpoint } from '@/types/passport';

interface CheckpointPreviewProps {
  checkpoint: RouteCheckpoint;
  index: number;
  isCompleted: boolean;
}

const CheckpointPreview: React.FC<CheckpointPreviewProps> = ({
  checkpoint,
  index,
  isCompleted
}) => {
  return (
    <Card className={`bg-white/5 border-white/20 text-white transition-all duration-300 hover:bg-white/10 ${
      isCompleted ? 'ring-2 ring-green-400' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : 'bg-ms-accent-orange text-white'
          }`}>
            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white truncate">
                {checkpoint.name}
              </h4>
              {checkpoint.requires_photo && (
                <Camera className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-white/80 text-sm mb-3 line-clamp-2">
              {checkpoint.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-white/70">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>{checkpoint.points_reward} pts</span>
                </div>
                {checkpoint.requires_photo && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                    Foto obrigatória
                  </Badge>
                )}
              </div>
              
              {isCompleted && (
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  Concluído
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckpointPreview;