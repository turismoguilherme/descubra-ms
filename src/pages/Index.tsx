
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Camera,
  Crown,
  Heart,
  Map,
  MapPin,
  Star,
  Users,
  Globe,
  Compass,
  Sun,
  Palmtree,
  Plane,
  MountainSnow,
  Fish,
  Zap,
  Gamepad2
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Descubra o Pantanal",
      subtitle: "A maior planície alagável do mundo",
      description: "Explore a biodiversidade única com onças, jacarés e mais de 650 espécies de aves.",
      image: "/lovable-uploads/1c5b8eb5-c8a3-4019-94dc-fbdbfa6ddc39.png",
      cta: "Explorar Pantanal"
    },
    {
      title: "Aventure-se na Serra da Bodoquena",
      subtitle: "Águas cristalinas e cavernas místicas",
      description: "Mergulhe em rios de águas transparentes e explore grutas milenares.",
      image: "/lovable-uploads/2d8f9a2c-4e1b-4c2d-8f7e-9c8d7e6f5a4b.png",
      cta: "Ver Roteiros"
    },
    {
      title: "Campo Grande Cultural",
      subtitle: "Portal de entrada para aventuras",
      description: "Descubra a capital sul-mato-grossense e sua rica cultura local.",
      image: "/lovable-uploads/3e9f0b3d-5f2c-5d3e-9f8f-ad9e8f7f6b5c.png",
      cta: "Conhecer Cidade"
    }
  ];

  const features = [
    {
      icon: Map,
      title: "Roteiros Personalizados",
      description: "Rotas criadas especialmente para cada tipo de viajante",
      href: "/roteiros"
    },
    {
      icon: Calendar,
      title: "Eventos Locais",
      description: "Festivais, shows e experiências culturais únicas",
      href: "/eventos"
    },
    {
      icon: Camera,
      title: "Passaporte Digital",
      description: "Colecione selos digitais dos lugares visitados",
      href: "/passaporte"
    },
    {
      icon: Gamepad2,
      title: "FlowTrip Gamificado",
      description: "Ganhe pontos, evolua níveis e desbloqueie conquistas",
      href: "/flowtrip"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se com outros viajantes e locais",
      href: "/parceiros"
    },
    {
      icon: Star,
      title: "Experiências Premium",
      description: "Vivências exclusivas com guias locais especializados",
      href: "/seja-um-parceiro"
    }
  ];

  const destinations = [
    {
      name: "Pantanal",
      description: "Safari fotográfico e pesca esportiva",
      image: "/lovable-uploads/4f0g1c4e-6g3d-6e4f-ag9g-be0f9g8g7c6d.png",
      badge: "Patrimônio Mundial",
      icon: Fish
    },
    {
      name: "Bonito",
      description: "Flutuação em rios cristalinos",
      image: "/lovable-uploads/5g1h2d5f-7h4e-7f5g-bh0h-cf1g0h9h8d7e.png",
      badge: "Ecoturismo",
      icon: Sun
    },
    {
      name: "Chapada dos Guimarães",
      description: "Trilhas e cachoeiras espetaculares",
      image: "/lovable-uploads/6h2i3e6g-8i5f-8g6h-ci1i-dg2h1i0i9e8f.png",
      badge: "Aventura",
      icon: MountainSnow
    },
    {
      name: "Costa Rica",
      description: "Praias de água doce e pesqueiros",
      image: "/lovable-uploads/7i3j4f7h-9j6g-9h7i-dj2j-eh3i2j1j0f9g.png",
      badge: "Relaxamento",
      icon: Palmtree
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section com Carousel */}
        <section className="relative h-[80vh] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center justify-center h-full text-white text-center px-4">
                <div className="max-w-4xl">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
                      {heroSlides[currentSlide].subtitle}
                    </Badge>
                  </motion.div>
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-5xl md:text-7xl font-bold mb-6"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl md:text-2xl mb-8 text-white/90"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-4"
                      onClick={() => navigate('/destinos')}
                    >
                      {heroSlides[currentSlide].cta}
                      <Compass className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10"
                      onClick={() => navigate('/flowtrip')}
                    >
                      <Gamepad2 className="mr-2 h-5 w-5" />
                      FlowTrip
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Explore de Forma Inteligente</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tecnologia e natureza se encontram para criar a experiência de turismo mais inovadora do Centro-Oeste
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => navigate(feature.href)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FlowTrip Gamification Highlight */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Gamepad2 className="h-12 w-12" />
                <h2 className="text-4xl font-bold">FlowTrip</h2>
              </div>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Transforme sua jornada turística em uma aventura gamificada. Ganhe pontos, conquiste níveis e desbloqueie experiências exclusivas enquanto explora Mato Grosso do Sul.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Sistema de Pontos</h3>
                  <p className="text-white/80 text-sm">Ganhe pontos por cada destino visitado</p>
                </div>
                <div className="text-center">
                  <Crown className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Níveis & Conquistas</h3>
                  <p className="text-white/80 text-sm">Evolua de Iniciante a Mestre</p>
                </div>
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Benefícios Exclusivos</h3>
                  <p className="text-white/80 text-sm">Desbloqueie experiências especiais</p>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/flowtrip')}
                className="text-lg px-8 py-4"
              >
                <Plane className="mr-2 h-5 w-5" />
                Começar Aventura
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Destinations Carousel */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Destinos Imperdíveis</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Cada canto de Mato Grosso do Sul oferece uma experiência única e inesquecível
              </p>
            </motion.div>

            <Carousel className="max-w-5xl mx-auto">
              <CarouselContent>
                {destinations.map((destination, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={destination.image} 
                          alt={destination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-black">
                            {destination.badge}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4 p-2 bg-white/20 rounded-full backdrop-blur-sm">
                          <destination.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
                        <p className="text-muted-foreground">{destination.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Pronto para sua próxima aventura?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Comece sua jornada hoje mesmo e descubra por que Mato Grosso do Sul é o destino perfeito para quem busca natureza, aventura e cultura autêntica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate(user ? '/flowtrip/dashboard' : '/login')}
                  className="text-lg px-8 py-4"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  {user ? 'Meu Dashboard' : 'Começar Agora'}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/destinos')}
                  className="text-lg px-8 py-4"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Ver Destinos
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
