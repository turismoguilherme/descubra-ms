import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Zap, Users, Globe, Headphones, Shield, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Precos = () => {
  const plans = [
    {
      name: "Básico",
      subtitle: "Ideal para começar",
      price: "R$ 2.500",
      period: "/mês",
      description: "Perfeito para estados que estão iniciando a digitalização do turismo",
      highlight: false,
      features: {
        included: [
          "Até 50 destinos turísticos",
          "Até 100 usuários ativos/mês",
          "Passaporte digital básico",
          "Analytics básico",
          "Suporte por email",
          "Customização de cores e logo",
          "App web responsivo",
          "1 administrador municipal"
        ],
        notIncluded: [
          "IA integrada",
          "API personalizada", 
          "Suporte prioritário",
          "Treinamento presencial",
          "Múltiplos domínios"
        ]
      },
      cta: "Começar Agora"
    },
    {
      name: "Profissional",
      subtitle: "Mais popular",
      price: "R$ 4.500",
      period: "/mês",
      description: "Para estados com estratégia turística consolidada e foco em crescimento",
      highlight: true,
      features: {
        included: [
          "Destinos ilimitados",
          "Usuários ilimitados",
          "Passaporte digital completo",
          "IA integrada (Guata/Delinha)",
          "Analytics avançado",
          "API personalizada",
          "Suporte prioritário",
          "Customização completa",
          "Múltiplos administradores",
          "Sistema de eventos",
          "Gestão de parceiros",
          "Relatórios detalhados"
        ],
        notIncluded: [
          "Múltiplas instâncias",
          "Treinamento presencial",
          "SLA garantido"
        ]
      },
      cta: "Escolher Profissional"
    },
    {
      name: "Enterprise",
      subtitle: "Solução completa",
      price: "Sob consulta",
      period: "",
      description: "Para grandes projetos, múltiplos estados ou necessidades específicas",
      highlight: false,
      features: {
        included: [
          "Tudo do plano Profissional",
          "Múltiplas instâncias/estados",
          "Suporte 24/7",
          "Treinamento presencial",
          "Integração customizada",
          "SLA 99.9% garantido",
          "Consultoria estratégica",
          "Desenvolvimento sob medida",
          "Backup e disaster recovery",
          "Compliance LGPD completo"
        ],
        notIncluded: []
      },
      cta: "Falar com Vendas"
    }
  ];

  const addOns = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      name: "IA Avançada",
      description: "Recomendações personalizadas e chatbot inteligente",
      price: "+R$ 800/mês"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      name: "Treinamento Presencial",
      description: "Capacitação da equipe no local",
      price: "R$ 3.500/dia"
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      name: "Domínio Personalizado",
      description: "Seu próprio domínio (ex: turismo.seuestado.gov.br)",
      price: "+R$ 300/mês"
    },
    {
      icon: <Headphones className="h-6 w-6 text-primary" />,
      name: "Suporte Premium",
      description: "Suporte prioritário via WhatsApp",
      price: "+R$ 500/mês"
    }
  ];

  const faq = [
    {
      question: "Os preços incluem hospedagem e infraestrutura?",
      answer: "Sim, todos os preços incluem hospedagem na nuvem AWS, CDN global, backup automático e toda a infraestrutura necessária."
    },
    {
      question: "Existe contrato de fidelidade?",
      answer: "Oferecemos contratos anuais com desconto ou mensais sem fidelidade. Contratos anuais têm 15% de desconto."
    },
    {
      question: "Posso migrar entre planos?",
      answer: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ajustes de cobrança são feitos no próximo ciclo."
    },
    {
      question: "O que acontece se exceder os limites?",
      answer: "No plano Básico, oferecemos upgrade automático ou cobrança por uso excedente. No Profissional, os recursos são ilimitados."
    },
    {
      question: "Vocês oferecem período de teste?",
      answer: "Sim, oferecemos 30 dias gratuitos em qualquer plano para que você possa avaliar todas as funcionalidades."
    },
    {
      question: "Como funciona a customização?",
      answer: "Todos os planos incluem customização de marca. No Profissional e Enterprise, oferecemos customização completa de interface e funcionalidades."
    }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Preços Transparentes
              <span className="block text-accent">Para Cada Necessidade</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Escolha o plano ideal para transformar o turismo do seu estado
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              30 dias grátis em qualquer plano
            </Badge>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative border-border ${
                    plan.highlight ? 'ring-2 ring-primary shadow-2xl scale-105 z-10' : ''
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white px-6 py-2">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">{plan.subtitle}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button 
                      className="w-full mb-6" 
                      variant={plan.highlight ? "default" : "outline"}
                      size="lg"
                      asChild
                    >
                      <Link to="/contato">{plan.cta}</Link>
                    </Button>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">
                          Incluído no plano
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.included.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm">
                              <CheckCircle className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {plan.features.notIncluded.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">
                            Não incluído
                          </h4>
                          <ul className="space-y-2">
                            {plan.features.notIncluded.map((feature, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <X className="h-4 w-4 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Serviços Adicionais
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Potencialize ainda mais sua plataforma com nossos add-ons especializados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {addOns.map((addon, index) => (
                <Card key={index} className="border-border text-center">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">{addon.icon}</div>
                    <h3 className="font-semibold text-foreground mb-2">{addon.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
                    <div className="text-lg font-bold text-primary">{addon.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Esclarecemos as dúvidas mais comuns sobre nossos planos
              </p>
            </div>

            <div className="space-y-6">
              {faq.map((item, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Segurança Garantida
                </h3>
                <p className="text-muted-foreground">
                  Infraestrutura segura com backup automático e conformidade LGPD
                </p>
              </div>
              <div>
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  ROI Comprovado
                </h3>
                <p className="text-muted-foreground">
                  Aumento médio de 300% no engajamento turístico digital
                </p>
              </div>
              <div>
                <Headphones className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Suporte Especializado
                </h3>
                <p className="text-muted-foreground">
                  Equipe dedicada com expertise em turismo digital
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para Começar?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Teste grátis por 30 dias e veja a diferença na prática
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contato">Iniciar Teste Grátis</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/casos-sucesso">Ver Casos de Sucesso</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default Precos;