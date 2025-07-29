import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { rewardService } from '@/services/rewards/rewardService'; // Corrigido o caminho
import { tourismPassportService } from '@/services/passport/tourismPassportService'; // Adicionado
import { Reward, UserReward } from '@/types/rewards';
import { Separator } from '@/components/ui/separator';
import { Sparkles, MapPin, FileText } from 'lucide-react'; // Alterado ReceiptText para FileText

const EnhancedDigitalPassport: React.FC = () => {
  const { user, loading: userLoading } = useAuth();
  const { toast } = useToast();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0); // Exemplo de um campo de pontos

  useEffect(() => {
    console.log("🔍 EnhancedDigitalPassport: User data on effect trigger:", user, "User loading:", userLoading);
    if (user && !userLoading) {
      fetchUserRewards();
      // TODO: Buscar total de pontos do usuário e nível (assumindo que existam na user_profiles ou user_levels)
      // setTotalPoints(user.total_points || 0);
      console.log("🔍 EnhancedDigitalPassport: Fetching user rewards...");
    }
  }, [user, userLoading]);

  const fetchUserRewards = async () => {
    setLoading(true);
    try {
      const rewards = await rewardService.getUserRewards(user!.id);
      setUserRewards(rewards);
      console.log("✅ EnhancedDigitalPassport: User rewards loaded:", rewards);
    } catch (error) {
      console.error('❌ EnhancedDigitalPassport: Erro ao carregar recompensas do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas recompensas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando passaporte...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Faça login para ver seu passaporte.</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Meu Passaporte Digital</CardTitle>
          <p className="text-gray-600">Seu progresso e recompensas no Descubra MS.</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Pontos Totais: {totalPoints}</h3>
            {/* Exemplo de barra de progresso para o próximo nível/milestone */}
            <Progress value={(totalPoints / 1000) * 100} className="w-full" />
            <p className="text-sm text-gray-500 mt-1">Faltam {1000 - totalPoints} pontos para o próximo nível!</p>
          </div>
          
          <Separator className="my-4" />

          <h2 className="text-xl font-bold mb-4">Minhas Recompensas Desbloqueadas</h2>
          {loading ? (
            <div className="text-center py-8">Carregando recompensas...</div>
          ) : userRewards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Você ainda não desbloqueou nenhuma recompensa. Explore e divirta-se!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRewards.map((userReward) => (
                <Card key={userReward.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><Sparkles size={20} />{userReward.reward?.name || 'Recompensa Desconhecida'}</CardTitle>
                      <Badge variant="secondary">{userReward.reward?.type || 'Geral'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm mb-2">{userReward.reward?.description || 'Sem descrição.'}</p>
                    {userReward.reward?.local_resgate && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin size={14} className="mr-1" />
                        <span className="font-semibold">Local de Resgate:</span> {userReward.reward.local_resgate}
                      </div>
                    )}
                    {userReward.reward?.instrucoes_resgate && (
                      <div className="flex items-start text-sm text-gray-600">
                        <FileText size={14} className="mr-1 mt-1" /> {/* Alterado ReceiptText para FileText */}
                        <span className="font-semibold">Instruções:</span> {userReward.reward.instrucoes_resgate}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Recebido em: {new Date(userReward.received_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDigitalPassport; 