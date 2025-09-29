import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Sparkles, ArrowRight } from 'lucide-react';

interface PassportStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
  totalPoints: number;
  onContinue: () => void;
}

const PassportStampModal: React.FC<PassportStampModalProps> = ({
  isOpen,
  onClose,
  routeName,
  totalPoints,
  onContinue
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-ms-primary-blue via-ms-secondary-teal to-ms-accent-orange border-white/20">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-2xl">
            🎉 Parabéns!
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-6">
          {/* Stamp Animation */}
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 animate-pulse">
              <div className="text-6xl">🏆</div>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
            </div>
          </div>

          {/* Achievement Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">
              Novo Carimbo Desbloqueado!
            </h3>
            <p className="text-white/90">
              Você concluiu o roteiro <strong>{routeName}</strong>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{totalPoints}</div>
              <div className="text-sm text-white/80">Pontos Ganhos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">+1</div>
              <div className="text-sm text-white/80">Carimbo Único</div>
            </div>
          </div>

          {/* New Level Badge */}
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Explorador de MS
          </Badge>

          {/* Description */}
          <p className="text-white/80 text-sm">
            Este carimbo representa sua jornada através dos tesouros culturais e naturais 
            de Mato Grosso do Sul. Continue explorando para desbloquear mais recompensas!
          </p>

          {/* Action Button */}
          <Button 
            onClick={onContinue}
            className="w-full bg-white text-ms-primary-blue hover:bg-white/90 text-lg py-3"
          >
            Ver Meu Passaporte
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassportStampModal;