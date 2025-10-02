import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const Precos = () => {
  const plans = [
    {
      name: "Starter",
      price: "Sob Consulta",
      description: "Para municípios pequenos",
      features: [
        "Até 50.000 habitantes",
        "IA Guilherme básica",
        "Gestão de destinos",
        "Relatórios mensais",
        "Suporte por email",
        "1 usuário admin"
      ],
      cta: "Começar Agora",
      highlighted: false
    },
    {
      name: "Professional",
      price: "Sob Consulta",
      description: "Para cidades médias",
      features: [
        "Até 500.000 habitantes",
        "IA Guilherme completa",
        "Gestão de destinos e eventos",
        "Analytics avançado",
        "Passaporte digital",
        "Suporte prioritário",
        "5 usuários admin",
        "Customização de marca"
      ],
      cta: "Mais Popular",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Sob Consulta",
      description: "Para estados e capitais",
      features: [
        "Usuários ilimitados",
        "IA Guilherme + customizações",
        "Multi-tenant completo",
        "Analytics em tempo real",
        "Gamificação completa",
        "API personalizada",
        "Suporte 24/7",
        "Usuários admin ilimitados",
        "Treinamento dedicado",
        "Consultoria estratégica"
      ],
      cta: "Falar com Vendas",
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
              Planos e Preços
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Soluções flexíveis para cada necessidade, do município pequeno ao estado inteiro
            </p>
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

                <Link to="/contato">
                  <Button 
                    size="lg" 
                    className={`w-full ${
                      plan.highlighted 
                        ? 'bg-white text-blue-900 hover:bg-blue-50' 
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
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
