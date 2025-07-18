
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Camera, Share2, Navigation, Star } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const { addPoints, addStamp } = useFlowTrip();
  const { toast } = useToast();

  const handleQuickAction = async (action: string, points: number, activityType: string) => {
    try {
      await addStamp({
        activity_type: activityType,
        points_earned: points
      });

      toast({
        title: '🎉 Ação completada!',
        description: `+${points} pontos pela atividade: ${action}`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível completar a ação.',
        variant: 'destructive'
      });
    }
  };

  const quickActions = [
    {
      id: 'check_in',
      name: 'Check-in Rápido',
      description: 'Marque presença em um local',
      icon: MapPin,
      points: 10,
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    {
      id: 'event_interest',
      name: 'Interesse em Evento',
      description: 'Demonstrar interesse em evento',
      icon: Calendar,
      points: 5,
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    {
      id: 'photo_share',
      name: 'Compartilhar Foto',
      description: 'Compartilhe uma experiência',
      icon: Camera,
      points: 8,
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    },
    {
      id: 'social_share',
      name: 'Compartilhar Social',
      description: 'Compartilhe no social',
      icon: Share2,
      points: 3,
      color: 'text-orange-600',
      bgColor: 'hover:bg-orange-50'
    },
    {
      id: 'route_complete',
      name: 'Rota Completada',
      description: 'Complete uma rota turística',
      icon: Navigation,
      points: 25,
      color: 'text-indigo-600',
      bgColor: 'hover:bg-indigo-50'
    },
    {
      id: 'review',
      name: 'Avaliação',
      description: 'Avalie um destino',
      icon: Star,
      points: 5,
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 ${action.bgColor} border-gray-200`}
                onClick={() => handleQuickAction(action.name, action.points, action.id)}
              >
                <IconComponent className={`h-6 w-6 ${action.color}`} />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.name}</p>
                  <p className="text-xs text-muted-foreground">
                    +{action.points} pontos
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Use ações rápidas para testar o sistema de pontos e carimbos do FlowTrip!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
