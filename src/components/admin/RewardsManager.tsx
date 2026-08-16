import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Plus, Edit, Trash2 } from 'lucide-react';
import { Reward } from '@/types/rewards';

const RewardsManagerSimple = () => {
  const [rewards] = useState<Reward[]>([
    {
      id: '1',
      name: 'Primeira Visita',
      description: 'Recompensa por completar sua primeira rota',
      points: 100,
      type: 'badge',
      category: 'achievement',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Explorador MS',
      description: 'Desconto de 10% em hotéis parceiros',
      points: 500,
      type: 'discount',
      category: 'travel',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const getTypeColor = (type: Reward['type']) => {
    switch (type) {
      case 'badge': return 'bg-blue-100 text-blue-800';
      case 'discount': return 'bg-green-100 text-green-800';
      case 'access': return 'bg-purple-100 text-purple-800';
      case 'item': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Recompensas</h2>
          <p className="text-muted-foreground">
            Configure as recompensas disponíveis no sistema
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Recompensa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <Gift className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {reward.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(reward.type)}>
                  {reward.type}
                </Badge>
                <span className="text-sm font-medium">
                  {reward.points} pts
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistema de Recompensas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            O sistema completo de gerenciamento de recompensas está sendo implementado.
            As recompensas exibidas são exemplos para demonstração.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsManagerSimple;