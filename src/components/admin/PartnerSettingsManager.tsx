import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Save, Loader2, Percent } from 'lucide-react';

export default function PartnerSettingsManager() {
  const { toast } = useToast();
  const [monthlyFee, setMonthlyFee] = useState<string>('299.00');
  const [commissionRate, setCommissionRate] = useState<string>('10.00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_monthly_fee')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar valor mensal:', error);
      }

      if (data?.setting_value) {
        const fee = typeof data.setting_value === 'string' 
          ? data.setting_value 
          : String(data.setting_value);
        setMonthlyFee(fee);
      }

      // Carregar percentual de comissão
      const { data: commissionData, error: commissionError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_commission_rate')
        .maybeSingle();

      if (!commissionError && commissionData?.setting_value) {
        const rate = typeof commissionData.setting_value === 'string' 
          ? commissionData.setting_value 
          : String(commissionData.setting_value);
        setCommissionRate(rate);
      }
    } catch (error) {
      console.error('Erro ao carregar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const feeValue = parseFloat(monthlyFee);
    if (isNaN(feeValue) || feeValue <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O valor mensal deve ser um número maior que zero',
        variant: 'destructive',
      });
      return;
    }

    const commissionValue = parseFloat(commissionRate);
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast({
        title: 'Percentual inválido',
        description: 'O percentual de comissão deve ser entre 0 e 100',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Salvar valor mensal
      const { error: feeError } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'partner_monthly_fee',
          setting_value: monthlyFee,
          description: 'Valor mensal da assinatura para parceiros do Descubra MS (em R$)',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'platform,setting_key',
        });

      if (feeError) throw feeError;

      // Salvar percentual de comissão
      const { error: commissionError } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'partner_commission_rate',
          setting_value: commissionRate,
          description: 'Percentual de comissão sobre reservas de parceiros (0-100)',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'platform,setting_key',
        });

      if (commissionError) throw commissionError;

      toast({
        title: 'Salvo com sucesso!',
        description: `Valor mensal: R$ ${parseFloat(monthlyFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Comissão: ${parseFloat(commissionRate).toFixed(2)}%`,
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-ms-primary-blue" />
          Configurações de Parceiros
        </CardTitle>
        <CardDescription>
          Configure valores e comissões para parceiros do Descubra MS
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="monthly_fee">Valor Mensal da Assinatura (R$)</Label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">R$</span>
            <Input
              id="monthly_fee"
              type="number"
              step="0.01"
              min="0"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="299.00"
              className="flex-1"
            />
          </div>
          <p className="text-sm text-gray-500">
            Este valor será cobrado mensalmente de todos os parceiros através do Stripe.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission_rate">Percentual de Comissão sobre Reservas (%)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="commission_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              placeholder="10.00"
              className="flex-1"
            />
            <span className="text-gray-500">%</span>
          </div>
          <p className="text-sm text-gray-500">
            Percentual de comissão calculado automaticamente sobre cada reserva paga. Você pode alterar este valor a qualquer momento.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

