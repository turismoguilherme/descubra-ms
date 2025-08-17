import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Map, BarChart3, Smartphone, Globe, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Solucoes = () => {
  const features = [
    {
      icon: <Map className="h-8 w-8 text-primary" />,
      title: "Gestão de Destinos",
      description: "Gerencie todos os destinos turísticos com facilidade, incluindo descrições, imagens, localização e detalhes completos.",
      benefits: ["Interface intuitiva", "Upload de múltiplas imagens", "Geolocalização integrada", "SEO otimizado"]
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Passaporte Digital",
      description: "Sistema de gamificação que engaja turistas através de check-ins, pontuações e níveis de experiência.",
      benefits: ["Gamificação completa", "Sistema de pontos", "Níveis progressivos", "Certificados digitais"]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics Avançado",
      description: "Dashboards completos com insights sobre visitação, tendências e performance dos destinos.",
      benefits: ["Relatórios em tempo real", "Métricas de engajamento", "Análise de tendências", "Exportação de dados"]
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "App Mobile Ready",
      description: "Interface responsiva otimizada para dispositivos móveis, proporcionando experiência nativa.",
      benefits: ["Design responsivo", "PWA suport", "Offline mode", "Push notifications"]
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Multi-tenant",
      description: "Arquitetura multi-inquilino permite personalização completa para cada estado ou região.",
      benefits: ["Customização por estado", "Branding personalizado", "Domínios próprios", "Configurações independentes"]
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "IA Integrada",
      description: "Assistente virtual inteligente para recomendações personalizadas e suporte automático.",
      benefits: ["Recomendações IA", "Chatbot integrado", "Análise preditiva", "Automação inteligente"]
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "R$ 2.500",
      period: "/mês",
      description: "Ideal para estados em início de digitalização",
      features: [
        "Até 50 destinos",
        "Até 100 usuários ativos",
        "Analytics básico",
        "Suporte por email",
        "Customização de cores"
      ],
      highlight: false
    },
    {
      name: "Profissional",
      price: "R$ 4.500",
      period: "/mês",
      description: "Para estados com estratégia turística consolidada",
      features: [
        "Destinos ilimitados",
        "Usuários ilimitados",
        "Analytics avançado",
        "Suporte prioritário",
        "Customização completa",
        "IA integrada",
        "API personalizada"
      ],
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      period: "",
      description: "Para grandes projetos e múltiplos estados",
      features: [
        "Tudo do Profissional",
        "Múltiplas instâncias",
        "Suporte 24/7",
        "Treinamento presencial",
        "Integração customizada",
        "SLA garantido"
      ],
      highlight: false
    }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Soluções Completas para
              <span className="block text-accent">Turismo Digital</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Transforme a experiência turística do seu estado com nossa plataforma all-in-one
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contato">Solicitar Demo</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/casos-sucesso">Ver Casos de Sucesso</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Funcionalidades Principais
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para criar uma experiência turística digital de classe mundial
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Tecnologia de Ponta
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Nossa plataforma utiliza as tecnologias mais modernas para garantir performance, 
                  segurança e escalabilidade para qualquer volume de usuários.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">Segurança Enterprise</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">Performance Otimizada</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">CDN Global</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">Escalabilidade Ilimitada</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Stack Tecnológico</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frontend</span>
                    <Badge variant="secondary">React + TypeScript</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Backend</span>
                    <Badge variant="secondary">Supabase + PostgreSQL</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Infraestrutura</span>
                    <Badge variant="secondary">AWS + CDN</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Segurança</span>
                    <Badge variant="secondary">RLS + JWT</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Planos e Preços
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Escolha o plano ideal para o seu estado ou região
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card key={index} className={`border-border ${plan.highlight ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
                  <CardContent className="p-8">
                    {plan.highlight && (
                      <Badge className="mb-4" variant="default">Mais Popular</Badge>
                    )}
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.highlight ? "default" : "outline"}
                      asChild
                    >
                      <Link to="/contato">
                        {plan.name === "Enterprise" ? "Falar com Vendas" : "Começar Agora"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para Transformar o Turismo do Seu Estado?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Junte-se aos estados que já estão revolucionando o turismo com a OverFlow One
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contato">Solicitar Demonstração</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/precos">Ver Preços Detalhados</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default Solucoes;