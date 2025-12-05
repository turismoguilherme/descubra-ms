import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Precos = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    const planMapping: { [key: string]: string } = {
      'Starter': 'freemium',
      'Professional': 'professional', 
      'Enterprise': 'enterprise',
      'Governo': 'government'
    };
    
    const planId = planMapping[planName] || 'professional';
    navigate(`/viajar/register?plan=${planId}&billing=monthly`);
  };

  const plans = [
    {
      name: "Starter",
      price: "R$ 0",
      period: "/mês",
      description: "Para pequenos negócios iniciantes",
      features: [
        "Perfil público básico",
        "Até 5 fotos",
        "Aparece nas buscas",
        "Localização no mapa",
        "Horários de funcionamento"
      ],
      cta: "Começar Grátis",
      highlighted: false,
      gradient: "from-slate-500 to-slate-600"
    },
    {
      name: "Professional",
      price: "R$ 199",
      period: "/mês",
      description: "Para hotéis e pousadas médios",
      features: [
        "Tudo do Starter",
        "Fotos ilimitadas",
        "Guilherme básico",
        "Relatórios mensais",
        "Análise de concorrência",
        "Destaque nas buscas",
        "Suporte prioritário (24h)"
      ],
      cta: "Mais Popular",
      highlighted: true,
      gradient: "from-viajar-cyan to-viajar-blue"
    },
    {
      name: "Enterprise",
      price: "R$ 499",
      period: "/mês",
      description: "Para grandes hotéis e redes",
      features: [
        "Tudo do Professional",
        "Guilherme Suite completa",
        "Revenue Optimizer (IA)",
        "Market Intelligence",
        "Previsão de demanda",
        "API de integração",
        "Consultoria mensal (1h)",
        "Suporte 24/7 WhatsApp"
      ],
      cta: "Falar com Vendas",
      highlighted: false,
      gradient: "from-purple-500 to-violet-600"
    },
    {
      name: "Governo",
      price: "R$ 2.000",
      period: "/mês",
      description: "Para prefeituras e secretarias",
      features: [
        "Dashboard municipal completo",
        "Gestão de CATs com GPS",
        "Gestão de atendentes",
        "Analytics estadual/municipal",
        "Mapas de calor",
        "Guilherme Estratégico",
        "Relatórios consolidados",
        "Multi-usuários ilimitados",
        "Treinamento da equipe"
      ],
      cta: "Contato Institucional",
      highlighted: false,
      gradient: "from-emerald-500 to-teal-600"
    }
  ];

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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">14 dias grátis em todos os planos</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Planos para Todos os Tamanhos
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Do pequeno estabelecimento às grandes redes e governos. Escolha o plano ideal para você.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.highlighted 
                    ? 'bg-viajar-slate text-white shadow-2xl shadow-viajar-cyan/20 scale-105 z-10' 
                    : 'bg-card border border-border hover:border-viajar-cyan/30 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-viajar-cyan text-viajar-slate text-sm font-semibold rounded-full">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-lg">{plan.name[0]}</span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>
                    {plan.name}
                  </h3>
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
                        plan.highlighted ? 'text-viajar-cyan' : 'text-viajar-cyan'
                      }`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-muted-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  className={`w-full h-12 font-semibold ${
                    plan.highlighted 
                      ? 'bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate' 
                      : 'bg-viajar-slate hover:bg-viajar-slate/90 text-white'
                  }`}
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Precisa de um plano personalizado?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Fale com nossos especialistas e descubra a solução ideal para sua região.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-viajar-slate hover:bg-viajar-slate/90 text-white gap-2 h-14 px-8 text-lg">
              Solicitar Proposta
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
