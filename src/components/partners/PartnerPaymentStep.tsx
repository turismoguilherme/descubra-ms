// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ArrowLeft, Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PartnerPaymentStepProps {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function PartnerPaymentStep({
  partnerId,
  partnerName,
  partnerEmail,
  onComplete,
  onBack,
}: PartnerPaymentStepProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState<number>(299.00); // Valor padrão
  const [paymentLink, setPaymentLink] = useState<string>('');

  useEffect(() => {
    loadMonthlyFee();
    loadPaymentLink();
  }, []);

  const loadMonthlyFee = async () => {
    try {
      // Buscar valor mensal configurado no site_settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_monthly_fee')
        .maybeSingle();

      if (!error && data?.setting_value) {
        // setting_value pode ser string ou número
        const fee = typeof data.setting_value === 'string' 
          ? parseFloat(data.setting_value) 
          : data.setting_value;
        if (!isNaN(fee) && fee > 0) {
          setMonthlyFee(fee);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar valor mensal, usando padrão:', error);
    }
  };

  const loadPaymentLink = async () => {
    try {
      // Buscar link de pagamento configurado no admin
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_payment_link')
        .maybeSingle();

      if (!error && data?.setting_value) {
        setPaymentLink(String(data.setting_value || ''));
      }
    } catch (error) {
      console.warn('Erro ao carregar link de pagamento:', error);
    }
  };

  const handlePayment = async () => {
    // Verificar se o link de pagamento está configurado
    if (!paymentLink || paymentLink.trim() === '') {
      toast({
        title: 'Link de pagamento não configurado',
        description: 'O link de pagamento precisa ser configurado no painel administrativo. Entre em contato com o suporte.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Redirecionar diretamente para o Payment Link configurado
      window.location.href = paymentLink;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao processar pagamento:', err);
      toast({
        title: 'Erro ao processar pagamento',
        description: err.message || 'Não foi possível iniciar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-ms-primary-blue" />
            Assinatura Mensal
          </CardTitle>
          <CardDescription>
            Complete o pagamento para ativar sua conta de parceiro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo */}
          <div className="bg-gradient-to-r from-ms-primary-blue to-ms-discovery-teal rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Valor Mensal</p>
                <p className="text-3xl font-bold">
                  R$ {monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-white/20" />
            </div>
            <p className="text-white/90 text-sm">
              Assinatura recorrente mensal. Você pode cancelar a qualquer momento.
            </p>
          </div>

          {/* Benefícios incluídos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">O que está incluído:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Destaque na listagem oficial de parceiros</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Botão "Reservar" com envio de leads qualificados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Participação em campanhas do Passaporte Digital</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Dashboard completo para gerenciar reservas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Estatísticas e relatórios de performance</span>
              </li>
            </ul>
          </div>

          {/* Informações de pagamento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Métodos de pagamento aceitos:</strong> Cartão de Crédito (até 12x), PIX e Boleto.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              O pagamento será processado de forma segura através do Stripe. 
              Você receberá um email de confirmação após o pagamento.
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagar R$ {monthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

