// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Lock, CheckCircle2, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PassportReward, UserReward } from '@/types/passportDigital';

interface RewardsOverviewProps {
  routeId: string;
  completionPercentage?: number;
}

const RewardsOverview: React.FC<RewardsOverviewProps> = ({ routeId, completionPercentage = 0 }) => {
  const [rewards, setRewards] = useState<PassportReward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, [routeId]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      
      // Load route rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('passport_rewards')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_active', true);

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

      // Load user's claimed rewards
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRewardsData, error: userRewardsError } = await supabase
          .from('user_rewards')
          .select('*, reward:passport_rewards(*)')
          .eq('user_id', user.id)
          .eq('route_id', routeId);

        if (userRewardsError) throw userRewardsError;
        setUserRewards(userRewardsData || []);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error loading rewards:', err);
      toast({
        title: 'Erro ao carregar recompensas',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isRewardUnlocked = (reward: PassportReward) => {
    // Reward is unlocked if route is 100% complete
    return completionPercentage >= 100;
  };

  const hasClaimedReward = (rewardId: string) => {
    return userRewards.some(ur => ur.reward_id === rewardId);
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'desconto':
        return '💰';
      case 'brinde':
        return '🎁';
      case 'experiencia':
        return '🌟';
      default:
        return '🎉';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Carregando recompensas...</p>
        </CardContent>
      </Card>
    );
  }

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhuma recompensa disponível para este roteiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Recompensas ({rewards.length})
          </CardTitle>
          <Badge variant="secondary">
            {completionPercentage >= 100 ? 'Todas Desbloqueadas' : `${completionPercentage}% concluído`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {rewards.map((reward) => {
            const unlocked = isRewardUnlocked(reward);
            const claimed = hasClaimedReward(reward.id);
            
            return (
              <Card 
                key={reward.id} 
                className={`relative overflow-hidden transition-all ${
                  unlocked 
                    ? 'border-2 border-green-200 bg-green-50/50' 
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                {/* Unlock Overlay for Locked Rewards */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-gray-200/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        Complete 100% do roteiro
                      </p>
                    </div>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Reward Icon */}
                    <div className="text-4xl flex-shrink-0">
                      {getRewardIcon(reward.reward_type)}
                    </div>

                    {/* Reward Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{reward.partner_name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {reward.reward_type === 'desconto' && 'Desconto'}
                            {reward.reward_type === 'brinde' && 'Brinde'}
                            {reward.reward_type === 'experiencia' && 'Experiência'}
                          </Badge>
                        </div>
                        {claimed && (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      {/* Description */}
                      {reward.reward_description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {reward.reward_description}
                        </p>
                      )}

                      {/* Discount Badge */}
                      {reward.reward_type === 'desconto' && reward.discount_percentage && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white mb-3">
                          {reward.discount_percentage}% de desconto
                        </Badge>
                      )}

                      {/* Contact Info */}
                      {unlocked && (
                        <div className="space-y-1 text-xs text-gray-600">
                          {reward.partner_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{reward.partner_address}</span>
                            </div>
                          )}
                          {reward.partner_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{reward.partner_phone}</span>
                            </div>
                          )}
                          {reward.partner_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{reward.partner_email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expiration */}
                      {reward.expires_at && unlocked && (
                        <p className="text-xs text-gray-500 mt-2">
                          Válido até: {new Date(reward.expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}

                      {/* Claim Status */}
                      {unlocked && claimed && (
                        <Badge variant="secondary" className="mt-2">
                          ✓ Recompensa Resgatada
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completionPercentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-sm text-blue-700">
              Complete o roteiro para desbloquear todas as {rewards.length} recompensas!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardsOverview;
