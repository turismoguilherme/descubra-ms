import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, Award, Rocket, Heart, Globe, Code, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const SobreFlowTrip = () => {
  const values = [
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "Inovação Constante",
      description: "Sempre buscamos as tecnologias mais avançadas para criar soluções que transformam o turismo digital."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Paixão pelo Turismo",
      description: "Acreditamos que o turismo conecta pessoas, culturas e histórias. Nossa missão é potencializar essas conexões."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Foco no Cliente",
      description: "Cada estado tem suas particularidades. Desenvolvemos soluções personalizadas para atender necessidades específicas."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Impacto Social",
      description: "Nosso trabalho contribui para o desenvolvimento econômico e social das regiões onde atuamos."
    }
  ];

  const team = [
    {
      name: "Equipe de Desenvolvimento",
      role: "Tecnologia e Inovação",
      description: "Especialistas em React, TypeScript, Supabase e IA, focados em criar experiências excepcionais.",
      icon: <Code className="h-6 w-6" />
    },
    {
      name: "Consultores de Turismo",
      role: "Estratégia e Mercado",
      description: "Profissionais com experiência em turismo digital e gestão pública para orientar implementações.",
      icon: <Target className="h-6 w-6" />
    },
    {
      name: "Designers UX/UI",
      role: "Experiência do Usuário",
      description: "Criamos interfaces intuitivas e engajantes que encantam turistas e facilitam a gestão.",
      icon: <Zap className="h-6 w-6" />
    },
    {
      name: "Suporte Especializado",
      role: "Atendimento e Sucesso",
      description: "Equipe dedicada para garantir que cada cliente alcance seus objetivos com nossa plataforma.",
      icon: <Users className="h-6 w-6" />
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Fundação da FlowTrip",
      description: "Nascemos com a visão de revolucionar o turismo digital no Brasil"
    },
    {
      year: "2023",
      title: "Primeiro Cliente - MS",
      description: "Mato Grosso do Sul se torna nosso primeiro estado parceiro com o Descubra MS"
    },
    {
      year: "2024",
      title: "Expansão Nacional",
      description: "Iniciamos expansão para outros estados do Centro-Oeste e Sudeste"
    },
    {
      year: "2024",
      title: "IA Integrada",
      description: "Lançamento dos assistentes virtuais Guata e Delinha com tecnologia avançada"
    }
  ];

  const stats = [
    { number: "25.000+", label: "Usuários Impactados" },
    { number: "100+", label: "Destinos Digitalizados" },
    { number: "1", label: "Estado Atendido" },
    { number: "300%", label: "Aumento no Engajamento" }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white" variant="secondary">
                  Sobre a FlowTrip
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Transformando o
                  <span className="block text-accent">Turismo Digital</span>
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  Somos uma startup brasileira dedicada a revolucionar a experiência turística 
                  através de tecnologia inovadora e soluções personalizadas para cada estado.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/contato">Fale Conosco</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                    <Link to="/casos-sucesso">Ver Nosso Trabalho</Link>
                  </Button>
                </div>
              </div>
              <div className="lg:text-right">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center lg:text-right">
                      <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                        {stat.number}
                      </div>
                      <div className="text-white/80 text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="border-border">
                <CardContent className="p-8">
                  <Target className="h-12 w-12 text-primary mb-6" />
                  <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
                  <p className="text-lg text-muted-foreground">
                    Democratizar o acesso a tecnologias avançadas de turismo digital, 
                    permitindo que cada estado brasileiro ofereça experiências turísticas 
                    excepcionais e competitivas globalmente.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-8">
                  <Award className="h-12 w-12 text-primary mb-6" />
                  <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Visão</h2>
                  <p className="text-lg text-muted-foreground">
                    Ser a principal plataforma de turismo digital do Brasil, 
                    conectando milhões de turistas aos destinos mais incríveis 
                    do país através de tecnologia inovadora e experiências memoráveis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nossos Valores
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Os princípios que guiam cada decisão e cada linha de código que desenvolvemos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-border text-center">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">{value.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nossa Jornada
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Marcos importantes na construção da melhor plataforma de turismo digital do Brasil
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {milestone.year}
                    </Badge>
                  </div>
                  <Card className="flex-1 border-border">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nossa Equipe
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Profissionais especializados em tecnologia, turismo e experiência do usuário
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg text-primary">
                        {member.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {member.name}
                        </h3>
                        <p className="text-primary font-medium mb-3 text-sm">
                          {member.role}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {member.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Tecnologia de Ponta
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Utilizamos as tecnologias mais modernas e confiáveis do mercado 
                  para garantir performance, segurança e escalabilidade.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-3 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-foreground">Frontend Moderno:</strong>
                      <span className="text-muted-foreground ml-1">React, TypeScript, Tailwind CSS</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-3 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-foreground">Backend Robusto:</strong>
                      <span className="text-muted-foreground ml-1">Supabase, PostgreSQL, Edge Functions</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-3 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-foreground">IA Integrada:</strong>
                      <span className="text-muted-foreground ml-1">OpenAI, Machine Learning, NLP</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-primary rounded-full mt-3 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-foreground">Infraestrutura:</strong>
                      <span className="text-muted-foreground ml-1">AWS, CDN Global, Backup Automático</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Por que Nossa Tecnologia se Destaca?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">Performance otimizada para mobile</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">Segurança enterprise com RLS</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">Escalabilidade automática</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary mr-3" />
                    <span className="text-muted-foreground">Uptime de 99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Vamos Transformar o Turismo Juntos?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Conheça nossa equipe e descubra como podemos elevar o turismo digital do seu estado
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contato">Agendar Reunião</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/solucoes">Conhecer Soluções</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default SobreFlowTrip;