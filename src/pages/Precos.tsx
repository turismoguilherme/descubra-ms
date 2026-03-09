import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Building2, Landmark, ArrowRight, Sparkles, Zap } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { supabase } from '@/integrations/supabase/client';
import type { PlanTier } from '@/services/subscriptionService';
import TechBackground from '@/components/home/TechBackground';
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
      gradient: "from-emerald-500 to-teal-600"
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
    <div className="min-h-screen bg-slate-950">
      <ViaJARNavbar />
      
      {/* Hero Section with Tech Background */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        <TechBackground variant="hero" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-100 font-medium">💰 Planos para cada necessidade</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                Escolha o Plano Ideal
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Soluções completas para empresários do setor turístico e gestores públicos
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <GlowCard 
                key={index}
                className={`p-8 transition-all duration-300 ${
                  plan.highlighted 
                    ? 'bg-slate-800/80 scale-105 z-10' 
                    : 'bg-slate-800/50'
                }`}
                glowColor={plan.highlighted ? 'rgba(52, 211, 153, 0.3)' : 'rgba(20, 184, 166, 0.3)'}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-full shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                      Mais Completo
                    </div>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`inline-flex w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} items-center justify-center mb-4`}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      plan.highlighted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {plan.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {plan.description}
                  </p>
                </div>
                
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/60">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-emerald-400' : 'text-cyan-400'
                      }`} />
                      <span className="text-sm text-white/80">
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
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
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
      <section className="py-20 bg-slate-950 relative overflow-hidden">
        <TechBackground variant="section" className="opacity-30" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 mb-6 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-100 font-medium">Solução Personalizada</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Precisa de uma solução personalizada?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Entre em contato com nossos especialistas e descubra como podemos atender 
            às necessidades específicas da sua organização.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white gap-2 h-14 px-8 text-lg font-semibold shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] hover:-translate-y-1 transition-all duration-300">
              Falar com Especialista
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