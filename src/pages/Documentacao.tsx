import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, BookOpen, Download, ExternalLink, Zap, Shield, Database, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentacao = () => {
  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/destinations",
      description: "Lista todos os destinos turísticos",
      auth: "Bearer Token"
    },
    {
      method: "POST",
      endpoint: "/api/destinations",
      description: "Cria um novo destino turístico",
      auth: "Bearer Token"
    },
    {
      method: "GET",
      endpoint: "/api/events",
      description: "Lista todos os eventos",
      auth: "Bearer Token"
    },
    {
      method: "POST",
      endpoint: "/api/passport/checkin",
      description: "Registra um check-in no passaporte digital",
      auth: "Bearer Token"
    }
  ];

  const sdks = [
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      name: "JavaScript SDK",
      description: "SDK oficial para integração com aplicações web",
      version: "v1.2.0",
      download: "#"
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      name: "React Components",
      description: "Componentes React prontos para uso",
      version: "v1.1.0",
      download: "#"
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      name: "API Postman Collection",
      description: "Coleção completa para testes da API",
      version: "v1.0.0",
      download: "#"
    }
  ];

  const guides = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Início Rápido",
      description: "Configure sua primeira integração em 15 minutos",
      topics: ["Configuração inicial", "Autenticação", "Primeira requisição", "Testes"]
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Autenticação",
      description: "Entenda nosso sistema de autenticação JWT",
      topics: ["Bearer Tokens", "Refresh Tokens", "Scopes", "Rate Limiting"]
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Modelos de Dados",
      description: "Estrutura completa dos dados da plataforma",
      topics: ["Destinos", "Eventos", "Usuários", "Passaporte Digital"]
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Webhooks",
      description: "Receba notificações em tempo real",
      topics: ["Configuração", "Eventos disponíveis", "Segurança", "Retry Logic"]
    }
  ];

  const codeExample = `// Exemplo de uso da API FlowTrip
import { FlowTripAPI } from '@flowtrip/sdk';

const api = new FlowTripAPI({
  apiKey: 'sua-api-key',
  environment: 'production'
});

// Buscar destinos
const destinations = await api.destinations.list({
  state: 'MS',
  limit: 10
});

// Criar check-in no passaporte
const checkin = await api.passport.checkin({
  destinationId: 'dest-123',
  userId: 'user-456',
  coordinates: {
    lat: -20.4697,
    lng: -54.6201
  }
});`;

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white" variant="secondary">
                  API & Documentação
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Documentação
                  <span className="block text-accent">FlowTrip API</span>
                </h1>
                <p className="text-xl text-white/90 mb-8">
                  Integre facilmente nossa plataforma com sua aplicação. 
                  Documentação completa, SDKs e exemplos práticos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Começar Agora
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Download className="mr-2 h-4 w-4" />
                    Download SDK
                  </Button>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-6 backdrop-blur-sm border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Exemplo de Código
                  </Badge>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="text-sm text-white/90 overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Guias Essenciais
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para integrar com sucesso nossa plataforma
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {guides.map((guide, index) => (
                <Card key={index} className="border-border hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="mb-4 flex justify-center">{guide.icon}</div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{guide.description}</p>
                    <ul className="space-y-2">
                      {guide.topics.map((topic, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-center">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Referência da API
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Nossa API RESTful oferece endpoints completos para gestão de destinos, 
                  eventos, usuários e todo o sistema de passaporte digital.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Base URL</Badge>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      https://api.flowtrip.com/v1
                    </code>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Auth</Badge>
                    <span className="text-sm text-muted-foreground">Bearer Token JWT</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">Rate Limit</Badge>
                    <span className="text-sm text-muted-foreground">1000 req/min</span>
                  </div>
                </div>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Principais Endpoints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="border-b border-border pb-3 last:border-b-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                              className="text-xs"
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.endpoint}</code>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Ver Documentação Completa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SDKs and Tools */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                SDKs e Ferramentas
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Acelere seu desenvolvimento com nossas ferramentas oficiais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sdks.map((sdk, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {sdk.icon}
                        <div>
                          <h3 className="font-semibold text-foreground">{sdk.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {sdk.version}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{sdk.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Precisa de Ajuda?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nossa equipe técnica está pronta para ajudar com sua integração
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Tutoriais</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Guias passo a passo para cenários comuns
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/blog">Ver Tutoriais</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <Code className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Exemplos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Código pronto para diferentes linguagens
                  </p>
                  <Button variant="outline" size="sm">
                    Ver no GitHub
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <ExternalLink className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Suporte</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fale diretamente com nossa equipe técnica
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/suporte">Abrir Ticket</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Comece sua Integração Hoje
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Junte-se aos desenvolvedores que já estão construindo o futuro do turismo digital
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Code className="mr-2 h-4 w-4" />
                Começar Agora
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/contato">Falar com Especialista</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </UniversalLayout>
  );
};

export default Documentacao;