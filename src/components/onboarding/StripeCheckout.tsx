/**
 * Stripe Checkout Component
 * Componente para seleção de método de pagamento e criação de checkout session
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Smartphone, FileText, Loader2, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { PLANS, type PlanTier, type BillingPeriod } from '@/services/subscriptionService';

interface StripeCheckoutProps {
  planId: PlanTier;
  billingPeriod: BillingPeriod;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'card' | 'pix' | 'boleto';

export default function StripeCheckout({ 
  planId, 
  billingPeriod, 
  onSuccess,
  onCancel 
}: StripeCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const plan = PLANS[planId];
  const price = billingPeriod === 'annual' ? plan.annualPrice : plan.price;
  const monthlyPrice = billingPeriod === 'annual' ? Math.round(plan.annualPrice / 12) : plan.price;

  const paymentMethods: Array<{
    id: PaymentMethod;
    name: string;
    description: string;
    icon: React.ReactNode;
    available: boolean;
  }> = [
    {
      id: 'card',
      name: 'Cartão de Crédito',
      description: 'Visa, Mastercard, Elo. Parcelamento até 12x',
      icon: <CreditCard className="w-6 h-6" />,
      available: true,
    },
    {
      id: 'pix',
      name: 'PIX',
      description: 'Pagamento instantâneo. Confirmação em até 2 minutos',
      icon: <Smartphone className="w-6 h-6" />,
      available: true,
    },
    {
      id: 'boleto',
      name: 'Boleto',
      description: 'Vencimento em 3 dias. Confirmação em até 2 dias após pagamento',
      icon: <FileText className="w-6 h-6" />,
      available: true,
    },
  ];

  const handleCreateCheckout = async () => {
    if (!selectedMethod) {
      toast({
        title: "Selecione um método",
        description: "Por favor, escolha um método de pagamento",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Obter sessão do usuário
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar Edge Function para criar checkout
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          planId,
          billingPeriod,
          paymentMethod: selectedMethod,
          successUrl: `${window.location.origin}/viajar/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/viajar/onboarding?step=2`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar checkout');
      }

      // Se for freemium, não precisa de checkout
      if (planId === 'freemium' || !data.checkoutUrl) {
        toast({
          title: "Sucesso!",
          description: "Plano ativado com sucesso",
        });
        onSuccess?.();
        return;
      }

      // Redirecionar para Stripe Checkout
      window.location.href = data.checkoutUrl;

    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a sessão de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Plano */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
          <CardDescription>Revise seu plano antes de prosseguir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{plan.name}</p>
              <p className="text-sm text-muted-foreground">
                {billingPeriod === 'annual' ? 'Anual' : 'Mensal'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                R$ {monthlyPrice.toLocaleString('pt-BR')}/mês
              </p>
              {billingPeriod === 'annual' && (
                <p className="text-xs text-muted-foreground">
                  ou R$ {plan.annualPrice.toLocaleString('pt-BR')}/ano
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>Pagamento seguro via Stripe</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cancele quando quiser
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Método de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Escolha o Método de Pagamento</CardTitle>
          <CardDescription>
            Selecione como deseja pagar sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                disabled={!method.available || loading}
                className={cn(
                  "relative p-6 border-2 rounded-lg transition-all text-left",
                  "hover:border-primary hover:shadow-md",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                {selectedMethod === method.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedMethod === method.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{method.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Voltar
          </Button>
        )}
        <Button
          onClick={handleCreateCheckout}
          disabled={!selectedMethod || loading}
          className="flex-1"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              Continuar para Pagamento
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Informações de Segurança */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>🔒 Pagamento seguro processado pelo Stripe</p>
        <p>Seus dados estão protegidos e criptografados</p>
      </div>
    </div>
  );
}


