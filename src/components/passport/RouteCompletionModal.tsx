import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Sparkles, ArrowRight, Gift, CheckCircle2, X, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserReward } from '@/types/passportDigital';
import VoucherQRCode from './VoucherQRCode';
import { rewardsService } from '@/services/passport/rewardsService';
import { useToast } from '@/hooks/use-toast';

interface RouteCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
  totalPoints: number;
  rewardsUnlocked?: UserReward[]; // Mudado para UserReward para ter voucher_code
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
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(false);
  const [hasClosed, setHasClosed] = useState(false);

  useEffect(() => {
    if (isOpen && !hasClosed) {
      // Pequeno delay para animação
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen, hasClosed]);

  const handleClose = () => {
    setHasClosed(true);
    onClose();
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/descubrams/passaporte');
    }
    handleClose();
  };

  const handleCopyVoucher = async (voucherCode: string) => {
    const success = await rewardsService.copyVoucherCode(voucherCode);
    if (success) {
      toast({
        title: 'Código copiado!',
        description: 'O código do voucher foi copiado para a área de transferência.',
      });
    } else {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o código.',
        variant: 'destructive',
      });
    }
  };

  const icon = themeIcons[theme] || '🎨';

  // Não mostrar modal se já foi fechado
  if (hasClosed && !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen && !hasClosed} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center text-white text-3xl flex-1">
              🎉 Parabéns!
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
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
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 space-y-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-white">Recompensas Desbloqueadas!</h4>
              </div>
              <div className="space-y-4">
                {rewardsUnlocked.map((userReward, index) => {
                  // UserReward tem propriedade 'reward' que é PassportReward opcional
                  const reward = userReward.reward;
                  const partnerName = reward?.partner_name || 'Recompensa';
                  const rewardDescription = reward?.reward_description;
                  return (
                    <div 
                      key={userReward.id || index}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white mb-1">
                            {partnerName}
                          </p>
                          {rewardDescription && (
                            <p className="text-sm text-white/80 mb-2">
                              {rewardDescription}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {userReward.voucher_code && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                            <div className="flex-1">
                              <p className="text-xs text-white/60 mb-1">Código do Voucher</p>
                              <p className="font-mono text-lg font-bold text-white">
                                {userReward.voucher_code}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyVoucher(userReward.voucher_code)}
                              className="text-white hover:bg-white/20"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex justify-center">
                            <VoucherQRCode 
                              voucherCode={userReward.voucher_code}
                              size={150}
                            />
                          </div>
                          
                          <p className="text-xs text-white/70 text-center">
                            Apresente este código ou escaneie o QR code no estabelecimento para usar sua recompensa
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Level Badge - Card Informativo */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-white">Explorador de MS</h4>
            </div>
            <p className="text-sm text-white/80 text-center">
              Você alcançou um novo nível! Continue explorando para desbloquear mais conquistas.
            </p>
          </div>

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

