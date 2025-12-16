/**
 * Plan Selector Component
 * Seleção de planos de assinatura com comparação de features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X, Star, Sparkles, Info } from 'lucide-react';
import { PLANS, calculateAnnualSavings, type PlanTier } from '@/services/subscriptionService';
import { cn } from '@/lib/utils';

interface PlanSelectorProps {
  onSelectPlan: (planId: PlanTier, billingPeriod: 'monthly' | 'annual') => void;
  recommendedPlan?: PlanTier;
  preSelectedPlan?: PlanTier | null;
  preSelectedBilling?: 'monthly' | 'annual' | null;
  isViaJARTur?: boolean; // Se true, mostra apenas 2 planos (Professional e Government)
}

export default function PlanSelector({ onSelectPlan, recommendedPlan, preSelectedPlan, preSelectedBilling, isViaJARTur = false }: PlanSelectorProps) {
  const [isAnnual, setIsAnnual] = useState(preSelectedBilling === 'annual' || false);

  // ViaJAR Tur: apenas 2 planos (Empresários e Secretárias)
  // Descubra MS ou outros: todos os planos
  const planOrder: PlanTier[] = isViaJARTur 
    ? ['professional', 'government'] // ViaJAR Tur: apenas 2 planos
    : ['freemium', 'professional', 'enterprise', 'government']; // Outros: todos os planos

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Escolha Seu Plano</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {isViaJARTur 
            ? 'Selecione o plano ideal para o seu negócio. Assinatura recorrente mensal ou anual.'
            : 'Selecione o plano ideal para o seu negócio.'}
        </p>
        
        {preSelectedPlan && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg max-w-md mx-auto">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span className="font-semibold">Plano Pré-selecionado:</span>
              <span className="capitalize font-bold">{preSelectedPlan}</span>
              {preSelectedBilling && (
                <span className="text-green-600">
                  ({preSelectedBilling === 'annual' ? 'Anual' : 'Mensal'})
                </span>
              )}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Este plano será ativado após o cadastro e pagamento
            </p>
          </div>
        )}

        {/* Toggle Mensal/Anual */}
        <div className="flex items-center justify-center gap-4 py-4">
          <span className={cn(
            "text-sm font-medium transition-colors",
            !isAnnual ? "text-foreground" : "text-muted-foreground"
          )}>
            Mensal
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-purple-600"
          />
          <span className={cn(
            "text-sm font-medium transition-colors",
            isAnnual ? "text-foreground" : "text-muted-foreground"
          )}>
            Anual
          </span>
          <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 border-green-300">
            <Sparkles className="h-3 w-3" />
            Economize 20%
          </Badge>
        </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planOrder.map((planId) => {
          const plan = PLANS[planId];
          const price = isAnnual ? plan.annualPrice : plan.price;
          const monthlyPrice = isAnnual ? Math.round(plan.annualPrice / 12) : plan.price;
          const savings = isAnnual && plan.price > 0 ? calculateAnnualSavings(plan.price) : 0;
          const isRecommended = recommendedPlan === planId || plan.recommended;

          return (
            <Card
              key={planId}
              className={cn(
                "relative border-2 transition-all hover:shadow-lg",
                isRecommended && "border-purple-500 shadow-purple-100"
              )}
            >
              {/* Badge Recomendado */}
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-purple-600 text-white">
                    <Star className="h-3 w-3 fill-current" />
                    Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                {/* Ícone e Nome */}
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                    planId === 'freemium' && "bg-gray-100",
                    planId === 'professional' && "bg-blue-100",
                    planId === 'enterprise' && "bg-purple-100",
                    planId === 'government' && "bg-green-100"
                  )}>
                    {planId === 'freemium' && '📦'}
                    {planId === 'professional' && '💼'}
                    {planId === 'enterprise' && '🏢'}
                    {planId === 'government' && '🏛️'}
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs h-10">
                    {plan.target}
                  </CardDescription>
                </div>

                {/* Preço */}
                <div className="pt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm">R$</span>
                    <span className="text-4xl font-bold">
                      {monthlyPrice.toLocaleString('pt-BR')}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground text-sm">/mês</span>
                    )}
                  </div>
                  
                  {isAnnual && plan.price > 0 && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Economize R$ {savings.toLocaleString('pt-BR')}/ano
                    </div>
                  )}
                  
                  {!isAnnual && plan.price > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ou R$ {plan.annualPrice.toLocaleString('pt-BR')}/ano
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        feature.included ? "text-foreground" : "text-muted-foreground line-through"
                      )}>
                        {feature.name}
                        {feature.limit && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({feature.limit})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                  
                  {plan.features.length > 6 && (
                    <div className="text-xs text-muted-foreground pt-1">
                      + {plan.features.length - 6} funcionalidades adicionais
                    </div>
                  )}
                </div>

                {/* Botão */}
                <Button
                  className={cn(
                    "w-full",
                    isRecommended && "bg-purple-600 hover:bg-purple-700"
                  )}
                  variant={isRecommended ? "default" : "outline"}
                  onClick={() => onSelectPlan(planId, isAnnual ? 'annual' : 'monthly')}
                >
                  {plan.price === 0 ? 'Começar Grátis' : 'Selecionar Plano'}
                </Button>

                {/* Aviso */}
                {plan.price > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Cancele quando quiser
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabela de Comparação Completa */}
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            const table = document.getElementById('comparison-table');
            table?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Info className="h-4 w-4" />
          Ver Comparação Completa de Funcionalidades
        </Button>

        <div id="comparison-table" className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-semibold">Funcionalidade</th>
                {planOrder.map((planId) => (
                  <th key={planId} className="text-center p-4 font-semibold min-w-[120px]">
                    {PLANS[planId].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Busca todas as features únicas */}
              {Array.from(
                new Set(
                  planOrder.flatMap(planId => 
                    PLANS[planId].features.map(f => f.name)
                  )
                )
              ).map((featureName, idx) => (
                <tr key={idx} className="border-t hover:bg-muted/30">
                  <td className="p-4">{featureName}</td>
                  {planOrder.map((planId) => {
                    const feature = PLANS[planId].features.find(f => f.name === featureName);
                    return (
                      <td key={planId} className="text-center p-4">
                        {feature?.included ? (
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5 text-green-600" />
                            {feature.limit && (
                              <span className="text-xs text-muted-foreground">
                                {feature.limit}
                              </span>
                            )}
                            {feature.description && (
                              <span className="text-xs text-muted-foreground">
                                {feature.description}
                              </span>
                            )}
                          </div>
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Rápido */}
      <div className="space-y-4 pt-8">
        <h3 className="text-xl font-semibold text-center">Perguntas Frequentes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Posso cancelar a qualquer momento?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sim! Não há fidelidade. Você pode cancelar quando quiser sem multas ou taxas.
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Posso mudar de plano depois?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente.
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Garantia */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
              ✅
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Garantia de Satisfação 30 Dias
              </h4>
              <p className="text-sm text-green-800">
                Se você não estiver satisfeito nos primeiros 30 dias, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

