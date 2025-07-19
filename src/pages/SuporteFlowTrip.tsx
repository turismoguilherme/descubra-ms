import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Headphones, MessageCircle, Clock, CheckCircle, AlertCircle, Book, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuporteFlowTrip = () => {
  const supportChannels = [
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "Chat Online",
      description: "Suporte em tempo real para questões urgentes",
      availability: "Seg-Sex: 8h-18h",
      responseTime: "< 5 minutos",
      recommended: true
    },
    {
      icon: <Mail className="h-8 w-8 text-primary" />,
      title: "Email",
      description: "Para questões técnicas detalhadas e documentação",
      availability: "24/7",
      responseTime: "< 4 horas",
      recommended: false
    },
    {
      icon: <Phone className="h-8 w-8 text-primary" />,
      title: "Telefone",
      description: "Suporte telefônico para clientes Enterprise",
      availability: "Seg-Sex: 8h-18h",
      responseTime: "Imediato",
      recommended: false
    }
  ];

  const faqCategories = [
    {
      title: "Integração e API",
      questions: [
        {
          question: "Como obter minha API key?",
          answer: "Acesse o painel administrativo > Configurações > API para gerar sua chave de acesso."
        },
        {
          question: "Qual é o limite de requisições?",
          answer: "O plano Básico permite 1.000 req/min, Profissional é ilimitado."
        },
        {
          question: "Como configurar webhooks?",
          answer: "Configure webhooks no painel administrativo em Integrações > Webhooks."
        }
      ]
    },
    {
      title: "Problemas Técnicos",
      questions: [
        {
          question: "A plataforma está fora do ar?",
          answer: "Verifique nosso status em status.flowtrip.com para atualizações em tempo real."
        },
        {
          question: "Como reportar um bug?",
          answer: "Use o formulário de contato selecionando 'Bug Report' como tipo de problema."
        },
        {
          question: "Problemas de performance?",
          answer: "Verifique se está usando CDN e cache. Entre em contato para otimizações."
        }
      ]
    },
    {
      title: "Conta e Faturamento",
      questions: [
        {
          question: "Como alterar meu plano?",
          answer: "Acesse Configurações > Plano e Faturamento para fazer upgrade/downgrade."
        },
        {
          question: "Posso cancelar a qualquer momento?",
          answer: "Sim, não há fidelidade. Cancele no painel ou entre em contato."
        },
        {
          question: "Como baixar faturas?",
          answer: "Todas as faturas estão disponíveis em Configurações > Faturamento."
        }
      ]
    }
  ];

  const resources = [
    {
      icon: <Book className="h-6 w-6 text-primary" />,
      title: "Base de Conhecimento",
      description: "Artigos e tutoriais completos",
      link: "/documentacao"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Status da Plataforma",
      description: "Verifique a disponibilidade dos serviços",
      link: "#"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "Comunidade",
      description: "Conecte-se com outros desenvolvedores",
      link: "#"
    }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Central de
              <span className="block text-accent">Suporte</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Estamos aqui para ajudar você a aproveitar ao máximo nossa plataforma
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <MessageCircle className="mr-2 h-4 w-4" />
                Iniciar Chat
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Mail className="mr-2 h-4 w-4" />
                Enviar Email
              </Button>
            </div>
          </div>
        </section>

        {/* Support Channels */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Canais de Atendimento
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Escolha o canal que melhor atende sua necessidade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportChannels.map((channel, index) => (
                <Card key={index} className={`border-border ${channel.recommended ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                  {channel.recommended && (
                    <div className="bg-primary text-white text-center py-2 text-sm font-medium rounded-t-lg">
                      Recomendado
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">{channel.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{channel.title}</h3>
                    <p className="text-muted-foreground mb-4">{channel.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-muted-foreground">{channel.availability}</span>
                      </div>
                      <div className="flex items-center justify-center text-sm">
                        <AlertCircle className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-muted-foreground">Resposta em {channel.responseTime}</span>
                      </div>
                    </div>
                    <Button className="w-full" variant={channel.recommended ? "default" : "outline"}>
                      {channel.title === "Chat Online" && "Iniciar Chat"}
                      {channel.title === "Email" && "Enviar Email"}
                      {channel.title === "Telefone" && "Ligar Agora"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Abrir Ticket de Suporte
              </h2>
              <p className="text-lg text-muted-foreground">
                Descreva seu problema e nossa equipe retornará rapidamente
              </p>
            </div>

            <Card className="border-border">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nome Completo
                      </label>
                      <Input placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input type="email" placeholder="seu@email.com" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tipo de Problema
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="feature">Solicitação de Feature</SelectItem>
                          <SelectItem value="integration">Problema de Integração</SelectItem>
                          <SelectItem value="billing">Questão de Faturamento</SelectItem>
                          <SelectItem value="performance">Problema de Performance</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Prioridade
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Assunto
                    </label>
                    <Input placeholder="Resumo do problema" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Descrição Detalhada
                    </label>
                    <Textarea 
                      rows={6}
                      placeholder="Descreva seu problema com o máximo de detalhes possível. Inclua passos para reproduzir, mensagens de erro, etc."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="flex-1">
                      <Headphones className="mr-2 h-4 w-4" />
                      Enviar Ticket
                    </Button>
                    <Button size="lg" variant="outline">
                      Anexar Arquivos
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Respostas rápidas para as dúvidas mais comuns
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {faqCategories.map((category, index) => (
                <div key={index}>
                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    {category.title}
                  </h3>
                  <div className="space-y-4">
                    {category.questions.map((faq, idx) => (
                      <Card key={idx} className="border-border">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-foreground mb-2 text-sm">
                            {faq.question}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Recursos Úteis
              </h2>
              <p className="text-lg text-muted-foreground">
                Ferramentas e recursos para resolver problemas rapidamente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {resources.map((resource, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">{resource.icon}</div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {resource.description}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={resource.link}>
                        Acessar
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
              Não Encontrou o que Procurava?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Nossa equipe especializada está pronta para ajudar com qualquer questão
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <MessageCircle className="mr-2 h-4 w-4" />
                Falar com Especialista
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Phone className="mr-2 h-4 w-4" />
                Agendar Ligação
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default SuporteFlowTrip;