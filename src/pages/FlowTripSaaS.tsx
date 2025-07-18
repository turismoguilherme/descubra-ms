
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BarChart3,
  Globe,
  Zap,
  Shield,
  Crown,
  MapPin,
  Calendar,
  Camera,
  ArrowRight,
  CheckCircle,
  Star,
  Building2,
  Smartphone,
  Brain,
  Database,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FlowTripLogo from '@/components/flowtrip/FlowTripLogo';

const FlowTripSaaS = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "Analytics Inteligente",
      description: "Sistema de IA que analisa dados automaticamente e gera insights sobre comportamento turístico",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Database,
      title: "Importação Automática",
      description: "Conecta-se automaticamente a fontes de dados para importar eventos, atrativos e informações turísticas",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Gestão Multi-usuário",
      description: "Painel administrativo para estados, municípios e operadores turísticos com permissões personalizadas",
      color: "from-green-500 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "ROI Mensurável",
      description: "Relatórios detalhados sobre performance dos destinos e retorno sobre investimento em turismo",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Globe,
      title: "Multi-idiomas",
      description: "Plataforma preparada para turismo internacional com suporte a múltiplos idiomas",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Segurança Empresarial",
      description: "Infraestrutura segura com backup automático e conformidade com LGPD",
      color: "from-red-500 to-red-600"
    }
  ];

  const benefits = [
    "Aumento de 40% no engajamento do turista",
    "Redução de 60% no tempo de gestão administrativa",
    "ROI mensurável através de analytics detalhados",
    "Integração automática com sistemas existentes",
    "Suporte técnico especializado 24/7",
    "Onboarding personalizado para cada destino"
  ];

  const clients = [
    {
      name: "Mato Grosso do Sul",
      logo: "/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png",
      description: "Primeiro estado a implementar destinos inteligentes no Brasil"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <FlowTripLogo size="md" />
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#funcionalidades" className="text-gray-700 hover:text-blue-600 transition-colors">Funcionalidades</a>
              <a href="#clientes" className="text-gray-700 hover:text-blue-600 transition-colors">Clientes</a>
              <a href="#contato" className="text-gray-700 hover:text-blue-600 transition-colors">Contato</a>
            </nav>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/portal')}
                className="text-gray-700 hover:text-blue-600"
              >
                Portal do Cliente
              </Button>
              <Button 
                onClick={() => navigate('/ms')}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Ver Demonstração
              </Button>
              <Button 
                onClick={() => navigate('#contato')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Solicitar Proposta
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 text-blue-600 border-blue-200 bg-blue-50 px-4 py-2">
              🚀 Plataforma SaaS para Destinos Inteligentes
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Transforme seu Destino com FlowTrip
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
              A primeira plataforma SaaS de destinos inteligentes do Brasil. Automatize a gestão turística, 
              conecte dados em tempo real e transforme visitantes em embaixadores do seu destino.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => navigate('#contato')}
              >
                <Crown className="mr-2 h-5 w-5" />
                Solicitar Demonstração
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate('/ms')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Ver Demo MS
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* O que é FlowTrip */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                O que é FlowTrip?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                FlowTrip é uma plataforma SaaS especializada em destinos inteligentes que automatiza 
                a gestão turística através de tecnologia, conectividade de dados e inteligência artificial.
              </p>
              <div className="space-y-4">
                {['Importação automática de eventos e atrativos', 
                  'Analytics e relatórios em tempo real', 
                  'Gestão hierárquica (Estado/Município/Operador)',
                  'Passaporte digital gamificado para turistas'].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">IA Integrada</h3>
                    <p className="text-sm opacity-90">Analytics inteligentes</p>
                  </div>
                  <div className="text-center">
                    <Database className="h-12 w-12 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Automação</h3>
                    <p className="text-sm opacity-90">Dados sincronizados</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Multi-tenant</h3>
                    <p className="text-sm opacity-90">Gestão hierárquica</p>
                  </div>
                  <div className="text-center">
                    <Smartphone className="h-12 w-12 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Mobile First</h3>
                    <p className="text-sm opacity-90">Experiência otimizada</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Funcionalidades que Transformam Destinos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta para criar destinos inteligentes, automatizados e mensuráveis
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
                <Card className="h-full hover:shadow-xl transition-all duration-300 group border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Por que escolher FlowTrip?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Resultados comprovados que transformam a gestão turística e a experiência do visitante.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Star className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    Parceiro do Trade Turístico
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Desenvolvido em parceria com órgãos de turismo e especialistas do setor, 
                    garantindo soluções alinhadas com as necessidades reais do mercado.
                  </p>
                  <Button 
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate('/ms')}
                  >
                    Conheça nossos cases
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Clientes */}
      <section id="clientes" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Nossos Clientes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Destinos que já transformaram sua gestão turística com FlowTrip
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clients.map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <img 
                      src={client.logo} 
                      alt={client.name}
                      className="h-16 w-auto mx-auto mb-4 object-contain"
                    />
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{client.name}</h3>
                    <p className="text-gray-600">{client.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contato" className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Pronto para transformar seu destino?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Agende uma demonstração personalizada e descubra como FlowTrip pode 
              revolucionar a gestão turística do seu estado ou município.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Demonstração
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/portal')}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Portal do Cliente
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <FlowTripLogo size="lg" className="mb-6" />
              <p className="text-gray-300 mb-4 max-w-md">
                A plataforma SaaS líder em destinos inteligentes, transformando a gestão turística 
                através de automação e inteligência artificial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de Sucesso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="/portal" className="hover:text-white transition-colors">Portal do Cliente</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FlowTrip. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlowTripSaaS;
