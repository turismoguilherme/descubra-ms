import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Calendar, Users, Building, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';

const ViaJARContato = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Mensagem enviada!",
        description: "Nossa equipe entrará em contato em até 24 horas.",
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-cyan-500" />,
      title: "Email",
      description: "contato@viajar.com.br",
      value: "contato@viajar.com.br"
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-500" />,
      title: "Telefone",
      description: "+55 (11) 99999-9999",
      value: "+5511999999999"
    },
    {
      icon: <MapPin className="h-6 w-6 text-orange-500" />,
      title: "Endereço",
      description: "São Paulo, SP - Brasil",
      value: "São Paulo, SP"
    }
  ];

  const services = [
    {
      icon: <Building className="h-8 w-8 text-blue-500" />,
      title: "Consultoria Empresarial",
      description: "Análise estratégica para seu negócio de turismo"
    },
    {
      icon: <Users className="h-8 w-8 text-cyan-500" />,
      title: "Implementação",
      description: "Suporte completo na implementação da plataforma"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-orange-500" />,
      title: "Suporte Técnico",
      description: "Ajuda especializada com a plataforma ViaJAR"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-500" />,
      title: "Treinamento",
      description: "Capacitação da sua equipe para usar a plataforma"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ViaJARNavbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Fale <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Conosco</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Estamos aqui para ajudar você a transformar seu negócio de turismo. 
              Entre em contato e descubra como a ViaJAR pode acelerar seu crescimento.
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                    <p className="text-gray-600">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Envie sua Mensagem</CardTitle>
                  <CardDescription>
                    Preencha o formulário e nossa equipe entrará em contato em até 24 horas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome *
                        </label>
                        <Input 
                          type="text" 
                          placeholder="Seu nome completo"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com"
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <Input 
                          type="tel" 
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Empresa
                        </label>
                        <Input 
                          type="text" 
                          placeholder="Nome da sua empresa"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Serviço
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço de interesse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultoria">Consultoria Empresarial</SelectItem>
                          <SelectItem value="implementacao">Implementação da Plataforma</SelectItem>
                          <SelectItem value="suporte">Suporte Técnico</SelectItem>
                          <SelectItem value="treinamento">Treinamento da Equipe</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem *
                      </label>
                      <Textarea 
                        placeholder="Conte-nos sobre seu projeto e como podemos ajudar..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Services */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Como Podemos Ajudar</h3>
                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {service.icon}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h4>
                        <p className="text-gray-600">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Card className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Resposta Rápida</h4>
                    <p className="text-gray-600 mb-4">
                      Nossa equipe responde em até 24 horas durante dias úteis
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      Segunda a Sexta, 9h às 18h
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-500">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Agende uma demonstração gratuita e veja a ViaJAR em ação
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Agendar Demonstração
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Ver Preços
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <ViaJARFooter />
    </div>
  );
};

export default ViaJARContato;

