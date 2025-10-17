/**
 * ViaJAR Pricing Page
 * Página pública de preços e planos
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PlanSelector from '@/components/onboarding/PlanSelector';
import type { PlanTier, BillingPeriod } from '@/services/subscriptionService';

export default function ViaJARPricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [preSelectedPlan, setPreSelectedPlan] = useState<PlanTier | null>(null);
  const [preSelectedBilling, setPreSelectedBilling] = useState<BillingPeriod | null>(null);

  // Capturar parâmetros de plano da URL
  useEffect(() => {
    const plan = searchParams.get('plan') as PlanTier;
    const billing = searchParams.get('billing') as BillingPeriod;
    
    if (plan) {
      setPreSelectedPlan(plan);
    }
    if (billing) {
      setPreSelectedBilling(billing);
    }
  }, [searchParams]);

  const handleSelectPlan = (planId: PlanTier, billingPeriod: BillingPeriod) => {
    // Redireciona para registro com plano pré-selecionado
    navigate(`/viajar/register?plan=${planId}&billing=${billingPeriod}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/30">
      {/* Hero Section */}
      <div className="border-b">
        <div className="container max-w-6xl mx-auto px-6 py-16 text-center space-y-6">
          <Badge variant="secondary" className="gap-1">
            ✨ Planos Flexíveis para Todos os Tamanhos
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto">
            Escolha o Plano Perfeito para o Seu Negócio
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Do pequeno estabelecimento ao grande hotel, temos o plano ideal para impulsionar seu turismo.
            <strong> Todos os planos incluem 14 dias grátis.</strong>
          </p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="container max-w-7xl mx-auto px-6 py-16">
        <PlanSelector 
          onSelectPlan={handleSelectPlan} 
          recommendedPlan={preSelectedPlan || "professional"}
          preSelectedPlan={preSelectedPlan}
          preSelectedBilling={preSelectedBilling}
        />
      </div>

      {/* Features Comparison */}
      <div className="border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Todos os Planos Incluem
            </h2>
            <p className="text-muted-foreground">
              Recursos fundamentais disponíveis em todos os planos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2">100% Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados protegidos com criptografia de ponta e conformidade com LGPD
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="font-semibold mb-2">Acesso Mobile</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie seu negócio de qualquer lugar, em qualquer dispositivo
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold mb-2">Atualizações Grátis</h3>
              <p className="text-sm text-muted-foreground">
                Novas funcionalidades adicionadas regularmente sem custo extra
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="font-semibold mb-2">Treinamento Incluído</h3>
              <p className="text-sm text-muted-foreground">
                Tutoriais em vídeo e documentação completa para você começar
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">Suporte em Português</h3>
              <p className="text-sm text-muted-foreground">
                Equipe brasileira pronta para ajudar via chat, email e telefone
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="font-semibold mb-2">Sem Fidelidade</h3>
              <p className="text-sm text-muted-foreground">
                Cancele quando quiser, sem multas ou taxas de cancelamento
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-muted-foreground">
            Empresas que já transformaram seus negócios com ViaJAR
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
            <p className="text-sm mb-4 italic">
              "Aumentamos nossa ocupação em 30% nos primeiros 3 meses. 
              O Revenue Optimizer da IA é sensacional!"
            </p>
            <div>
              <p className="font-semibold">João Silva</p>
              <p className="text-xs text-muted-foreground">
                Hotel Pantanal, Bonito/MS
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
            <p className="text-sm mb-4 italic">
              "Economizamos 20 horas por mês com a coleta automática de dados. 
              Nossa equipe pode focar no que importa."
            </p>
            <div>
              <p className="font-semibold">Maria Santos</p>
              <p className="text-xs text-muted-foreground">
                Secretaria de Turismo, Campo Grande/MS
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">⭐</span>
              ))}
            </div>
            <p className="text-sm mb-4 italic">
              "A interface é muito intuitiva e os insights são valiosos. 
              Finalmente entendo meu mercado!"
            </p>
            <div>
              <p className="font-semibold">Carlos Oliveira</p>
              <p className="text-xs text-muted-foreground">
                Pousada Recanto, Corumbá/MS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t bg-muted/30">
        <div className="container max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground">
              Tudo o que você precisa saber sobre nossos planos
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                Como funciona o teste grátis de 14 dias?
              </h3>
              <p className="text-sm text-muted-foreground">
                Você tem acesso completo a todas as funcionalidades do plano escolhido por 14 dias, 
                sem precisar informar cartão de crédito. Se não gostar, basta não renovar e não será cobrado nada.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                Posso mudar de plano depois?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. 
                O valor é ajustado proporcionalmente ao tempo restante da sua assinatura.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                Quais formas de pagamento vocês aceitam?
              </h3>
              <p className="text-sm text-muted-foreground">
                Aceitamos cartão de crédito (parcelado em até 12x), PIX, boleto bancário e 
                invoice (para governo e grandes empresas).
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                O CADASTUR é realmente obrigatório?
              </h3>
              <p className="text-sm text-muted-foreground">
                Para estabelecimentos turísticos no Brasil (hotéis, pousadas, agências, guias), 
                sim. Mas oferecemos 60 dias de período de graça para você obter o registro. 
                É gratuito e ajudamos você no processo!
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                Vocês oferecem suporte técnico?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sim! Todos os planos têm acesso ao suporte por email. 
                Planos Professional e Enterprise têm suporte prioritário (24h). 
                Plano Enterprise tem suporte 24/7 via WhatsApp.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sim! Não há fidelidade. Você pode cancelar quando quiser sem multas. 
                Se cancelar no meio do mês, seu acesso continua até o fim do período pago.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                A API da ALUMIA já está disponível?
              </h3>
              <p className="text-sm text-muted-foreground">
                Para estabelecimentos em Mato Grosso do Sul, estamos em negociação para integração 
                com a ALUMIA (plataforma oficial do governo MS). Enquanto isso, usamos dados 
                tratados com IA e múltiplas fontes públicas com 70-80% de precisão.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg border">
              <h3 className="font-semibold mb-2">
                Vocês têm desconto para pagamento anual?
              </h3>
              <p className="text-sm text-muted-foreground">
                Sim! Pagando anualmente você economiza 20% (2 meses grátis). 
                Por exemplo, o plano Professional sai de R$ 2.388/ano para R$ 1.912/ano.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <div className="p-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Transformar seu Negócio?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Junte-se a centenas de estabelecimentos que já usam ViaJAR
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
              onClick={() => navigate('/viajar/register')}
            >
              Começar Teste Grátis de 14 Dias
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 bg-white/10 border-white hover:bg-white/20"
              onClick={() => navigate('/contato')}
            >
              Falar com Consultor
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            Sem cartão de crédito • Cancele quando quiser • Suporte em português
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t">
        <div className="container max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="text-center">
              <p className="text-2xl font-bold">95%</p>
              <p className="text-xs text-muted-foreground">Satisfação</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-muted-foreground">Estabelecimentos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">27</p>
              <p className="text-xs text-muted-foreground">Estados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-muted-foreground">Suporte</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

