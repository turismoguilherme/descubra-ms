import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, Building2, Landmark, ArrowRight, Clock } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Contato = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // IDs fixos da tabela leads (criados na migration)
      const WEBSITE_SOURCE_ID = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a"; // Website
      const STATUS_NEW_ID = "1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b"; // New
      const PRIORITY_MEDIUM_ID = "2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c"; // Medium

      // Montar notas com informações do formulário
      const notesLines: string[] = [];
      if (formData.role) {
        notesLines.push(`Tipo: ${formData.role === 'empresario' ? 'Empresário do setor turístico' : formData.role === 'secretaria' ? 'Secretaria de Turismo / Prefeitura' : 'Outro'}`);
      }
      if (formData.message) {
        notesLines.push('');
        notesLines.push('Mensagem:');
        notesLines.push(formData.message);
      }

      const notes = notesLines.join('\n');

      // Salvar na tabela leads
      const { error } = await supabase.from('leads').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        company: formData.organization || null,
        source_id: WEBSITE_SOURCE_ID,
        status_id: STATUS_NEW_ID,
        priority_id: PRIORITY_MEDIUM_ID,
        notes: notes || null,
        custom_fields: {
          origin: 'viajartur',
          role: formData.role || null,
          form_type: 'contact',
        },
      } as any);

      if (error) {
        console.error('Erro ao salvar lead:', error);
        throw error;
      }
    
    toast({
      title: "✅ Mensagem enviada!",
      description: "Entraremos em contato em até 24 horas.",
    });
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      organization: '',
      role: '',
      message: ''
    });
    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
    setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <ViaJARNavbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-viajar-slate to-slate-800 py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-viajar-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-viajar-blue/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <MessageSquare className="h-4 w-4 text-viajar-cyan" />
              <span className="text-sm text-white/90 font-medium">Fale Conosco</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl text-white/70">
              Estamos prontos para ajudar você a transformar o turismo na sua região
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Vamos Conversar
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Preencha o formulário ou entre em contato diretamente pelos nossos canais. 
                Nossa equipe está pronta para atender empresários e gestores públicos.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a href="mailto:contato@viajartur.com.br" className="text-viajar-cyan hover:underline">
                      contato@viajartur.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                    <a href="tel:+556730000000" className="text-muted-foreground hover:text-foreground">
                      (67) 3000-0000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Endereço</h3>
                    <p className="text-muted-foreground">
                      Campo Grande - MS<br />
                      Brasil
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-viajar-cyan" />
                  <h3 className="font-semibold text-foreground">Horário de Atendimento</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta</span>
                    <span className="text-foreground">8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado</span>
                    <span className="text-foreground">9h às 13h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo</span>
                    <span className="text-muted-foreground">Fechado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
              <h3 className="text-xl font-semibold text-foreground mb-6">Envie sua mensagem</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
                    Organização / Empresa
                  </label>
                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Nome da empresa ou órgão"
                    className="h-12"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
                    Você é
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-viajar-cyan focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="empresario">Empresário do setor turístico</option>
                    <option value="secretaria">Secretaria de Turismo / Prefeitura</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Mensagem *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar?"
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold text-lg gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Planos rápidos */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Soluções para Cada Necessidade
            </h2>
            <p className="text-lg text-muted-foreground">
              Escolha o plano ideal para você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-viajar-cyan/30 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Para Empresários</h3>
                  <p className="text-sm text-muted-foreground">Hotéis, pousadas, agências</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Guilherme IA, Revenue Optimizer, Market Intelligence e mais.
              </p>
              <div className="text-2xl font-bold text-foreground mb-4">R$ 199<span className="text-sm text-muted-foreground">/mês</span></div>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Landmark className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Para Secretarias</h3>
                  <p className="text-sm text-muted-foreground">Prefeituras e órgãos públicos</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Dashboard completo, Gestão de CATs, Analytics avançado.
              </p>
              <div className="text-2xl font-bold text-foreground mb-4">R$ 2.000<span className="text-sm text-muted-foreground">/mês</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-viajar-slate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prefere agendar uma demonstração?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Veja a plataforma em ação com uma demo personalizada para sua necessidade.
          </p>
          <Button size="lg" className="bg-viajar-cyan hover:bg-viajar-cyan/90 text-viajar-slate font-semibold px-8 h-14 text-lg gap-2">
            Agendar Demo
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Contato;
