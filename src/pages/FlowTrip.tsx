import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Map, 
  Trophy, 
  Star, 
  Zap, 
  Users, 
  Calendar,
  MapPin,
  Gift,
  Smartphone,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const FlowTrip = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Trophy,
      title: 'Sistema de Pontos',
      description: 'Ganhe pontos por cada destino visitado e atividade realizada',
      color: 'text-primary'
    },
    {
      icon: Star,
      title: 'Níveis & Conquistas',
      description: 'Evolua de Iniciante a Mestre e desbloqueie conquistas especiais',
      color: 'text-secondary'
    },
    {
      icon: MapPin,
      title: 'Passaporte Digital',
      description: 'Colecione selos únicos de cada lugar visitado',
      color: 'text-ms-discovery-teal'
    },
    {
      icon: Gift,
      title: 'Benefícios Exclusivos',
      description: 'Acesse descontos e experiências especiais por nível',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Conecte-se com outros viajantes e compartilhe experiências',
      color: 'text-green-500'
    },
    {
      icon: Smartphone,
      title: 'App Mobile',
      description: 'Acesse tudo pelo celular com recursos offline',
      color: 'text-purple-500'
    }
  ];

  const stats = [
    { label: 'Destinos', value: '150+', icon: Map },
    { label: 'Usuários Ativos', value: '2.5k+', icon: Users },
    { label: 'Pontos Distribuídos', value: '500k+', icon: Zap },
    { label: 'Eventos', value: '80+', icon: Calendar }
  ];

  const levels = [
    { name: 'Iniciante', color: 'bg-gray-500', description: '0-100 pontos' },
    { name: 'Explorador', color: 'bg-blue-500', description: '101-500 pontos' },
    { name: 'Viajante', color: 'bg-green-500', description: '501-1000 pontos' },
    { name: 'Aventureiro', color: 'bg-purple-500', description: '1001-2000 pontos' },
    { name: 'Mestre', color: 'bg-yellow-500', description: '2000+ pontos' }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-secondary to-ms-discovery-teal text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
                Plataforma de Turismo Gamificado
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Bem-vindo ao FlowTrip
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Transforme sua experiência turística em uma jornada gamificada. 
                Explore, ganhe pontos, conquiste níveis e desbloqueie experiências exclusivas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/flowtrip/dashboard')}
                    className="text-lg px-8 py-4"
                  >
                    Acessar Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      variant="secondary"
                      onClick={() => navigate('/login')}
                      className="text-lg px-8 py-4"
                    >
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/register')}
                      className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10"
                    >
                      Criar Conta
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Por que FlowTrip?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Uma nova forma de explorar destinos turísticos com gamificação, 
                recompensas e uma comunidade engajada.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Levels Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Sistema de Níveis</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Evolua como viajante e desbloqueie benefícios exclusivos em cada nível
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {levels.map((level, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-full ${level.color} flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl`}>
                        {index + 1}
                      </div>
                      <h3 className="font-semibold mb-2">{level.name}</h3>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Junte-se a milhares de viajantes que já estão explorando de forma mais inteligente e divertida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate('/flowtrip/dashboard')}
                  className="text-lg px-8 py-4"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Ver Meu Progresso
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/register')}
                    className="text-lg px-8 py-4"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Criar Conta Grátis
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10"
                  >
                    Já tenho conta
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FlowTrip;