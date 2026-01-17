import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Sparkles, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PassportReward } from '@/types/passportDigital';

interface RouteCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
  totalPoints: number;
  rewardsUnlocked?: PassportReward[];
  theme?: 'onca' | 'tuiuiu' | 'jacare' | 'arara' | 'capivara';
  onContinue?: () => void;
}

const themeIcons: Record<string, string> = {
  onca: '🐆',
  tuiuiu: '🦆',
  jacare: '🐊',
  arara: '🦜',
  capivara: '🦫',
};

const RouteCompletionModal: React.FC<RouteCompletionModalProps> = ({
  isOpen,
  onClose,
  routeName,
  totalPoints,
  rewardsUnlocked = [],
  theme = 'onca',
  onContinue,
}) => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Pequeno delay para animação
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/descubrams/passaporte');
    }
    onClose();
  };

  const icon = themeIcons[theme] || '🎨';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green border-white/20">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-3xl">
            🎉 Parabéns!
          </DialogTitle>
        </DialogHeader>
        
        <div className={`text-center space-y-6 py-6 transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Stamp Animation */}
          <div className="relative">
            <div className="w-40 h-40 mx-auto bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 animate-pulse">
              <div className="text-8xl">{icon}</div>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-10 h-10 text-yellow-400 animate-bounce" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <CheckCircle2 className="w-8 h-8 text-green-400 animate-pulse" />
            </div>
          </div>

          {/* Achievement Text */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">
              Roteiro Completo! 🏆
            </h3>
            <p className="text-white/90 text-lg">
              Você concluiu o roteiro <strong>{routeName}</strong>
            </p>
            <p className="text-white/80 text-sm">
              Todos os fragmentos do carimbo foram coletados!
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalPoints}</div>
              <div className="text-sm text-white/80">Pontos Ganhos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-white/80">Completo</div>
            </div>
          </div>

          {/* Rewards Unlocked */}
          {rewardsUnlocked && rewardsUnlocked.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-white">Recompensas Desbloqueadas!</h4>
              </div>
              <div className="space-y-2">
                {rewardsUnlocked.map((reward, index) => (
                  <Badge 
                    key={reward.id || index}
                    className="bg-orange-500/80 text-white text-sm px-3 py-1 mr-2 mb-2"
                  >
                    {reward.partner_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* New Level Badge */}
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-6 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Explorador de MS
          </Badge>

          {/* Description */}
          <p className="text-white/80 text-sm px-4">
            Este carimbo representa sua jornada através dos tesouros culturais e naturais 
            de Mato Grosso do Sul. Continue explorando para desbloquear mais recompensas!
          </p>

          {/* Action Button */}
          <Button 
            onClick={handleContinue}
            className="w-full bg-white text-ms-primary-blue hover:bg-white/90 text-lg py-3 font-bold shadow-lg"
          >
            Ver Meu Passaporte
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RouteCompletionModal;

