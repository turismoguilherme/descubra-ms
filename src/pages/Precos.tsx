import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Building2, Landmark, ArrowRight, Sparkles, Zap } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { supabase } from '@/integrations/supabase/client';
import type { PlanTier } from '@/services/subscriptionService';
import GlowCard from '@/components/home/GlowCard';

const Precos = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se usuário está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const plans = [
    {
      name: "Enterprise",
      subtitle: "Para Empresários",
      icon: Building2,
      price: "R$ 199",
      period: "/mês",
      description: "Hotéis, pousadas, agências e restaurantes",
      planId: 'professional' as PlanTier,
      features: [
        "Guilherme IA - Assistente inteligente",
        "Revenue Optimizer (precificação dinâmica)",
        "Market Intelligence (análise de mercado)",
        "Relatórios mensais detalhados",
        "Análise de concorrência",
        "Previsão de demanda",
        "Destaque nas buscas",
        "Suporte prioritário (24h)"
      ],
      cta: "Assinar Agora",
      highlighted: false,
      gradient: "from-cyan-500 to-cyan-600"
    },
    {
      name: "Governo",
      subtitle: "Para Secretarias",
      icon: Landmark,
      price: "R$ 2.000",
      period: "/mês",
      description: "Prefeituras e Secretarias de Turismo",
      planId: 'government' as PlanTier,
      features: [
        "Dashboard municipal completo",
        "Gestão de CATs com GPS",
        "Gestão de atendentes e ponto eletrônico",
        "Analytics estadual e municipal",
        "Mapas de calor e fluxo turístico",
        "Guilherme Estratégico (IA avançada)",
        "Relatórios consolidados para gestão",
        "Multi-usuários ilimitados",
        "Treinamento completo da equipe",
        "Suporte dedicado 24/7"
      ],
      cta: "Assinar Agora",
      highlighted: true,
      gradient: "from-guata-forest to-guata-deep"
    }
  ];

  const handleSelectPlan = (planId: PlanTier) => {
    // Se estiver autenticado, vai direto para onboarding
    // Se não estiver, vai para registro primeiro
    if (isAuthenticated) {
      navigate(`/viajar/onboarding?plan=${planId}&billing=monthly`);
    } else {
      navigate(`/viajar/register?plan=${planId}&billing=monthly`);
    }
  };

  return (
    <div className="min-h-screen bg-guata-cream">
      <ViaJARNavbar />
      
      <section className="relative overflow-hidden min-h-[52vh] flex items-center bg-gradient-to-br from-guata-cream via-guata-paper to-guata-cream">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 30%, hsl(var(--guata-gold) / 0.14), transparent 42%),
              radial-gradient(circle at 85% 20%, hsl(var(--guata-forest) / 0.07), transparent 38%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-guata-gold/35 text-guata-forest text-sm font-semibold mb-6 shadow-sm">
              <Sparkles className="h-4 w-4 text-guata-gold" />
              <span>Planos para cada necessidade</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-guata text-guata-deep mb-4">
              Escolha o plano ideal
            </h1>
            <p className="text-xl text-guata-bark/85 max-w-2xl mx-auto">
              Soluções completas para empresários do setor turístico e gestores públicos
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-guata-paper">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <GlowCard 
                key={index}
                className={`p-8 transition-all duration-300 border border-guata-gold/20 ${
                  plan.highlighted 
                    ? 'bg-white scale-[1.02] z-10 shadow-lg shadow-guata-forest/10' 
                    : 'bg-white/95'
                }`}
                glowColor={plan.highlighted ? 'hsl(var(--guata-forest) / 0.25)' : 'hsl(var(--guata-gold) / 0.2)'}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-guata-forest text-guata-cream text-sm font-semibold rounded-full shadow-md">
                      Mais completo
                    </div>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`inline-flex w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} items-center justify-center mb-4`}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-2xl font-bold text-guata-deep">
                      {plan.name}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      plan.highlighted ? 'bg-guata-forest/10 text-guata-forest' : 'bg-guata-gold/15 text-guata-deep'
                    }`}>
                      {plan.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-guata-bark/75">
                    {plan.description}
                  </p>
                </div>
                
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-guata-deep">
                      {plan.price}
                    </span>
                    <span className="text-sm text-guata-bark/70">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-guata-forest' : 'text-guata-gold'
                      }`} />
                      <span className="text-sm text-guata-bark/85">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  onClick={() => handleSelectPlan(plan.planId)}
                  className={`w-full h-12 font-semibold gap-2 transition-all duration-300 hover:-translate-y-1 ${
                    plan.highlighted 
                      ? 'bg-guata-forest hover:bg-guata-deep text-guata-cream shadow-md' 
                      : 'bg-guata-gold hover:bg-guata-gold-light text-guata-deep shadow-md'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ou Info adicional */}
      <section className="py-20 bg-guata-deep text-guata-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--guata-gold) / 0.35) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-guata-gold/35 mb-6">
            <Zap className="h-4 w-4 text-guata-gold" />
            <span className="text-sm text-guata-cream font-medium">Solução personalizada</span>
          </div>
          <h2 className="text-3xl font-extrabold font-guata text-guata-cream mb-4">
            Precisa de uma solução personalizada?
          </h2>
          <p className="text-lg text-guata-cream/80 mb-8">
            Entre em contato com nossos especialistas e descubra como podemos atender 
            às necessidades específicas da sua organização.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-guata-gold hover:bg-guata-gold-light text-guata-deep gap-2 h-14 px-8 text-lg font-semibold hover:-translate-y-1 transition-all duration-300">
              Falar com especialista
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Precos;