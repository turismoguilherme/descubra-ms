
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, MapPin, Trophy, Zap, CheckCircle } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { useToast } from '@/hooks/use-toast';

const OnboardingWelcome = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const { addPoints, addStamp, userLevel } = useFlowTrip();
  const { toast } = useToast();

  const steps = [
    {
      title: 'Bem-vindo ao FlowTrip!',
      description: 'Sua jornada gamificada pelo turismo de Mato Grosso do Sul começa agora!',
      icon: Gift,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Sistema de Pontos',
      description: 'Ganhe pontos visitando destinos, participando de eventos e completando desafios.',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Passaporte Digital',
      description: 'Colete carimbos digitais em cada lugar que visitar e crie sua coleção única.',
      icon: MapPin,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Evolua de Nível',
      description: 'Suba de Iniciante até Mestre e desbloqueie conquistas especiais.',
      icon: Trophy,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    try {
      // Dar pontos de boas-vindas
      await addPoints(50, 'onboarding_welcome');
      
      // Adicionar primeiro carimbo simbólico
      await addStamp({
        activity_type: 'onboarding_complete',
        points_earned: 25,
        stamp_type: 'welcome'
      });

      toast({
        title: '🎉 Bem-vindo ao FlowTrip!',
        description: '+50 pontos de boas-vindas! Sua aventura começou!',
      });

      // Fechar o onboarding
      localStorage.setItem('flowtrip_onboarding_complete', 'true');
      window.location.reload();
    } catch (error) {
      console.error('Erro no onboarding:', error);
      toast({
        title: 'Ops!',
        description: 'Erro ao completar o onboarding. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full ${currentStepData.bgColor} flex items-center justify-center mb-4`}>
            <IconComponent className={`w-8 h-8 ${currentStepData.color}`} />
          </div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            {currentStepData.description}
          </p>
          
          {currentStep === steps.length - 1 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Bônus de Boas-vindas
              </h4>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex items-center justify-between">
                  <span>Pontos de boas-vindas</span>
                  <Badge variant="secondary">+50 pontos</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Primeiro carimbo</span>
                  <Badge variant="secondary">+25 pontos</Badge>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleNext}
            disabled={isCompleting}
            className="w-full gap-2"
          >
            {isCompleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completando...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Começar Aventura
              </>
            ) : (
              <>
                Próximo
                <Star className="w-4 h-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWelcome;
