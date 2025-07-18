import React from 'react';
import UniversalLayout from '@/components/layout/UniversalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

const ContatoFlowTrip = () => {
  return (
    <UniversalLayout>
      <div className="py-20">
        <div className="ms-container">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transforme seu Estado com FlowTrip
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Agende uma demonstração personalizada e descubra como revolucionar o turismo do seu estado
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Agendar Demonstração
              </h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <Input placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <Input placeholder="Ex: Secretário de Turismo" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input type="email" placeholder="seu@email.gov.br" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <Input placeholder="(00) 0000-0000" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu estado" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Órgão
                    </label>
                    <Input placeholder="Ex: Secretaria de Turismo" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interesse Principal
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="O que mais interessa?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Plataforma Completa</SelectItem>
                      <SelectItem value="passport">Passaporte Digital</SelectItem>
                      <SelectItem value="ai">Assistente IA</SelectItem>
                      <SelectItem value="analytics">Analytics & Insights</SelectItem>
                      <SelectItem value="cats">Gestão de CATs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem (Opcional)
                  </label>
                  <Textarea 
                    placeholder="Conte-nos mais sobre suas necessidades e objetivos..."
                    rows={4}
                  />
                </div>

                <Button className="w-full bg-ms-primary-blue text-white hover:bg-ms-primary-blue/90 h-12 text-lg">
                  Agendar Demonstração
                </Button>
              </form>
            </div>

            {/* Informações de Contato */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-ms-primary-blue to-ms-discovery-teal rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Por que FlowTrip?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-ms-secondary-yellow rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">ROI Comprovado</div>
                      <div className="text-white/80">Aumento médio de 15% na visitação</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-ms-secondary-yellow rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">Implementação Rápida</div>
                      <div className="text-white/80">Estado funcionando em 30 dias</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-ms-secondary-yellow rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">Suporte Completo</div>
                      <div className="text-white/80">Treinamento e acompanhamento</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-ms-secondary-yellow rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="font-semibold">White-label</div>
                      <div className="text-white/80">Sua marca, nossa tecnologia</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Outras Formas de Contato
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-ms-primary-blue/10 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <div>
                      <div className="font-medium">Email Comercial</div>
                      <div className="text-gray-600">vendas@flowtrip.com.br</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-ms-primary-blue/10 rounded-lg flex items-center justify-center mr-4">
                      <Phone className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <div>
                      <div className="font-medium">Telefone</div>
                      <div className="text-gray-600">(67) 3000-0000</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-ms-primary-blue/10 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <div>
                      <div className="font-medium">Escritório</div>
                      <div className="text-gray-600">Campo Grande, MS</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-ms-primary-blue/10 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-5 h-5 text-ms-primary-blue" />
                    </div>
                    <div>
                      <div className="font-medium">Atendimento</div>
                      <div className="text-gray-600">Seg-Sex, 8h às 18h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};

export default ContatoFlowTrip;