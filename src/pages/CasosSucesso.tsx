import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Quote, MapPin, Users, TrendingUp, Award, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CasosSucesso = () => {
  const mainCase = {
    state: "Mato Grosso do Sul",
    title: "Descubra MS: Pioneiro em Turismo Digital",
    description: "O primeiro estado a implementar nossa solução completa, revolucionando a experiência turística com tecnologia de ponta.",
    image: "/placeholder.svg",
    results: [
      { metric: "15.000+", label: "Usuários Ativos" },
      { metric: "80+", label: "Destinos Cadastrados" },
      { metric: "200+", label: "Eventos Promovidos" },
      { metric: "95%", label: "Satisfação dos Usuários" }
    ],
    challenges: [
      "Necessidade de digitalizar o turismo estadual",
      "Engajar turistas com experiências interativas",
      "Centralizar informações turísticas dispersas",
      "Criar sistema de gamificação atrativo"
    ],
    solutions: [
      "Implementação do Passaporte Digital com sistema de pontos",
      "Plataforma centralizada para todos os destinos",
      "IA integrada para recomendações personalizadas",
      "Sistema de gestão completo para municípios"
    ],
    testimonial: {
      text: "A FlowTrip transformou completamente nossa estratégia de turismo digital. O engajamento dos visitantes aumentou significativamente com o sistema de gamificação.",
      author: "Secretaria de Turismo - MS",
      role: "Gestão Estadual de Turismo"
    }
  };

  const otherCases = [
    {
      state: "Projeto Piloto - Goiás",
      title: "Expansão para o Centro-Oeste",
      description: "Implementação em fase de planejamento para digitalizar o turismo goiano.",
      status: "Em Desenvolvimento",
      expectedResults: ["50+ destinos", "Integração com agências locais", "Foco em ecoturismo"],
      timeline: "Q2 2024"
    },
    {
      state: "Projeto Piloto - Mato Grosso",
      title: "Turismo Sustentável Digital",
      description: "Foco em turismo ecológico e sustentável com tecnologia avançada.",
      status: "Planejamento",
      expectedResults: ["Pantanal digital", "Trilhas gamificadas", "Educação ambiental"],
      timeline: "Q3 2024"
    }
  ];

  const metrics = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      value: "25.000+",
      label: "Usuários Impactados",
      description: "Turistas que já utilizaram nossa plataforma"
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      value: "100+",
      label: "Destinos Digitalizados",
      description: "Locais turísticos cadastrados e ativos"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      value: "300%",
      label: "Aumento no Engajamento",
      description: "Comparado aos métodos tradicionais"
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      value: "98%",
      label: "Uptime da Plataforma",
      description: "Disponibilidade e confiabilidade"
    }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Casos de
              <span className="block text-accent">Sucesso</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Veja como estados e regiões já estão transformando o turismo com a FlowTrip
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contato">Seja o Próximo Caso de Sucesso</Link>
            </Button>
          </div>
        </section>

        {/* Main Case Study - MS */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <Badge className="mb-4" variant="default">Caso Principal</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {mainCase.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {mainCase.description}
                </p>
                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Principais Desafios:</h4>
                    <ul className="space-y-1">
                      {mainCase.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-muted-foreground flex items-start">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Soluções Implementadas:</h4>
                    <ul className="space-y-1">
                      {mainCase.solutions.map((solution, idx) => (
                        <li key={idx} className="text-muted-foreground flex items-start">
                          <span className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button asChild>
                  <Link to="/ms" className="flex items-center">
                    Visitar Descubra MS
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 border border-border">
                <img 
                  src={mainCase.image} 
                  alt={mainCase.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <div className="grid grid-cols-2 gap-4">
                  {mainCase.results.map((result, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl font-bold text-primary">{result.metric}</div>
                      <div className="text-sm text-muted-foreground">{result.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <blockquote className="text-lg text-foreground mb-4 italic">
                  "{mainCase.testimonial.text}"
                </blockquote>
                <div className="flex items-center">
                  <div>
                    <div className="font-semibold text-foreground">{mainCase.testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{mainCase.testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Resultados Comprovados
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Números que demonstram o impacto real da nossa solução
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <Card key={index} className="text-center border-border">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">{metric.icon}</div>
                    <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                    <h3 className="font-semibold text-foreground mb-2">{metric.label}</h3>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pipeline Projects */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Próximos Projetos
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Estados e regiões que escolheram a FlowTrip para sua transformação digital
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherCases.map((project, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-foreground">{project.state}</h3>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <h4 className="font-medium text-foreground mb-2">{project.title}</h4>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="mb-4">
                      <h5 className="font-medium text-foreground mb-2">Resultados Esperados:</h5>
                      <ul className="space-y-1">
                        {project.expectedResults.map((result, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Timeline:</strong> {project.timeline}
                    </div>
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
              Transforme o Turismo do Seu Estado
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Seja pioneiro na sua região e ofereça uma experiência turística digital excepcional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contato">Solicitar Apresentação</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/solucoes">Ver Todas as Soluções</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default CasosSucesso;