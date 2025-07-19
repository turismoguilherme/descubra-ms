
import React, { useState } from 'react';
import UniversalNavbar from '@/components/layout/UniversalNavbar';
import UniversalFooter from '@/components/layout/UniversalFooter';
import { Mail, Phone, MapPin, Send, Calendar, Users, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ContatoFlowTrip = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UniversalNavbar />
      
      <main className="py-20">
        <div className="ms-container">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fale Conosco
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pronto para transformar o turismo do seu estado? Nossa equipe está aqui para 
              ajudar você a dar o próximo passo rumo à digitalização.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Solicite uma Demonstração</CardTitle>
                <CardDescription>
                  Preencha o formulário e nossa equipe comercial entrará em contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                      <Input placeholder="Seu nome completo" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cargo *</label>
                      <Input placeholder="Seu cargo atual" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">E-mail *</label>
                      <Input type="email" placeholder="seu@email.gov.br" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone *</label>
                      <Input placeholder="(11) 99999-9999" required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Estado *</label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ac">Acre</SelectItem>
                          <SelectItem value="al">Alagoas</SelectItem>
                          <SelectItem value="ap">Amapá</SelectItem>
                          <SelectItem value="am">Amazonas</SelectItem>
                          <SelectItem value="ba">Bahia</SelectItem>
                          <SelectItem value="ce">Ceará</SelectItem>
                          <SelectItem value="df">Distrito Federal</SelectItem>
                          <SelectItem value="es">Espírito Santo</SelectItem>
                          <SelectItem value="go">Goiás</SelectItem>
                          <SelectItem value="ma">Maranhão</SelectItem>
                          <SelectItem value="mt">Mato Grosso</SelectItem>
                          <SelectItem value="ms">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="mg">Minas Gerais</SelectItem>
                          <SelectItem value="pa">Pará</SelectItem>
                          <SelectItem value="pb">Paraíba</SelectItem>
                          <SelectItem value="pr">Paraná</SelectItem>
                          <SelectItem value="pe">Pernambuco</SelectItem>
                          <SelectItem value="pi">Piauí</SelectItem>
                          <SelectItem value="rj">Rio de Janeiro</SelectItem>
                          <SelectItem value="rn">Rio Grande do Norte</SelectItem>
                          <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                          <SelectItem value="ro">Rondônia</SelectItem>
                          <SelectItem value="rr">Roraima</SelectItem>
                          <SelectItem value="sc">Santa Catarina</SelectItem>
                          <SelectItem value="sp">São Paulo</SelectItem>
                          <SelectItem value="se">Sergipe</SelectItem>
                          <SelectItem value="to">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Órgão/Secretaria *</label>
                      <Input placeholder="Ex: Secretaria de Turismo" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Interesse Principal</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="O que mais te interessa?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Demonstração da Plataforma</SelectItem>
                        <SelectItem value="pricing">Informações de Preço</SelectItem>
                        <SelectItem value="implementation">Implementação</SelectItem>
                        <SelectItem value="customization">Customização</SelectItem>
                        <SelectItem value="support">Suporte Técnico</SelectItem>
                        <SelectItem value="partnership">Parceria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Mensagem</label>
                    <Textarea 
                      placeholder="Conte-nos mais sobre suas necessidades e objetivos..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Benefits */}
            <div className="space-y-8">
              {/* Contact Info */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-gray-600">contato@flowtrip.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-gray-600">(11) 3000-0000</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-gray-600">São Paulo, SP - Brasil</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Benefits */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle>Por que Escolher FlowTrip?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <span>Implementação em 30 dias</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5" />
                    <span>Suporte 24/7 especializado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5" />
                    <span>Case de sucesso: Mato Grosso do Sul</span>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Demo */}
              <Card className="bg-white shadow-lg border-2 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-4">Prefere uma ligação?</h3>
                  <p className="text-gray-600 mb-6">
                    Agende uma conversa com nossa equipe comercial
                  </p>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Ligação
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
};

export default ContatoFlowTrip;
