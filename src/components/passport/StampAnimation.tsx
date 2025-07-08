
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Gift, X } from "lucide-react";
import { DigitalStamp, RouteReward } from "@/types/digitalPassport";

interface StampAnimationProps {
  stamp: DigitalStamp;
  rewards: RouteReward[];
  onClose: () => void;
  isVisible: boolean;
}

const StampAnimation: React.FC<StampAnimationProps> = ({
  stamp,
  rewards,
  onClose,
  isVisible
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`max-w-md w-full transition-all duration-500 transform ${
        showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        <CardContent className="p-6 text-center space-y-4">
          {/* Botão de fechar */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Animação do carimbo */}
          <div className="space-y-4">
            <div className="relative">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center transition-all duration-700 ${
                showContent ? 'animate-bounce' : ''
              }`}>
                {stamp.stamp_icon_url ? (
                  <img 
                    src={stamp.stamp_icon_url} 
                    alt={stamp.stamp_name}
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <Trophy className="w-16 h-16 text-white" />
                )}
              </div>
              
              {/* Efeito de brilho */}
              <div className={`absolute inset-0 w-24 h-24 mx-auto rounded-full bg-yellow-400/30 transition-all duration-1000 ${
                showContent ? 'animate-ping' : ''
              }`}></div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">🎉 Parabéns!</h3>
              <p className="text-lg font-semibold text-green-600">
                Você ganhou o carimbo:
              </p>
              <p className="text-xl font-bold text-gray-800">{stamp.stamp_name}</p>
            </div>

            {/* Frase cultural */}
            {stamp.cultural_phrase && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-blue-800 italic text-sm">
                  "{stamp.cultural_phrase}"
                </p>
              </div>
            )}

            {/* Pontos ganhos */}
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <Star className="w-5 h-5" />
              <span className="font-semibold">+100 pontos adicionados!</span>
            </div>

            {/* Recompensas */}
            {rewards.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Gift className="w-5 h-5" />
                  <span className="font-semibold">Recompensas Desbloqueadas:</span>
                </div>
                
                <div className="space-y-1">
                  {rewards.slice(0, 3).map(reward => (
                    <div key={reward.id} className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded">
                      🎁 {reward.title}
                    </div>
                  ))}
                  {rewards.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{rewards.length - 3} mais recompensas
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botão de continuar */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              size="lg"
            >
              Continuar Explorando
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StampAnimation;
