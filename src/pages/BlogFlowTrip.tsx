import UniversalLayout from '@/components/layout/UniversalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, TrendingUp, Smartphone, Brain, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogFlowTrip = () => {
  const featuredPost = {
    title: "O Futuro do Turismo Digital: IA e Experiências Personalizadas",
    excerpt: "Como a inteligência artificial está revolucionando a forma como turistas descobrem e interagem com destinos, criando experiências únicas e memoráveis.",
    author: "Equipe FlowTrip",
    date: "15 de Janeiro, 2024",
    readTime: "8 min",
    category: "Tecnologia",
    image: "/placeholder.svg",
    featured: true
  };

  const posts = [
    {
      title: "Gamificação no Turismo: Como Engajar a Nova Geração",
      excerpt: "O passaporte digital e sistemas de pontuação estão transformando turistas em exploradores ativos, aumentando o engajamento e fidelização.",
      author: "Maria Silva",
      date: "10 de Janeiro, 2024",
      readTime: "6 min",
      category: "Estratégia",
      image: "/placeholder.svg"
    },
    {
      title: "Multi-tenant: A Arquitetura Perfeita para Estados",
      excerpt: "Entenda como nossa arquitetura multi-inquilino permite customização completa mantendo eficiência operacional e reduzindo custos.",
      author: "João Santos",
      date: "5 de Janeiro, 2024",
      readTime: "10 min",
      category: "Tecnologia",
      image: "/placeholder.svg"
    },
    {
      title: "Turismo Sustentável e Tecnologia: Uma Parceria Necessária",
      excerpt: "Como plataformas digitais podem promover práticas sustentáveis e educar turistas sobre preservação ambiental.",
      author: "Ana Costa",
      date: "28 de Dezembro, 2023",
      readTime: "7 min",
      category: "Sustentabilidade",
      image: "/placeholder.svg"
    },
    {
      title: "Analytics Turístico: Tomando Decisões Baseadas em Dados",
      excerpt: "Descubra como usar métricas e insights para otimizar estratégias turísticas e maximizar o impacto econômico regional.",
      author: "Carlos Oliveira",
      date: "20 de Dezembro, 2023",
      readTime: "9 min",
      category: "Analytics",
      image: "/placeholder.svg"
    },
    {
      title: "UX/UI para Turismo: Criando Experiências Digitais Memoráveis",
      excerpt: "Os princípios de design que tornam aplicações turísticas intuitivas, acessíveis e envolventes para todos os públicos.",
      author: "Beatriz Lima",
      date: "15 de Dezembro, 2023",
      readTime: "5 min",
      category: "Design",
      image: "/placeholder.svg"
    },
    {
      title: "Integração com Sistemas Governamentais: Desafios e Soluções",
      excerpt: "Como superar obstáculos técnicos e burocráticos na implementação de soluções de turismo digital no setor público.",
      author: "Roberto Mendes",
      date: "10 de Dezembro, 2023",
      readTime: "8 min",
      category: "Governança",
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    { name: "Todos", count: 12, active: true },
    { name: "Tecnologia", count: 4 },
    { name: "Estratégia", count: 3 },
    { name: "Analytics", count: 2 },
    { name: "Design", count: 2 },
    { name: "Sustentabilidade", count: 1 }
  ];

  const trending = [
    {
      icon: <Smartphone className="h-5 w-5 text-primary" />,
      title: "PWA: O Futuro dos Apps Turísticos",
      views: "2.3k"
    },
    {
      icon: <Brain className="h-5 w-5 text-primary" />,
      title: "Chatbots Inteligentes para Turismo",
      views: "1.8k"
    },
    {
      icon: <Globe className="h-5 w-5 text-primary" />,
      title: "SEO para Destinos Turísticos",
      views: "1.5k"
    }
  ];

  return (
    <UniversalLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary-foreground text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Blog
              <span className="block text-accent">FlowTrip</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Insights, tendências e inovações no mundo do turismo digital
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Publicamos semanalmente
            </Badge>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="default">Post em Destaque</Badge>
              <h2 className="text-3xl font-bold text-foreground">Leitura Recomendada</h2>
            </div>

            <Card className="border-border overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-video lg:aspect-square">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-8 lg:p-12">
                  <Badge className="mb-4" variant="outline">{featuredPost.category}</Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mb-6 space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {featuredPost.date}
                    </span>
                    <span>{featuredPost.readTime} de leitura</span>
                  </div>
                  <Button size="lg">
                    Ler Artigo Completo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="flex flex-wrap gap-2 mb-8">
                  {categories.map((category, index) => (
                    <Button
                      key={index}
                      variant={category.active ? "default" : "outline"}
                      size="sm"
                      className="text-sm"
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map((post, index) => (
                    <Card key={index} className="border-border overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-6">
                        <Badge className="mb-3" variant="outline">{post.category}</Badge>
                        <h3 className="text-xl font-semibold text-foreground mb-3 leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 text-sm">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mb-4 space-x-3">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {post.author}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {post.date}
                          </span>
                          <span>{post.readTime}</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Ler Mais
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <Button size="lg" variant="outline">
                    Carregar Mais Artigos
                  </Button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Newsletter */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Newsletter FlowTrip
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Receba insights semanais sobre turismo digital diretamente no seu email
                    </p>
                    <div className="space-y-3">
                      <input 
                        type="email" 
                        placeholder="Seu email"
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      />
                      <Button className="w-full" size="sm">
                        Inscrever-se
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Trending */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Em Alta
                    </h3>
                    <div className="space-y-4">
                      {trending.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">{item.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground leading-tight">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.views} visualizações
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* About */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Sobre o Blog
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Compartilhamos conhecimento sobre tecnologia, estratégias e 
                      tendências no turismo digital para ajudar gestores públicos 
                      e profissionais do setor.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/sobre-flowtrip">
                        Conheça a FlowTrip
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tem uma História para Compartilhar?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Contribua com nossa comunidade compartilhando suas experiências em turismo digital
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contato">Propor Artigo</Link>
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

export default BlogFlowTrip;