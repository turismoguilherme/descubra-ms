
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Camera,
  ArrowRight,
  CheckCircle,
  Star,
  Building2,
  Crown,
  MapPin,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FlowTripLogo from '@/components/flowtrip/FlowTripLogo';
import HeroSection from '@/components/flowtrip/HeroSection';
import FeaturesSection from '@/components/flowtrip/FeaturesSection';

const FlowTripSaaS = () => {
  const navigate = useNavigate();

  const benefits = [
    "Aumento comprovado de 40% no engajamento turístico",
    "Redução de 60% no tempo gasto com gestão administrativa",
    "ROI mensurável através de analytics inteligentes",
    "Integração automática com sistemas já existentes",
    "Suporte técnico especializado disponível 24/7",
    "Treinamento completo da equipe incluído no pacote"
  ];

  const testimonials = [
    {
      name: "Mato Grosso do Sul",
      logo: "/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png",
      description: "Primeiro estado brasileiro a implementar destinos inteligentes com sucesso",
      quote: "FlowTrip revolucionou nossa gestão turística. Os resultados superaram todas as expectativas."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header FlowTrip "Destinos Inteligentes" */}
      <header className="bg-flowtrip-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 flowtrip-shadow-md">
        <div className="flowtrip-container">
          <div className="flex items-center justify-between h-20">
            <FlowTripLogo size="md" />
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#funcionalidades" className="text-flowtrip-text-secondary hover:text-flowtrip-primary-blue flowtrip-transition-smooth font-medium">
                Funcionalidades
              </a>
              <a href="#resultados" className="text-flowtrip-text-secondary hover:text-flowtrip-primary-blue flowtrip-transition-smooth font-medium">
                Resultados
              </a>
              <a href="#clientes" className="text-flowtrip-text-secondary hover:text-flowtrip-primary-blue flowtrip-transition-smooth font-medium">
                Cases
              </a>
              <a href="#portal" className="text-flowtrip-text-secondary hover:text-flowtrip-primary-blue flowtrip-transition-smooth font-medium">
                Portal do Cliente
              </a>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/ms')}
                variant="outline"
                className="text-flowtrip-primary-blue border-flowtrip-primary-blue/20 hover:bg-flowtrip-primary-blue/5 font-medium px-6"
              >
                Ver Demo MS
              </Button>
              <Button 
                onClick={() => navigate('#contato')}
                className="bg-flowtrip-primary-blue hover:bg-flowtrip-primary-blue/90 text-white font-medium px-6 flowtrip-shadow-md hover:flowtrip-shadow-lg flowtrip-transition-smooth"
              >
                Falar Conosco
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Funcionalidades */}
      <section id="funcionalidades">
        <FeaturesSection />
      </section>

      {/* Seção "Por que escolher" mais visual */}
      <section id="resultados" className="py-24 bg-gradient-to-b from-blue-50/30 to-orange-50/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='7' cy='7' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="mb-6 text-orange-600 border-orange-200 bg-white/80">
                <Star className="mr-2 h-4 w-4" />
                Resultados Comprovados
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 leading-tight">
                Por que destinos escolhem
                <span className="bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                  {" "}FlowTrip?
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Não vendemos apenas software. Entregamos transformação real com resultados 
                mensuráveis que impactam toda a cadeia turística.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors group"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 leading-relaxed">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-10 bg-gradient-to-br from-white via-blue-50/50 to-teal-50/50 border-0 shadow-2xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-8 shadow-xl">
                    <Crown className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-6 text-gray-900">
                    Parceria Estratégica
                  </h3>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    Desenvolvido junto com especialistas do trade turístico brasileiro, 
                    FlowTrip entende as necessidades reais do mercado nacional.
                  </p>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
                    onClick={() => navigate('/ms')}
                  >
                    Ver caso de sucesso
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cases de Sucesso */}
      <section id="clientes" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-6 text-teal-600 border-teal-200 bg-teal-50">
              <Building2 className="mr-2 h-4 w-4" />
              Cases de Sucesso
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
              Destinos que já
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                {" "}Transformaram
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça os pioneiros que apostaram na inovação e colhem os frutos da transformação digital no turismo
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {testimonials.map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 p-10">
                  <CardContent className="text-center">
                    <img 
                      src={client.logo} 
                      alt={client.name}
                      className="h-20 w-auto mx-auto mb-8 object-contain"
                    />
                    
                    <blockquote className="text-2xl font-medium text-gray-800 mb-8 italic leading-relaxed">
                      "{client.quote}"
                    </blockquote>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{client.name}</h3>
                    <p className="text-gray-600 text-lg">{client.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final mais convidativo */}
      <section id="contato" className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='50' cy='50' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
              Vamos transformar seu
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-yellow-300 bg-clip-text text-transparent">
                destino juntos?
              </span>
            </h2>
            
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Agende uma conversa sem compromisso e descubra como FlowTrip pode 
              revolucionar a gestão turística do seu estado ou município.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-6 bg-white text-blue-700 hover:bg-gray-100 shadow-xl font-medium"
              >
                <Calendar className="mr-3 h-5 w-5" />
                Agendar Demonstração
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-6 border-white/30 text-white hover:bg-white/10 font-medium"
                onClick={() => navigate('/portal')}
              >
                <Building2 className="mr-3 h-5 w-5" />
                Portal do Cliente
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span>+55 (67) 9999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>contato@flowtrip.com.br</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span>Chat disponível 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer mais humanizado */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <FlowTripLogo size="lg" className="mb-8" />
              <p className="text-gray-300 mb-6 max-w-md leading-relaxed text-lg">
                Pioneiros em destinos inteligentes no Brasil, transformando a gestão turística 
                através da tecnologia e da paixão por criar experiências inesquecíveis.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">Li</span>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">F</span>
                </div>
                <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">IG</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Empresa</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nossa História</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Equipe</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Suporte</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="/portal" className="hover:text-white transition-colors">Portal do Cliente</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FlowTrip - Destinos Inteligentes. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FlowTripSaaS;
