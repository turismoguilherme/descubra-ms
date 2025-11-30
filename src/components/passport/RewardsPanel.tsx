import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePassportRewards } from '@/hooks/usePassportRewards';
import { Copy, Gift, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewardsPanelProps {
  routeId: string;
}

const RewardsPanel: React.FC<RewardsPanelProps> = ({ routeId }) => {
  const { userRewards, routeRewards, loading, copyVoucherCode } = usePassportRewards(routeId);
  const { toast } = useToast();

  const handleCopyVoucher = async (voucherCode: string) => {
    const success = await copyVoucherCode(voucherCode);
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

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Carregando recompensas...</div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar recompensas não usadas
  const availableRewards = userRewards.filter(r => !r.is_used);

  if (availableRewards.length === 0 && routeRewards.length === 0) {
    return null; // Não mostrar se não houver recompensas
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Recompensas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableRewards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Complete o roteiro para desbloquear recompensas!</p>
            {routeRewards.length > 0 && (
              <p className="text-sm mt-2">
                {routeRewards.length} recompensa(s) disponível(is) ao completar
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {availableRewards.map((reward) => {
              const rewardData = reward.reward as any;
              if (!rewardData) return null;

              return (
                <Card key={reward.id} className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{rewardData.partner_name}</h4>
                          <Badge variant="secondary">
                            {rewardData.reward_type === 'desconto'
                              ? 'Desconto'
                              : rewardData.reward_type === 'brinde'
                              ? 'Brinde'
                              : 'Experiência'}
                          </Badge>
                        </div>
                        {rewardData.reward_description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {rewardData.reward_description}
                          </p>
                        )}
                        {rewardData.discount_percentage && (
                          <Badge className="bg-green-600">
                            {rewardData.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Código do Voucher */}
                    <div className="bg-muted p-3 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Código do Voucher
                          </div>
                          <div className="font-mono font-semibold text-lg">
                            {reward.voucher_code}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyVoucher(reward.voucher_code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Informações do Parceiro */}
                    {(rewardData.partner_address ||
                      rewardData.partner_phone ||
                      rewardData.partner_email) && (
                      <div className="space-y-1 text-sm text-muted-foreground border-t pt-3">
                        {rewardData.partner_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {rewardData.partner_address}
                          </div>
                        )}
                        {rewardData.partner_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {rewardData.partner_phone}
                          </div>
                        )}
                        {rewardData.partner_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {rewardData.partner_email}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Validade */}
                    {rewardData.expires_at && (
                      <div className="text-xs text-muted-foreground">
                        Válido até:{' '}
                        {new Date(rewardData.expires_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardsPanel;

