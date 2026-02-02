import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  // Log para debug
  useEffect(() => {
    console.log('📄 [Contato] Footer settings carregados:', footerSettings);
  }, [footerSettings]);

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
    requestData: false, // Nova opção: solicitar dados
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
      // Verificar autenticação do usuário (opcional - para rastreamento)
      const { data: { user } } = await supabase.auth.getUser();

      // IDs fixos da tabela leads (criados na migration)
      const WEBSITE_SOURCE_ID = "1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a"; // Website
      const STATUS_NEW_ID = "1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b"; // New
      const PRIORITY_MEDIUM_ID = "2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c"; // Medium

      // Montar notas com informações do formulário
      const notesLines: string[] = [];
      if (formData.role) {
        notesLines.push(`Tipo: ${formData.role === 'empresario' ? 'Empresário do setor turístico' : formData.role === 'secretaria' ? 'Secretaria de Turismo / Prefeitura' : 'Outro'}`);
      }
      
      // DESTACAR se solicitou relatório de dados
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

      // Preparar dados para inserção
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

      // Salvar na tabela leads
      const { data: insertedLead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData as any)
        .select()
        .single();

      if (leadError) {
        console.error('Erro ao salvar lead:', leadError);
        throw leadError;
      }

      // Se o cliente solicitou dados, criar registro em data_sale_requests
      if (formData.requestData && insertedLead?.id) {
        const periodStart = formData.dataPeriodStart ? new Date(formData.dataPeriodStart) : new Date();
        const periodEnd = formData.dataPeriodEnd ? new Date(formData.dataPeriodEnd) : new Date();
        
        // Se não especificou período, usar últimos 3 meses
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
          // Não falhar o formulário se apenas a solicitação de dados falhar
        } else if (dataSaleRequest) {
          // Disparar notificação para admin
          try {
            const { addAdminNotification } = await import('@/components/admin/notifications/AdminNotifications');
            addAdminNotification({
              type: 'info',
              title: 'Nova Solicitação de Relatório de Dados',
              message: `${formData.name} (${formData.organization || formData.email}) solicitou relatório de dados. Ver em Leads de Contato.`,
              action: {
                label: 'Ver Solicitação',
                onClick: () => {
                  window.location.href = '/viajar/admin/financial/contact-leads';
                }
              }
            });
          } catch (notifError) {
            console.warn('Erro ao criar notificação:', notifError);
          }
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
              {getContent('viajar_contact_hero_title', 'Entre em Contato')}
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {getContent('viajar_contact_form_title', 'Vamos Conversar')}
              </h2>
              {getContent('viajar_contact_form_description', '') && (
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {getContent('viajar_contact_form_description', 'Preencha o formulário ou entre em contato diretamente pelos nossos canais. Nossa equipe está pronta para atender empresários e gestores públicos.')}
                </p>
              )}

              <div className="space-y-6 mb-10">
                {footerSettings.email && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-viajar-cyan to-viajar-blue flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <a href={`mailto:${footerSettings.email}`} className="text-viajar-cyan hover:underline">
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
                      <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                      <a href={`tel:${footerSettings.phone.replace(/\D/g, '')}`} className="text-muted-foreground hover:text-foreground">
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
                      <h3 className="font-semibold text-foreground mb-1">Endereço</h3>
                      <p className="text-muted-foreground">
                        {footerSettings.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {footerSettings.business_hours && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-viajar-cyan" />
                    <h3 className="font-semibold text-foreground">Horário de Atendimento</h3>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {footerSettings.business_hours.weekdays && (
                      <div className="flex justify-between">
                        <span>Segunda a Sexta</span>
                        <span className="text-foreground">{footerSettings.business_hours.weekdays}</span>
                      </div>
                    )}
                    {footerSettings.business_hours.saturday && (
                      <div className="flex justify-between">
                        <span>Sábado</span>
                        <span className="text-foreground">{footerSettings.business_hours.saturday}</span>
                      </div>
                    )}
                    {footerSettings.business_hours.sunday && (
                      <div className="flex justify-between">
                        <span>Domingo</span>
                        <span className="text-muted-foreground">{footerSettings.business_hours.sunday}</span>
                      </div>
                    )}
                    {!footerSettings.business_hours.weekdays && !footerSettings.business_hours.saturday && !footerSettings.business_hours.sunday && (
                      <p className="text-muted-foreground">Não informado</p>
                    )}
                  </div>
                </div>
              )}
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

                {/* Opção para solicitar dados */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="requestData"
                      name="requestData"
                      checked={formData.requestData}
                      onChange={(e) => setFormData({ ...formData, requestData: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-viajar-cyan focus:ring-viajar-cyan"
                    />
                    <div className="flex-1">
                      <label htmlFor="requestData" className="block text-sm font-medium text-foreground cursor-pointer">
                        Solicitar Relatório de Dados de Turismo
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Para <strong>secretarias de turismo</strong> e <strong>empresários do setor turístico</strong>: 
                        relatórios com dados agregados e anonimizados do Descubra MS. 
                        <Link 
                          to="/dados-turismo" 
                          className="text-viajar-cyan hover:text-viajar-cyan/80 font-medium underline underline-offset-2 hover:underline-offset-4 transition-all ml-1 inline-flex items-center gap-1"
                        >
                          Saiba mais sobre os dados disponíveis
                          <ArrowRight className="h-3 w-3 inline" />
                        </Link>
                      </p>
                    </div>
                  </div>

                  {formData.requestData && (
                    <div className="space-y-4 mt-4 pl-7">
                      <div>
                        <label htmlFor="dataReportType" className="block text-sm font-medium text-foreground mb-2">
                          Tipo de Relatório
                        </label>
                        <select
                          id="dataReportType"
                          name="dataReportType"
                          value={formData.dataReportType}
                          onChange={handleChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-viajar-cyan focus:border-transparent"
                        >
                          <option value="explanatory">Apenas Dados Tratados (Explicativo)</option>
                          <option value="raw_data">Apenas Dados Brutos</option>
                          <option value="both">Ambos (Tratados + Brutos)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dataPeriodStart" className="block text-sm font-medium text-foreground mb-2">
                            Período Inicial
                          </label>
                          <Input
                            id="dataPeriodStart"
                            name="dataPeriodStart"
                            type="date"
                            value={formData.dataPeriodStart}
                            onChange={handleChange}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label htmlFor="dataPeriodEnd" className="block text-sm font-medium text-foreground mb-2">
                            Período Final
                          </label>
                          <Input
                            id="dataPeriodEnd"
                            name="dataPeriodEnd"
                            type="date"
                            value={formData.dataPeriodEnd}
                            onChange={handleChange}
                            className="h-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="dataCity" className="block text-sm font-medium text-foreground mb-2">
                          Cidade/Região de Interesse (opcional)
                        </label>
                        <Input
                          id="dataCity"
                          name="dataCity"
                          type="text"
                          value={formData.dataCity}
                          onChange={handleChange}
                          placeholder="Ex: Campo Grande, Bonito, etc."
                          className="h-10"
                        />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs text-blue-900 dark:text-blue-200">
                          <strong>Importante:</strong> O pagamento será solicitado após a aprovação da solicitação. 
                          Os dados são reais, verificados e respeitam a LGPD (apenas dados com consentimento).
                        </p>
                      </div>
                    </div>
                  )}
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
