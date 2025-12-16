import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Building2, Landmark, ArrowRight, Sparkles } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { supabase } from '@/integrations/supabase/client';
import type { PlanTier } from '@/services/subscriptionService';

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
      gradient: "from-viajar-cyan to-viajar-blue"
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
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Planos para cada necessidade</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Escolha o Plano Ideal
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Soluções completas para empresários do setor turístico e gestores públicos
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted 
                    ? 'bg-viajar-slate text-white shadow-2xl shadow-emerald-500/20 scale-105 z-10' 
                    : 'bg-card border border-border hover:border-viajar-cyan/30 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
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
                    <h3 className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                      {plan.name}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      plan.highlighted ? 'bg-white/20 text-white' : 'bg-viajar-cyan/10 text-viajar-cyan'
                    }`}>
                      {plan.subtitle}
                    </span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                </div>
                
                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-emerald-400' : 'text-viajar-cyan'
                      }`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  onClick={() => handleSelectPlan(plan.planId)}
                  className={`w-full h-12 font-semibold gap-2 ${
                    plan.highlighted 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                      : 'bg-viajar-slate hover:bg-viajar-slate/90 text-white'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ou Info adicional */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Precisa de uma solução personalizada?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Entre em contato com nossos especialistas e descubra como podemos atender 
            às necessidades específicas da sua organização.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-viajar-slate hover:bg-viajar-slate/90 text-white gap-2 h-14 px-8 text-lg">
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
