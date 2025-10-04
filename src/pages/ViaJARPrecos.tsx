import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Zap, Users, Globe, Headphones, Shield, BarChart3, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const ViaJARPrecos = () => {
  const plans = [
    {
      name: "Starter",
      subtitle: "Para empresas iniciantes",
      price: "R$ 497",
      period: "/mês",
      description: "Ideal para pequenas empresas de turismo que estão começando",
      highlight: false,
      features: {
        included: [
          "Até 10 destinos",
          "Inventário turístico básico",
          "Relatórios simples",
          "Suporte por email",
          "1 usuário",
          "Dashboard básico",
          "Integração com redes sociais"
        ],
        notIncluded: [
          "IA Guilherme",
          "Relatórios avançados",
          "API personalizada",
          "Suporte prioritário"
        ]
      }
    },
    {
      name: "Professional",
      subtitle: "Para empresas em crescimento",
      price: "R$ 997",
      period: "/mês",
      description: "Perfeito para empresas que querem expandir e automatizar",
      highlight: true,
      features: {
        included: [
          "Até 50 destinos",
          "Inventário turístico completo",
          "IA Guilherme integrada",
          "Relatórios avançados",
          "Até 5 usuários",
          "Dashboard completo",
          "API básica",
          "Suporte prioritário",
          "Integração com booking",
          "Análise de mercado"
        ],
        notIncluded: [
          "White label",
          "API personalizada",
          "Suporte dedicado"
        ]
      }
    },
    {
      name: "Enterprise",
      subtitle: "Para grandes empresas",
      price: "R$ 1.997",
      period: "/mês",
      description: "Solução completa para grandes operações turísticas",
      highlight: false,
      features: {
        included: [
          "Destinos ilimitados",
          "Inventário completo + IA",
          "IA Guilherme avançada",
          "Relatórios personalizados",
          "Usuários ilimitados",
          "Dashboard customizado",
          "API personalizada",
          "Suporte dedicado 24/7",
          "White label completo",
          "Integração completa",
          "Análise preditiva",
          "Consultoria estratégica"
        ],
        notIncluded: []
      }
    }
  ];

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-cyan-500" />,
      title: "Analytics Avançado",
      description: "Relatórios detalhados sobre performance e tendências do mercado"
    },
    {
      icon: <Zap className="h-8 w-8 text-orange-500" />,
      title: "IA Guilherme",
      description: "Assistente inteligente para análise de mercado e insights estratégicos"
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: "Multi-tenant",
      description: "Suporte para múltiplos estados e regiões com dados isolados"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia de ponta a ponta"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Planos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">ViaJAR</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Escolha o plano ideal para sua empresa de turismo e transforme dados em insights estratégicos
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Sem compromisso
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2 text-orange-500" />
                IA incluída
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Seguro e confiável
              </Badge>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.highlight ? 'ring-2 ring-cyan-500 shadow-xl scale-105' : 'shadow-lg'}`}>
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                    <p className="text-gray-600">{plan.subtitle}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Incluído:</h4>
                      {plan.features.included.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {plan.features.notIncluded.length > 0 && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-semibold text-gray-900">Não incluído:</h4>
                        {plan.features.notIncluded.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start space-x-3">
                            <X className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <Button 
                        className={`w-full ${plan.highlight 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' 
                          : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                        size="lg"
                      >
                        Começar Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Por que escolher a ViaJAR?
              </h2>
              <p className="text-xl text-gray-600">
                Tecnologia de ponta para transformar seu negócio de turismo
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-500">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para transformar seu turismo?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Comece hoje mesmo e veja a diferença que a ViaJAR pode fazer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/viajar/register">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Começar Grátis
                </Button>
              </Link>
              <Link to="/viajar/contato">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Falar com Especialista
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <ViaJARFooter />
    </div>
  );
};

export default ViaJARPrecos;

