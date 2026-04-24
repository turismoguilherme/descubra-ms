import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Trash2,
  Gift,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { notifyPartnerApproved, notifyPartnerRejected } from '@/services/email/notificationEmailService';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Tipo do termo mais recente associado ao parceiro
interface PartnerTerm {
  id: string;
  partner_id: string;
  pdf_url: string | null;
  uploaded_pdf_url: string | null;
  review_status: string;
  signed_at: string;
  ip_address: string | null;
  terms_version: number;
  review_notes: string | null;
}

// Pequeno botão "?" com explicação curta — substitui o tooltip nativo do navegador
const HelpHint = ({ text }: { text: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground"
        aria-label="O que esta ação faz?"
        onClick={(e) => e.stopPropagation()}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent side="top" className="w-72 text-xs">
      {text}
    </PopoverContent>
  </Popover>
);

// Texto explicativo de cada ação destrutiva/sensível
const ACTION_HELP = {
  approve: 'Marca o cadastro como aprovado. O parceiro só passa a aparecer publicamente quando a assinatura no Stripe estiver paga (ou após "Liberar acesso grátis").',
  revision: 'O parceiro continua com acesso ao painel e à assinatura ativa, mas recebe um aviso para corrigir dados ou reenviar o PDF do termo. Use quando há erro pequeno no cadastro.',
  manualWriteOff: 'CORTESIA / PROMOÇÃO: aprova o parceiro e libera o acesso completo SEM cobrar a assinatura no Stripe. Use só para parcerias estratégicas ou testes.',
  finalReject: 'Reprovação definitiva: cancela a assinatura no Stripe, tenta reembolso integral da última fatura paga e encerra o acesso. Use quando o parceiro NÃO deve ficar na plataforma.',
  delete: 'Apaga o registro do parceiro do banco de dados E remove a conta de login. Não tem como desfazer. O e-mail fica liberado para um novo cadastro futuro.',
  suspend: 'Suspende temporariamente o acesso do parceiro ao painel, sem cancelar a assinatura no Stripe. Pode ser reativado depois.',
};

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
  person_type?: string;
  cpf?: string;
  cnpj?: string;
  status: string;
  discount_offer?: string;
  gallery_images?: string[];
  youtube_url?: string;
  subscription_status?: string;
  monthly_fee?: number;
  stripe_subscription_id?: string;
  is_active?: boolean;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [terms, setTerms] = useState<Record<string, PartnerTerm>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewNotes, setReviewNotes] = useState('');
  const [updatingTerm, setUpdatingTerm] = useState(false);
  // Diálogo de confirmação para ações destrutivas
  const [confirmDialog, setConfirmDialog] = useState<null | {
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void | Promise<void>;
    destructive?: boolean;
  }>(null);
  const { toast } = useToast();

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('institutional_partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      setPartners(list);

      // Buscar o termo mais recente de cada parceiro
      const ids = list.map((p) => p.id);
      if (ids.length > 0) {
        const { data: termsData } = await supabase
          .from('partner_terms_acceptances')
          .select('id, partner_id, pdf_url, uploaded_pdf_url, review_status, signed_at, ip_address, terms_version, review_notes')
          .in('partner_id', ids)
          .order('signed_at', { ascending: false });

        const map: Record<string, PartnerTerm> = {};
        (termsData || []).forEach((t: any) => {
          // Só guarda o primeiro (mais recente) de cada parceiro
          if (!map[t.partner_id]) map[t.partner_id] = t as PartnerTerm;
        });
        setTerms(map);
      } else {
        setTerms({});
      }
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
  }, [toast]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  // Atualiza o status de revisão do termo (aprovar / pedir ajuste / rejeitar)
  const updateTermStatus = async (
    partnerId: string,
    status: 'approved' | 'rejected' | 'revision_requested',
  ) => {
    const term = terms[partnerId];
    if (!term) {
      toast({
        title: 'Sem termo enviado',
        description: 'Este parceiro ainda não enviou o termo de parceria.',
        variant: 'destructive',
      });
      return;
    }
    setUpdatingTerm(true);
    try {
      // Reprovação definitiva também cancela assinatura no Stripe
      if (status === 'rejected') {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('partner-final-reject', {
          body: { partnerId },
        });
        if (fnError) throw fnError;
        const payload = fnData as { error?: string } | undefined;
        if (payload?.error) throw new Error(payload.error);
      }

      const { error } = await supabase
        .from('partner_terms_acceptances')
        .update({
          review_status: status,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        } as any)
        .eq('id', term.id);
      if (error) throw error;

      if (status === 'revision_requested') {
        await supabase
          .from('institutional_partners')
          .update({ status: 'revision_requested', is_active: true, updated_at: new Date().toISOString() })
          .eq('id', partnerId);
      }

      toast({
        title: 'Termo atualizado',
        description:
          status === 'approved'
            ? 'Termo aprovado com sucesso.'
            : status === 'revision_requested'
              ? 'Termo devolvido para o parceiro corrigir.'
              : 'Termo rejeitado e assinatura cancelada.',
      });
      setReviewNotes('');
      await loadPartners();
    } catch (err: any) {
      console.error('Erro ao atualizar termo:', err);
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível atualizar o termo.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingTerm(false);
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

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
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
        updated_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: authUser.id,
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

  const partnerDashboardAccess = (s: string) =>
    s === 'approved' || s === 'revision_requested';

  const updatePartnerStatus = async (partnerId: string, status: string) => {
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

      if (status === 'rejected') {
        // Confirmação é feita via AlertDialog antes desta função ser chamada
        const { data: fnData, error: fnError } = await supabase.functions.invoke('partner-final-reject', {
          body: { partnerId },
        });
        if (fnError) throw fnError;
        const payload = fnData as { error?: string; success?: boolean; stripeMessage?: string | null } | undefined;
        if (payload?.error) throw new Error(payload.error);

        if (partner.contact_email) {
          notifyPartnerRejected({
            partnerEmail: partner.contact_email,
            partnerName: partner.name,
          }).catch(err => {
            console.warn('Aviso: Não foi possível enviar email de notificação (não crítico):', err);
          });
        }

        toast({
          title: 'Parceiro reprovado',
          description: payload?.stripeMessage
            ? `Processado com aviso Stripe: ${payload.stripeMessage}`
            : 'Assinatura cancelada e reembolso solicitado quando aplicável.',
        });
        await loadPartners();
        return;
      }

      console.log(`🔄 [PartnersManagement] Atualizando parceiro ${partnerId} para status: ${status}`);

      const updateData: PartnerUpdateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved' || status === 'revision_requested') {
        updateData.is_active = true;
      } else if (status === 'suspended' || status === 'pending') {
        updateData.is_active = false;
      }

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          updateData.approved_by = authUser.id;
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
        throw error;
      }

      if (!updatedPartner) {
        throw new Error('Nenhum parceiro foi atualizado. Verifique se você tem permissão.');
      }

      if (partner.contact_email && status === 'approved') {
        notifyPartnerApproved({
          partnerEmail: partner.contact_email,
          partnerName: partner.name,
        }).catch(err => {
          console.warn('Aviso: Não foi possível enviar email de notificação (não crítico):', err);
        });
      }

      const messages: Record<string, { title: string; description: string }> = {
        approved: {
          title: 'Parceiro aprovado!',
          description: 'O parceiro passa a aparecer no Descubra MS. Email de notificação enviado.',
        },
        revision_requested: {
          title: 'Devolvido para ajuste',
          description: 'O parceiro mantém acesso ao painel para corrigir documentos ou dados. A assinatura permanece ativa.',
        },
        suspended: {
          title: 'Parceiro suspenso',
          description: 'O parceiro foi temporariamente suspenso.',
        },
        pending: {
          title: 'Status atualizado',
          description: 'Cadastro marcado como pendente.',
        },
      };

      toast(messages[status] || { title: 'Status atualizado', description: '' });

      setPartners(prevPartners =>
        prevPartners.map(p =>
          p.id === partnerId
            ? { ...p, status, is_active: partnerDashboardAccess(status) }
            : p,
        ),
      );

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
    // Confirmação é feita via AlertDialog antes desta função ser chamada

    try {
      const { data, error } = await supabase.functions.invoke('delete-partner-and-auth', {
        body: { partnerId },
      });

      if (error) throw error;
      const payload = data as { error?: string; success?: boolean; authDeleted?: boolean } | undefined;
      if (payload?.error) throw new Error(payload.error);

      toast({
        title: 'Parceiro excluído',
        description: payload?.authDeleted
          ? 'Parceiro e conta de acesso removidos. O e-mail poderá ser usado em um novo cadastro.'
          : 'O parceiro foi removido permanentemente.',
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

  const pendingPartners = partners.filter(p => p.status === 'pending' || p.status === 'revision_requested');
  const approvedPartners = partners.filter(p => p.status === 'approved');
  const rejectedPartners = partners.filter(
    p => p.status === 'rejected' || p.status === 'suspended' || p.status === 'cancelled',
  );
  const overduePartners = partners.filter(p => 
    p.subscription_status === 'past_due' || 
    p.subscription_status === 'unpaid' ||
    (p.status === 'approved' && !p.is_active && p.subscription_status !== 'active' && p.subscription_status !== 'trialing')
  );

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
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant={
                    partner.subscription_status === 'past_due' ? 'destructive' :
                    partner.subscription_status === 'unpaid' ? 'destructive' :
                    partner.subscription_status === 'active' && partner.is_active ? 'default' :
                    partner.status === 'pending' || partner.status === 'revision_requested' ? 'secondary' : 
                    'destructive'
                  }
                  className={
                    partner.subscription_status === 'past_due' || 
                    partner.subscription_status === 'unpaid' 
                      ? 'animate-pulse' 
                      : ''
                  }
                >
                  {partner.subscription_status === 'past_due' ? '⚠️ Pagamento Atrasado' :
                   partner.subscription_status === 'unpaid' ? '❌ Não Pago' :
                   partner.subscription_status === 'active' && partner.is_active ? '✅ Ativo' :
                   partner.status === 'revision_requested' ? '📝 Ajuste solicitado' :
                   partner.status === 'pending' ? '⏳ Pendente' : 
                   partner.status === 'cancelled' ? '⏹️ Cancelado' :
                   '❌ Rejeitado'}
                </Badge>
                {partner.subscription_status && (
                  <span className="text-xs text-gray-500">
                    {partner.subscription_status === 'past_due' && (
                      <span className="text-orange-600 font-medium">
                        ⚠️ Assinatura em atraso
                      </span>
                    )}
                    {partner.subscription_status === 'unpaid' && (
                      <span className="text-red-600 font-medium">
                        ❌ Pagamento não realizado
                      </span>
                    )}
                    {partner.subscription_status === 'active' && (
                      <span className="text-green-600">
                        ✅ Assinatura ativa
                      </span>
                    )}
                    {partner.subscription_status === 'trialing' && (
                      <span className="text-blue-600">
                        🎁 Período de teste
                      </span>
                    )}
                  </span>
                )}
              </div>
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
              
              {(partner.status === 'pending' || partner.status === 'revision_requested') && (
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
                    variant="secondary"
                    onClick={() => updatePartnerStatus(partner.id, 'revision_requested')}
                    title="Parceiro continua com assinatura ativa e acesso ao painel para corrigir envios"
                  >
                    Devolver p/ ajuste
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
                    Reprovar (definitivo)
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

              {(partner.status === 'rejected' ||
                partner.status === 'suspended' ||
                partner.status === 'cancelled') && (
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
          title="Lista e aprovações"
          description="Aprove, suspenda ou exclua parceiros. Taxas, comissão e cancelamento estão nas outras abas desta página."
          helpText="Use as abas acima para configurar mensalidade, links Stripe e política de reembolso ao cancelar reserva."
        />
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/viajar/admin/descubra-ms/partners?tab=fees')}
          >
            Ir para taxas e links
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/viajar/admin/descubra-ms/partners?tab=cancellation')}
          >
            Ir para cancelamento
          </Button>
          <Button onClick={loadPartners} variant="outline">
            Atualizar lista
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{overduePartners.length}</div>
            <p className="text-xs text-orange-600">Pagamento em atraso</p>
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
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Inadimplentes ({overduePartners.length})
            {overduePartners.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {overduePartners.length}
              </Badge>
            )}
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

        <TabsContent value="overdue" className="space-y-4 mt-4">
          {overduePartners.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Nenhum parceiro inadimplente</p>
                <p className="text-xs text-gray-400 mt-1">
                  Todos os parceiros estão em dia com os pagamentos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Alerta informativo */}
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-orange-900">
                        Parceiros com pagamento em atraso
                      </h4>
                      <p className="text-xs text-orange-700 mt-1">
                        Estes parceiros estão bloqueados e não recebem novas reservas até regularizarem o pagamento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de parceiros inadimplentes */}
              <div className="grid gap-4">
                {overduePartners.map(partner => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </div>
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
                {(selectedPartner.status === 'pending' || selectedPartner.status === 'revision_requested') && (
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
                      variant="secondary"
                      onClick={() => {
                        updatePartnerStatus(selectedPartner.id, 'revision_requested');
                        setSelectedPartner(null);
                      }}
                    >
                      Devolver p/ ajuste
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
                      Reprovar (definitivo)
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

    </div>
  );
}

