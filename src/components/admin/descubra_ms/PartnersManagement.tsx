import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  MapPin,
  Phone,
  Globe,
  Mail,
  Building2,
  Percent,
  Image as ImageIcon,
  Video,
  Settings,
  ExternalLink,
  CreditCard,
  Link2,
  Save,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyPartnerApproved, notifyPartnerRejected } from '@/services/email/notificationEmailService';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Partner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  partner_type?: string;
  person_type?: string; // PF ou PJ
  cpf?: string; // CPF se pessoa física
  cnpj?: string; // CNPJ se pessoa jurídica
  status: string;
  discount_offer?: string;
  gallery_images?: string[];
  youtube_url?: string;
  subscription_status?: string; // pending, active, trialing, past_due, canceled, unpaid
  monthly_fee?: number;
  stripe_subscription_id?: string;
  created_at: string;
}

interface PartnerUpdateData {
  status?: string;
  is_active?: boolean;
  subscription_status?: string;
  subscription_start_date?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
}

export default function PartnersManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [stripeConnectLink, setStripeConnectLink] = useState<string>('');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [commissionRate, setCommissionRate] = useState<string>('10.00');
  const [savingSettings, setSavingSettings] = useState(false);
  const { toast } = useToast();

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar parceiros:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os parceiros',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Carregar link do Stripe Connect
      const { data: connectData, error: connectError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_stripe_connect_link')
        .maybeSingle();

      if (!connectError && connectData?.setting_value) {
        setStripeConnectLink(String(connectData.setting_value || ''));
      }

      // Carregar link de pagamento
      const { data: paymentData, error: paymentError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_payment_link')
        .maybeSingle();

      if (!paymentError && paymentData?.setting_value) {
        setPaymentLink(String(paymentData.setting_value || ''));
      }

      // Carregar percentual de comissão
      const { data: commissionData, error: commissionError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'partner_commission_rate')
        .maybeSingle();

      if (!commissionError && commissionData?.setting_value) {
        const rate = typeof commissionData.setting_value === 'string' 
          ? commissionData.setting_value 
          : String(commissionData.setting_value);
        setCommissionRate(rate);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSaveSettings = async () => {
    // Validar comissão
    const commissionValue = parseFloat(commissionRate);
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast({
        title: 'Percentual inválido',
        description: 'O percentual de comissão deve ser entre 0 e 100',
        variant: 'destructive',
      });
      return;
    }

    setSavingSettings(true);
    try {
      // Salvar link do Stripe Connect
      const { error: connectError } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'partner_stripe_connect_link',
          setting_value: stripeConnectLink,
          description: 'Link do Stripe Connect para parceiros conectarem e receberem pagamentos',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'platform,setting_key',
        });

      if (connectError) throw connectError;

      // Salvar link de pagamento
      const { error: paymentError } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'partner_payment_link',
          setting_value: paymentLink,
          description: 'Link de pagamento mensal para parceiros (Stripe Payment Link)',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'platform,setting_key',
        });

      if (paymentError) throw paymentError;

      // Salvar percentual de comissão
      const { error: commissionError } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'partner_commission_rate',
          setting_value: commissionRate,
          description: 'Percentual de comissão sobre reservas de parceiros (0-100)',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'platform,setting_key',
        });

      if (commissionError) throw commissionError;

      toast({
        title: 'Configurações salvas!',
        description: `Links e comissão (${parseFloat(commissionRate).toFixed(2)}%) foram atualizados com sucesso.`,
      });
      setShowSettingsModal(false);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar configurações:', err);
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleManualPaymentWriteOff = async (partnerId: string) => {
    try {
      const partner = partners.find(p => p.id === partnerId);
      if (!partner) {
        toast({
          title: 'Erro',
          description: 'Parceiro não encontrado',
          variant: 'destructive',
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Usuário não identificado',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar parceiro: aprovar + ativar assinatura manualmente
      const updateData: PartnerUpdateData = {
        status: 'approved',
        is_active: true,
        subscription_status: 'active', // Ativar assinatura sem pagamento
        subscription_start_date: new Date().toISOString(),
        // Criar uma data de fim (opcional, pode ser null para assinatura permanente)
        updated_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      };

      const { data: updatedPartner, error } = await supabase
        .from('institutional_partners')
        .update(updateData)
        .eq('id', partnerId)
        .select()
        .single();

      if (error) {
        console.error('❌ [PartnersManagement] Erro ao dar baixa manual:', error);
        throw error;
      }

      if (!updatedPartner) {
        throw new Error('Nenhum parceiro foi atualizado. Verifique se você tem permissão.');
      }

      console.log('✅ [PartnersManagement] Baixa manual realizada com sucesso:', updatedPartner);

      // Enviar email de notificação
      if (partner?.contact_email) {
        notifyPartnerApproved({
          partnerEmail: partner.contact_email,
          partnerName: partner.name,
        }).catch(err => {
          console.warn('Aviso: Não foi possível enviar email de notificação (não crítico):', err);
        });
      }

      toast({
        title: '✅ Baixa manual realizada!',
        description: `Parceiro ${partner.name} teve acesso liberado sem pagamento. Assinatura ativada manualmente.`,
      });

      // Atualizar lista
      loadPartners();
      setSelectedPartner(null);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao dar baixa manual:', err);
      toast({
        title: 'Erro ao dar baixa manual',
        description: err.message || 'Não foi possível liberar acesso. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: string) => {
    try {
      // Buscar dados do parceiro para o email
      const partner = partners.find(p => p.id === partnerId);

      if (!partner) {
        toast({
          title: 'Erro',
          description: 'Parceiro não encontrado',
          variant: 'destructive',
        });
        return;
      }

      console.log(`🔄 [PartnersManagement] Atualizando parceiro ${partnerId} para status: ${status}`);
      
      const updateData: PartnerUpdateData = {
        status,
        is_active: status === 'approved',
        updated_at: new Date().toISOString(),
      };

      // Se estiver aprovando, adicionar timestamp de aprovação
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        // Buscar usuário atual para registrar quem aprovou
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          updateData.approved_by = user.id;
        }
      }

      const { data: updatedPartner, error } = await supabase
        .from('institutional_partners')
        .update(updateData)
        .eq('id', partnerId)
        .select()
        .single();

      if (error) {
        console.error('❌ [PartnersManagement] Erro ao atualizar parceiro:', error);
        console.error('❌ [PartnersManagement] Detalhes:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!updatedPartner) {
        throw new Error('Nenhum parceiro foi atualizado. Verifique se você tem permissão.');
      }

      console.log('✅ [PartnersManagement] Parceiro atualizado com sucesso:', updatedPartner);

      // Enviar email de notificação (não bloqueia a ação se falhar)
      if (partner?.contact_email) {
        if (status === 'approved') {
          notifyPartnerApproved({
            partnerEmail: partner.contact_email,
            partnerName: partner.name,
          }).catch(err => {
            console.warn('Aviso: Não foi possível enviar email de notificação (não crítico):', err);
          });
        } else if (status === 'rejected') {
          notifyPartnerRejected({
            partnerEmail: partner.contact_email,
            partnerName: partner.name,
          }).catch(err => {
            console.warn('Aviso: Não foi possível enviar email de notificação (não crítico):', err);
          });
        }
      }

      const messages: Record<string, { title: string; description: string }> = {
        approved: {
          title: 'Parceiro aprovado!',
          description: 'O parceiro agora está visível na plataforma. Email de notificação enviado.',
        },
        rejected: {
          title: 'Parceiro rejeitado',
          description: 'A solicitação foi rejeitada. Email de notificação enviado.',
        },
        suspended: {
          title: 'Parceiro suspenso',
          description: 'O parceiro foi temporariamente suspenso.',
        },
      };

      toast(messages[status] || { title: 'Status atualizado', description: '' });
      
      // Atualizar estado local imediatamente para feedback visual instantâneo
      setPartners(prevPartners => 
        prevPartners.map(p => 
          p.id === partnerId 
            ? { ...p, status, is_active: status === 'approved' }
            : p
        )
      );
      
      // Recarregar lista completa do banco para garantir sincronização
      await loadPartners();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const deletePartner = async (partnerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;

    try {
      const { error } = await supabase
        .from('institutional_partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: 'Parceiro excluído',
        description: 'O parceiro foi removido permanentemente.',
      });
      loadPartners();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const pendingPartners = partners.filter(p => p.status === 'pending');
  const approvedPartners = partners.filter(p => p.status === 'approved');
  const rejectedPartners = partners.filter(p => p.status === 'rejected' || p.status === 'suspended');

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {partner.logo_url ? (
            <img 
              src={partner.logo_url} 
              alt={partner.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                {partner.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    {partner.address}
                  </div>
                )}
                {partner.partner_type && (
                  <Badge variant="outline" className="mt-1">
                    {partner.partner_type}
                  </Badge>
                )}
              </div>
              <Badge 
                variant={
                  partner.status === 'approved' ? 'default' : 
                  partner.status === 'pending' ? 'secondary' : 
                  'destructive'
                }
              >
                {partner.status === 'approved' ? 'Ativo' : 
                 partner.status === 'pending' ? 'Pendente' : 
                 'Rejeitado'}
              </Badge>
            </div>

            {partner.discount_offer && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <Percent className="w-4 h-4" />
                {partner.discount_offer}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPartner(partner)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver Detalhes
              </Button>
              
              {partner.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updatePartnerStatus(partner.id, 'approved')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => handleManualPaymentWriteOff(partner.id)}
                    title="Dar baixa manual - Libera acesso sem pagamento (para promoções)"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Baixa Manual
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                </>
              )}

              {partner.status === 'approved' && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updatePartnerStatus(partner.id, 'suspended')}
                >
                  Suspender
                </Button>
              )}

              {(partner.status === 'rejected' || partner.status === 'suspended') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updatePartnerStatus(partner.id, 'approved')}
                >
                  Reativar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Parceiros"
          description="Gerencie estabelecimentos parceiros que oferecem serviços turísticos na plataforma."
          helpText="Gerencie estabelecimentos parceiros que oferecem serviços turísticos na plataforma."
        />
        <div className="flex gap-2">
          <Button onClick={() => setShowSettingsModal(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button onClick={loadPartners} variant="outline">
            Atualizar Lista
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{pendingPartners.length}</div>
            <p className="text-xs text-yellow-600">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{approvedPartners.length}</div>
            <p className="text-xs text-green-600">Parceiros aprovados</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{rejectedPartners.length}</div>
            <p className="text-xs text-red-600">Rejeitados ou suspensos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de parceiros */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingPartners.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <Check className="w-4 h-4" />
            Ativos ({approvedPartners.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <X className="w-4 h-4" />
            Inativos ({rejectedPartners.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : pendingPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum parceiro pendente de aprovação
            </div>
          ) : (
            pendingPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approvedPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum parceiro ativo
            </div>
          ) : (
            approvedPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedPartners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum parceiro inativo
            </div>
          ) : (
            rejectedPartners.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPartner?.name}</DialogTitle>
            <DialogDescription>Detalhes completos do parceiro</DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="space-y-4">
              {selectedPartner.logo_url && (
                <img 
                  src={selectedPartner.logo_url} 
                  alt={selectedPartner.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {selectedPartner.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-700 mt-1">{selectedPartner.description}</p>
                </div>
              )}

              {/* Informações de Identificação */}
              <div className="grid grid-cols-2 gap-4">
                {selectedPartner.partner_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Parceiro</label>
                    <p className="text-gray-700 mt-1 capitalize">{selectedPartner.partner_type}</p>
                  </div>
                )}
                {selectedPartner.person_type && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Pessoa</label>
                    <p className="text-gray-700 mt-1">
                      {selectedPartner.person_type === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </p>
                  </div>
                )}
                {selectedPartner.cpf && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p className="text-gray-700 mt-1 font-mono">{selectedPartner.cpf}</p>
                  </div>
                )}
                {selectedPartner.cnpj && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNPJ</label>
                    <p className="text-gray-700 mt-1 font-mono">{selectedPartner.cnpj}</p>
                  </div>
                )}
              </div>

              {selectedPartner.discount_offer && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Oferta de Desconto
                  </label>
                  <p className="text-green-700 mt-1 font-medium">{selectedPartner.discount_offer}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPartner.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Endereço</label>
                      <p className="text-gray-700">{selectedPartner.address}</p>
                    </div>
                  </div>
                )}
                {selectedPartner.contact_phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-700">{selectedPartner.contact_phone}</p>
                    </div>
                  </div>
                )}
                {selectedPartner.contact_email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-700">{selectedPartner.contact_email}</p>
                    </div>
                  </div>
                )}
                {selectedPartner.website_url && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <a 
                        href={selectedPartner.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block"
                      >
                        {selectedPartner.website_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {selectedPartner.youtube_url && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4" />
                    Vídeo Promocional
                  </label>
                  <a 
                    href={selectedPartner.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver no YouTube
                  </a>
                </div>
              )}

              {selectedPartner.gallery_images && selectedPartner.gallery_images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Galeria de Fotos
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedPartner.gallery_images.map((img, idx) => (
                      <img 
                        key={idx}
                        src={img} 
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t flex-wrap">
                {selectedPartner.status === 'pending' && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, 'approved');
                        setSelectedPartner(null);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar Parceiro
                    </Button>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        handleManualPaymentWriteOff(selectedPartner.id);
                      }}
                      title="Dar baixa manual - Libera acesso sem pagamento (para promoções)"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Dar Baixa Manual (Promoção)
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, 'rejected');
                        setSelectedPartner(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar
                    </Button>
                  </>
                )}
                {(selectedPartner.subscription_status === 'pending' || selectedPartner.subscription_status === 'unpaid') && selectedPartner.status === 'approved' && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      handleManualPaymentWriteOff(selectedPartner.id);
                    }}
                    title="Dar baixa manual - Libera acesso sem pagamento (para promoções)"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Dar Baixa Manual (Promoção)
                  </Button>
                )}
                {selectedPartner.status === 'approved' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      updatePartnerStatus(selectedPartner.id, 'suspended');
                      setSelectedPartner(null);
                    }}
                  >
                    Suspender Parceiro
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    deletePartner(selectedPartner.id);
                    setSelectedPartner(null);
                  }}
                >
                  Excluir Permanentemente
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações de Parceiros
            </DialogTitle>
            <DialogDescription>
              Configure os links do Stripe Connect e de pagamento mensal para parceiros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="stripe_connect_link" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link do Stripe Connect
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="stripe_connect_link"
                  type="url"
                  value={stripeConnectLink}
                  onChange={(e) => setStripeConnectLink(e.target.value)}
                  placeholder="https://connect.stripe.com/..."
                  className="flex-1"
                />
                {stripeConnectLink && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(stripeConnectLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Link para parceiros conectarem sua conta Stripe e receberem pagamentos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_link" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Link de Pagamento Mensal
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="payment_link"
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  placeholder="https://buy.stripe.com/..."
                  className="flex-1"
                />
                {paymentLink && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(paymentLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Link de pagamento mensal criado no Stripe Dashboard (Payment Link)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate" className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Percentual de Comissão sobre Reservas (%)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="10.00"
                  className="flex-1"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500">
                Percentual de comissão calculado automaticamente sobre cada reserva paga. Você pode alterar este valor a qualquer momento.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
                disabled={savingSettings}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
              >
                {savingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

