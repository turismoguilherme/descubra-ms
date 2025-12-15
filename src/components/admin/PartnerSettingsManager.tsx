import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Save, Loader2 } from 'lucide-react';

export default function PartnerSettingsManager() {
  const { toast } = useToast();
  const [monthlyFee, setMonthlyFee] = useState<string>('299.00');
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

    setSaving(true);
    try {
      const { error } = await supabase
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

      if (error) throw error;

      toast({
        title: 'Salvo com sucesso!',
        description: `Valor mensal atualizado para R$ ${parseFloat(monthlyFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
          Configure o valor mensal da assinatura para parceiros do Descubra MS
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

