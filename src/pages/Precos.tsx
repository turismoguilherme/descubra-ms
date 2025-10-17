import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Precos = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    // Mapear nomes dos planos para IDs
    const planMapping: { [key: string]: string } = {
      'Freemium': 'freemium',
      'Professional': 'professional', 
      'Enterprise': 'enterprise',
      'Government': 'government'
    };
    
    const planId = planMapping[planName] || 'professional';
    // Redirecionar para cadastro com plano pré-selecionado
    navigate(`/viajar/register?plan=${planId}&billing=monthly`);
  };
  const plans = [
    {
      name: "Freemium",
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
      highlighted: false
    },
    {
      name: "Professional",
      price: "R$ 199",
      period: "/mês",
      description: "Para hotéis e pousadas médios",
      features: [
        "Fotos ilimitadas",
        "Intelligence IA básica",
        "Relatórios mensais",
        "Análise de concorrência",
        "Destaque nas buscas",
        "Suporte prioritário (24h)",
        "Estatísticas de visualização"
      ],
      cta: "Mais Popular",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "R$ 499",
      period: "/mês",
      description: "Para grandes hotéis e redes",
      features: [
        "ViaJAR Intelligence Suite completa",
        "Revenue Optimizer (IA)",
        "Market Intelligence",
        "Competitive Benchmark",
        "Previsão de demanda",
        "API de integração",
        "Consultoria mensal (1h)",
        "Selo 'Verificado ViaJAR'",
        "Suporte 24/7 WhatsApp"
      ],
      cta: "Falar com Vendas",
      highlighted: false
    },
    {
      name: "Governo",
      price: "R$ 2.000",
      period: "/mês",
      description: "Para prefeituras e secretarias",
      features: [
        "Dashboard municipal completo",
        "Gestão de CATs com GPS",
        "Gestão de atendentes (ponto)",
        "Analytics estadual/municipal",
        "Mapas de calor (fluxo turístico)",
        "IA Consultora Estratégica",
        "Relatórios consolidados",
        "Upload de arquivos oficiais",
        "Multi-usuários ilimitados",
        "Treinamento da equipe",
        "Suporte dedicado"
      ],
      cta: "Contato Institucional",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Planos Transparentes para Todos
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Do pequeno estabelecimento às grandes redes e governos. Todos os planos com 14 dias grátis.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/viajar/pricing">
                <Button size="lg" variant="secondary">
                  Ver Comparação Completa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-2xl p-8 ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl scale-105 relative' 
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    Mais Popular
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-8">
                  <div className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${
                        plan.highlighted ? 'text-yellow-300' : 'text-cyan-600'
                      }`} />
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg" 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-white text-blue-900 hover:bg-blue-50' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
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
      <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Fale com nossos especialistas e descubra o plano ideal para sua região.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg">
              Solicitar Proposta
            </Button>
          </Link>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Precos;
