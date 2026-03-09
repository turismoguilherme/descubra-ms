// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TechBackground from '@/components/home/TechBackground';
import GlowCard from '@/components/home/GlowCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageSquare, Building2, Landmark, ArrowRight, Clock } from 'lucide-react';
import ViaJARNavbar from '@/components/layout/ViaJARNavbar';
import ViaJARFooter from '@/components/layout/ViaJARFooter';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFooterSettings } from '@/hooks/useFooterSettings';
import { platformContentService } from '@/services/admin/platformContentService';

const Contato = () => {
  const { toast } = useToast();
  const { settings: footerSettings, loading: footerLoading } = useFooterSettings('viajar');
  const [content, setContent] = useState<Record<string, string>>({});

  // Carregar conteúdo do CMS
  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_contact_');
        const contentMap: Record<string, string> = {};
        contents.forEach(item => {
          contentMap[item.content_key] = item.content_value || '';
        });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
      }
    };
    loadContent();
  }, []);

  // Garantir que a página role para o topo ao carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getContent = (key: string, fallback: string) => content[key] || fallback;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    message: '',
    requestData: false, 
    dataReportType: 'both' as 'explanatory' | 'raw_data' | 'both',
    dataPeriodStart: '',
    dataPeriodEnd: '',
    dataCity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const WEBSITE_SOURCE_ID = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a"; 
      const STATUS_NEW_ID = "1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b"; 
      const PRIORITY_MEDIUM_ID = "2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c"; 

      const notesLines: string[] = [];
      if (formData.role) {
        notesLines.push(`Tipo: ${formData.role === 'empresario' ? 'Empresário do setor turístico' : formData.role === 'secretaria' ? 'Secretaria de Turismo / Prefeitura' : 'Outro'}`);
      }
      
      if (formData.requestData) {
        notesLines.push('');
        notesLines.push('🚨 SOLICITAÇÃO DE RELATÓRIO DE DADOS 🚨');
        notesLines.push(`Tipo de Relatório: ${formData.dataReportType === 'explanatory' ? 'Apenas Tratado' : formData.dataReportType === 'raw_data' ? 'Apenas Bruto' : 'Tratado + Bruto'}`);
        if (formData.dataPeriodStart && formData.dataPeriodEnd) {
          notesLines.push(`Período: ${formData.dataPeriodStart} a ${formData.dataPeriodEnd}`);
        }
        if (formData.dataCity) {
          notesLines.push(`Cidade/Região: ${formData.dataCity}`);
        }
        notesLines.push('Ver solicitação completa em: Leads de Contato (Financeiro)');
      }
      
      if (formData.message) {
        notesLines.push('');
        notesLines.push('Mensagem:');
        notesLines.push(formData.message);
      }

      const notes = notesLines.join('\n');

      const leadData = {
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
          requestData: formData.requestData || false,
          dataReportType: formData.requestData ? formData.dataReportType : null,
          dataPeriodStart: formData.requestData ? formData.dataPeriodStart : null,
          dataPeriodEnd: formData.requestData ? formData.dataPeriodEnd : null,
          dataCity: formData.requestData ? formData.dataCity : null,
        },
        ...(user?.id ? { created_by: user.id } : {}),
      };

      const { data: insertedLead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData as any)
        .select()
        .single();

      if (leadError) {
        console.error('Erro ao salvar lead:', leadError);
        throw leadError;
      }

      if (formData.requestData && insertedLead?.id) {
        const periodStart = formData.dataPeriodStart ? new Date(formData.dataPeriodStart) : new Date();
        const periodEnd = formData.dataPeriodEnd ? new Date(formData.dataPeriodEnd) : new Date();
        
        if (!formData.dataPeriodStart || !formData.dataPeriodEnd) {
          periodEnd.setTime(Date.now());
          periodStart.setTime(Date.now());
          periodStart.setMonth(periodStart.getMonth() - 3);
        }

        const { data: dataSaleRequest, error: dataSaleError } = await supabase
          .from('data_sale_requests')
          .insert({
            lead_id: insertedLead.id,
            requester_name: formData.name,
            requester_email: formData.email,
            requester_phone: formData.phone || null,
            requester_organization: formData.organization || null,
            requester_city: formData.dataCity || null,
            report_type: formData.dataReportType,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0],
            status: 'pending',
            data_validation_status: 'pending',
            ...(user?.id ? { created_by: user.id } : {})
          })
          .select()
          .single();

        if (dataSaleError) {
          console.error('Erro ao criar solicitação de dados:', dataSaleError);
        }
      }
    
      toast({
        title: "✅ Mensagem enviada!",
        description: formData.requestData 
          ? "Sua solicitação foi recebida! Entraremos em contato em até 24 horas para aprovação e pagamento."
          : "Entraremos em contato em até 24 horas.",
      });
    
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        role: '',
        message: '',
        requestData: false,
        dataReportType: 'both',
        dataPeriodStart: '',
        dataPeriodEnd: '',
        dataCity: ''
      });
    } catch (error: unknown) {
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
    <div className="min-h-screen bg-slate-950">
      <ViaJARNavbar />
      
      {/* Hero Section with Tech Background */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        <TechBackground variant="hero" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-100 font-medium">💬 Fale Conosco</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                {getContent('viajar_contact_hero_title', 'Entre em Contato')}
              </span>
            </h1>
            {getContent('viajar_contact_hero_subtitle', '') && (
              <p className="text-xl text-white/70">
                {getContent('viajar_contact_hero_subtitle', 'Estamos prontos para ajudar você a transformar o turismo na sua região')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                {getContent('viajar_contact_form_title', 'Vamos Conversar')}
              </h2>
              {getContent('viajar_contact_form_description', '') && (
                <p className="text-white/70 mb-8 leading-relaxed">
                  {getContent('viajar_contact_form_description', 'Preencha o formulário ou entre em contato diretamente pelos nossos canais. Nossa equipe está pronta para atender empresários e gestores públicos.')}
                </p>
              )}

              <div className="space-y-6 mb-10">
                {footerSettings.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <a href={`mailto:${footerSettings.email}`} className="text-cyan-400 hover:underline">
                        {footerSettings.email}
                      </a>
                    </div>
                  </div>
                )}

                {footerSettings.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Telefone</h3>
                      <a href={`tel:${footerSettings.phone.replace(/\D/g, '')}`} className="text-white/70 hover:text-white">
                        {footerSettings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {footerSettings.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Endereço</h3>
                      <p className="text-white/70">
                        {footerSettings.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {footerSettings.business_hours && (
                <GlowCard className="p-6 bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Horário de Atendimento</h3>
                  </div>
                  <div className="space-y-2 text-sm text-white/70">
                    {footerSettings.business_hours.weekdays && (
                      <div className="flex justify-between">
                        <span>Segunda a Sexta</span>
                        <span className="text-white">{footerSettings.business_hours.weekdays}</span>
                      </div>
                    )}
                    {footerSettings.business_hours.saturday && (
                      <div className="flex justify-between">
                        <span>Sábado</span>
                        <span className="text-white">{footerSettings.business_hours.saturday}</span>
                      </div>
                    )}
                    {footerSettings.business_hours.sunday && (
                      <div className="flex justify-between">
                        <span>Domingo</span>
                        <span className="text-white/60">{footerSettings.business_hours.sunday}</span>
                      </div>
                    )}
                    {!footerSettings.business_hours.weekdays && !footerSettings.business_hours.saturday && !footerSettings.business_hours.sunday && (
                      <p className="text-white/60">Não informado</p>
                    )}
                  </div>
                </GlowCard>
              )}
            </div>

            {/* Contact Form */}
            <GlowCard className="p-8 bg-slate-800/50">
              <h3 className="text-xl font-semibold text-white mb-6">Envie sua mensagem</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
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
                    className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
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
                      className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder-white/50"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Telefone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder-white/50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-white mb-2">
                    Organização / Empresa
                  </label>
                  <Input
                    id="organization"
                    name="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Nome da empresa ou organização"
                    className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder-white/50"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
                    Você é:
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-12 px-3 bg-slate-700/50 border border-slate-600 rounded-md text-white"
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="empresario">Empresário do setor turístico</option>
                    <option value="secretaria">Secretaria de Turismo / Prefeitura</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Mensagem
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Conte-nos sobre suas necessidades..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-white/50"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1"
                >
                  {loading ? (
                    <>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </GlowCard>
          </div>
        </div>
      </section>

      <ViaJARFooter />
    </div>
  );
};

export default Contato;