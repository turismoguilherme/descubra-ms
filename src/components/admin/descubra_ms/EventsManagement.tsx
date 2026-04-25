// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Calendar,
  Check,
  X,
  Eye,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  Globe,
  Mail,
  Building2,
  Loader2,
  Video,
  Image as ImageIcon,
  User,
  ExternalLink,
  Edit,
  CreditCard,
  Copy,
  ChevronDown,
  ChevronUp,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Save,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyEventApproved, notifyEventRejected } from '@/services/email/notificationEmailService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EventPaymentConfig from '@/components/admin/EventPaymentConfig';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { optimizeModalImage, optimizeThumbnail } from '@/utils/imageOptimization';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

interface Event {
  id: string;
  name: string;
  description: string;
  category?: string; // Adicionar categoria
  location: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  logo_evento?: string; // Adicionar logo_evento
  site_oficial?: string;
  video_url?: string;
  is_visible: boolean;
  is_sponsored: boolean;
  sponsor_tier?: string;
  sponsor_payment_status?: string;
  sponsor_amount?: number;
  organizador_nome?: string;
  organizador_email?: string;
  organizador_telefone?: string;
  organizador_empresa?: string;
  approval_status?: string; // pending, approved, rejected
  stripe_payment_link_url?: string | null;
  created_at: string;
  rejection_reason?: string | null;
  moderation_decision_source?: string | null;
  moderated_at?: string | null;
  refund_status?: string | null;
  stripe_refund_id?: string | null;
  refund_amount?: number | null;
  refunded_at?: string | null;
  refund_error_message?: string | null;
}

/** Mapeia linha do Supabase (PT) para o modelo usado na UI */
function normalizeEventFromDb(row: Record<string, unknown>): Event {
  const r = row as Record<string, unknown>;
  return {
    id: r.id as string,
    name: String((r.titulo ?? r.name) || ''),
    description: String((r.descricao ?? r.description) || ''),
    location: String((r.local ?? r.location) || ''),
    start_date: String((r.data_inicio ?? r.start_date) || ''),
    end_date: String((r.data_fim ?? r.end_date) || ''),
    start_time: (r.start_time as string) || undefined,
    end_time: (r.end_time as string) || undefined,
    image_url: (r.imagem_principal ?? r.image_url) as string | undefined,
    logo_evento: (r.logo_evento as string) || undefined,
    site_oficial: (r.site_oficial as string) || undefined,
    video_url: (r.video_promocional ?? r.video_url) as string | undefined,
    is_visible: Boolean(r.is_visible),
    is_sponsored: Boolean(r.is_sponsored),
    sponsor_tier: r.sponsor_tier as string | undefined,
    sponsor_payment_status: r.sponsor_payment_status as string | undefined,
    sponsor_amount: r.sponsor_amount as number | undefined,
    organizador_nome: (r.organizador_nome ?? r.organizador) as string | undefined,
    organizador_email: r.organizador_email as string | undefined,
    organizador_telefone: r.organizador_telefone as string | undefined,
    organizador_empresa: r.organizador_empresa as string | undefined,
    category: (r.categoria ?? r.category) as string | undefined,
    approval_status: (r.approval_status as string) || undefined,
    stripe_payment_link_url: (r.stripe_payment_link_url as string) || null,
    created_at: String(r.created_at || ''),
    rejection_reason: (r.rejection_reason as string) || null,
    moderation_decision_source: (r.moderation_decision_source as string) || null,
    moderated_at: (r.moderated_at as string) || null,
    refund_status: (r.refund_status as string) || null,
    stripe_refund_id: (r.stripe_refund_id as string) || null,
    refund_amount: (r.refund_amount as number) || null,
    refunded_at: (r.refunded_at as string) || null,
    refund_error_message: (r.refund_error_message as string) || null,
  };
}

function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return '';
  // If already in yyyy-MM-ddTHH:mm format, keep as-is to prevent cursor jumps while editing.
  if (value.includes('T')) return value.slice(0, 16);
  // If only date is available, default to midnight to keep input editable.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [approvingEventId, setApprovingEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentConfigExpanded, setPaymentConfigExpanded] = useState(false);
  const [defaultPaymentLink, setDefaultPaymentLink] = useState<string>('');
  const [loadingPaymentLink, setLoadingPaymentLink] = useState(false);
  const [savingPaymentLink, setSavingPaymentLink] = useState(false);
  const [sponsorPrice, setSponsorPrice] = useState<string>('499.90');
  const [loadingSponsorPrice, setLoadingSponsorPrice] = useState(false);
  const [savingSponsorPrice, setSavingSponsorPrice] = useState(false);
  const [agentConfigId, setAgentConfigId] = useState<string | null>(null);
  const [agentActive, setAgentActive] = useState(false);
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false);
  const [loadingAutoApproval, setLoadingAutoApproval] = useState(false);
  const [savingAutoApproval, setSavingAutoApproval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const getMissingColumnFromError = (error: unknown): string | null => {
    const message = (error as { message?: string })?.message || '';
    const match = message.match(/Could not find the '([^']+)' column/i);
    return match?.[1] || null;
  };

  const updateEventWithFallback = async (
    eventId: string,
    initialData: Record<string, unknown>
  ) => {
    let payload = { ...initialData };
    let lastError: unknown = null;

    // Remove dinamicamente colunas ausentes no schema e tenta novamente.
    for (let attempt = 0; attempt < 8; attempt++) {
      const result = await supabase
        .from('events')
        .update(payload)
        .eq('id', eventId)
        .select('*');

      if (!result.error) return result;

      lastError = result.error;
      const missingColumn = getMissingColumnFromError(result.error);
      if (!missingColumn || !(missingColumn in payload)) {
        throw result.error;
      }

      console.warn(`⚠️ Campo ausente no schema, removendo do update: ${missingColumn}`);
      delete payload[missingColumn];
    }

    throw lastError || new Error('Falha ao atualizar evento após tentativas de compatibilidade');
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents((data || []).map((row) => normalizeEventFromDb(row as Record<string, unknown>)));
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar eventos:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultPaymentLink = async () => {
    setLoadingPaymentLink(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'event_sponsorship_payment_link')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar link padrão:', error);
        return;
      }

      if (data?.setting_value) {
        const linkValue = typeof data.setting_value === 'string' 
          ? data.setting_value 
          : (data.setting_value as { url?: string } | string)?.url || (typeof data.setting_value === 'string' ? data.setting_value : String(data.setting_value));
        setDefaultPaymentLink(linkValue || '');
      }
    } catch (error) {
      console.error('Erro ao buscar link padrão:', error);
    } finally {
      setLoadingPaymentLink(false);
    }
  };

  const handleSavePaymentLink = async () => {
    setSavingPaymentLink(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'event_sponsorship_payment_link',
          setting_value: defaultPaymentLink.trim() || null,
          description: 'Link padrão de pagamento do Stripe para eventos em destaque',
        }, {
          onConflict: 'platform,setting_key'
        });

      if (error) throw error;

      toast({
        title: 'Link salvo',
        description: 'Link padrão de pagamento configurado com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar link padrão:', err);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o link padrão',
        variant: 'destructive',
      });
    } finally {
      setSavingPaymentLink(false);
    }
  };

  const validatePaymentLink = (link: string): boolean => {
    if (!link.trim()) return true; // Vazio é válido (remove link)
    const regex = /^https:\/\/(buy|checkout)\.stripe\.com\/(test_|)[a-zA-Z0-9]+$/;
    return regex.test(link.trim());
  };

  // Buscar preço configurável
  const fetchSponsorPrice = async () => {
    
    setLoadingSponsorPrice(true);
    try {
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('platform', 'ms')
        .eq('setting_key', 'event_sponsor_price')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar preço:', error);
        
        return;
      }

      if (data?.setting_value) {
        
        setSponsorPrice(data.setting_value);
      }
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
      
    } finally {
      setLoadingSponsorPrice(false);
      
    }
  };

  const fetchAutoApprovalSettings = async () => {
    setLoadingAutoApproval(true);
    try {
      const { data, error } = await supabase
        .from('ai_agent_config')
        .select('id, active, tasks')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setAgentConfigId(null);
        setAgentActive(false);
        setAutoApprovalEnabled(false);
        return;
      }

      setAgentConfigId(data.id);
      setAgentActive(Boolean(data.active));

      const tasks = Array.isArray(data.tasks) ? data.tasks : [];
      const autoApprovalTask = tasks.find(
        (task: any) =>
          task?.name === 'Aprovação Automática de Eventos' ||
          (task?.type === 'notification' && String(task?.name || '').toLowerCase().includes('aprovação automática'))
      );

      setAutoApprovalEnabled(Boolean(autoApprovalTask?.enabled));
    } catch (error) {
      console.error('Erro ao buscar configuração de autoaprovação:', error);
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar a configuração de autoaprovação agora.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAutoApproval(false);
    }
  };

  const handleToggleAutoApproval = async (enabled: boolean) => {
    setSavingAutoApproval(true);
    try {
      if (!agentConfigId) {
        const newTasks = [
          {
            id: '5',
            type: 'notification',
            name: 'Aprovação Automática de Eventos',
            schedule: 'A cada hora',
            enabled,
          },
        ];

        const { data, error } = await supabase
          .from('ai_agent_config')
          .insert({
            active: enabled, // Se ativar autoaprovação, ativa o agente automaticamente.
            autonomy_level: 50,
            tasks: newTasks,
            permissions: {},
          })
          .select('id, active')
          .single();

        if (error) throw error;

        setAgentConfigId(data.id);
        setAgentActive(Boolean(data.active));
      } else {
        const { data: currentConfig, error: loadError } = await supabase
          .from('ai_agent_config')
          .select('active, tasks')
          .eq('id', agentConfigId)
          .single();

        if (loadError) throw loadError;

        const tasks = Array.isArray(currentConfig.tasks) ? [...currentConfig.tasks] : [];
        const taskIndex = tasks.findIndex(
          (task: any) =>
            task?.name === 'Aprovação Automática de Eventos' ||
            (task?.type === 'notification' && String(task?.name || '').toLowerCase().includes('aprovação automática'))
        );

        if (taskIndex >= 0) {
          tasks[taskIndex] = { ...tasks[taskIndex], enabled };
        } else {
          tasks.push({
            id: '5',
            type: 'notification',
            name: 'Aprovação Automática de Eventos',
            schedule: 'A cada hora',
            enabled,
          });
        }

        const nextActive = enabled ? true : Boolean(currentConfig.active);

        const { error: updateError } = await supabase
          .from('ai_agent_config')
          .update({
            active: nextActive,
            tasks,
          })
          .eq('id', agentConfigId);

        if (updateError) throw updateError;

        setAgentActive(nextActive);
      }

      setAutoApprovalEnabled(enabled);
      toast({
        title: enabled ? 'Autoaprovação ativada' : 'Autoaprovação desativada',
        description: enabled
          ? 'Novos eventos pendentes poderão ser analisados automaticamente.'
          : 'Os eventos voltarão a depender de aprovação manual no painel.',
      });
    } catch (error) {
      console.error('Erro ao salvar configuração de autoaprovação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a configuração de autoaprovação.',
        variant: 'destructive',
      });
    } finally {
      setSavingAutoApproval(false);
    }
  };

  // Salvar preço configurável
  const handleSaveSponsorPrice = async () => {
    const priceValue = parseFloat(sponsorPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: 'Erro',
        description: 'Preço inválido. Use um número maior que zero (ex: 499.90)',
        variant: 'destructive',
      });
      return;
    }

    setSavingSponsorPrice(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          platform: 'ms',
          setting_key: 'event_sponsor_price',
          setting_value: sponsorPrice.trim(),
          description: 'Preço exibido para eventos em destaque (em reais, formato: 499.90)',
        }, {
          onConflict: 'platform,setting_key'
        });

      if (error) throw error;

      toast({
        title: 'Preço salvo',
        description: 'Preço de eventos em destaque configurado com sucesso',
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao salvar preço:', err);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o preço',
        variant: 'destructive',
      });
    } finally {
      setSavingSponsorPrice(false);
    }
  };

  useEffect(() => {
    
    loadEvents();
    fetchDefaultPaymentLink();
    fetchSponsorPrice();
    fetchAutoApprovalSettings();
    
  }, []);

  const approveEvent = async (eventId: string) => {
    // Evitar múltiplas aprovações simultâneas
    if (approvingEventId === eventId) return;
    
    setApprovingEventId(eventId);
    
    try {
      // Buscar dados do evento para o email
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        toast({
          title: 'Erro',
          description: 'Evento não encontrado',
          variant: 'destructive',
        });
        setApprovingEventId(null);
        return;
      }

      console.log('Aprovando evento:', eventId, event.name);

      // Buscar dados mais recentes do banco para verificar status de pagamento
      const { data: currentEventData, error: fetchError } = await supabase
        .from('events')
        .select('sponsor_payment_status, is_sponsored, is_visible, approval_status')
        .eq('id', eventId)
        .single();

      if (fetchError) {
        console.warn('Erro ao buscar dados atualizados do evento:', fetchError);
      }

      // Verificar se o evento foi pago para marcar como patrocinado
      // Usar dados do banco se disponíveis, senão usar dados do estado local
      const paymentStatus = currentEventData?.sponsor_payment_status || event.sponsor_payment_status;
      const isPaid = paymentStatus === 'paid';
      
      // Atualizar evento: tornar visível e marcar como aprovado
      const nowIso = new Date().toISOString();
      const updateData: Record<string, unknown> = {
        is_visible: true,
        approval_status: 'approved',
        updated_at: nowIso,
        rejection_reason: null,
        moderation_decision_source: 'admin',
        moderated_at: nowIso,
        approved_at: nowIso,
      };

      // Se o evento foi pago, marcar como patrocinado
      if (isPaid) {
        updateData.is_sponsored = true;
        updateData.sponsor_tier = 'destaque';
        // Garantir que as datas de patrocínio estão definidas
        if (!event.sponsor_start_date) {
          updateData.sponsor_start_date = new Date().toISOString().split('T')[0];
        }
        if (!event.sponsor_end_date) {
          updateData.sponsor_end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
      }

      // Não adicionar approved_by ou approved_at pois podem não existir na tabela
      console.log('Dados para atualização:', updateData);

      // Atualizar evento com todos os campos de uma vez
      const result = await updateEventWithFallback(eventId, updateData);
      const updatedEvent = result.data;

      if (!updatedEvent || updatedEvent.length === 0) {
        throw new Error('Nenhum evento foi atualizado. Verifique se você tem permissão para atualizar este evento.');
      }

      console.log('✅ Evento atualizado com sucesso:', updatedEvent);

      // Atualizar estado local imediatamente para feedback visual instantâneo
      setEvents(prevEvents =>
        prevEvents.map((e) =>
          e.id === eventId
            ? {
                ...e,
                is_visible: true,
                approval_status: 'approved',
                rejection_reason: null,
                moderation_decision_source: 'admin',
                moderated_at: nowIso,
              }
            : e
        )
      );

      // MOSTRAR TOAST DE SUCESSO IMEDIATAMENTE (antes do email)
      toast({
        title: '✅ Evento aprovado com sucesso!',
        description: `O evento "${event.name}" agora está visível na plataforma.`,
        duration: 5000,
      });

      // Traduzir evento automaticamente após aprovação
      try {
        if (updatedEvent && updatedEvent[0]) {
          const { autoTranslateEvent } = await import('@/utils/autoTranslation');
          // Traduzir em background (não bloquear UI)
          autoTranslateEvent({
            id: updatedEvent[0].id,
            name: updatedEvent[0].name || event.name || '',
            description: updatedEvent[0].description || null,
            location: updatedEvent[0].location || null,
            category: updatedEvent[0].category || null,
          });
        }
      } catch (translationError) {
        console.error('Erro ao traduzir evento (não crítico):', translationError);
        // Não bloquear aprovação se tradução falhar
      }

      // Recarregar eventos para atualizar a lista (fazer antes do email)
      await loadEvents();

      // Enviar email de notificação em background (não bloqueia)
      if (event?.organizador_email) {
        notifyEventApproved({
          organizerEmail: event.organizador_email,
          organizerName: event.organizador_nome,
          eventName: event.name,
          eventDate: formatDate(event.start_date),
          eventLocation: event.location,
        })
        .then(result => {
          if (result.success) {
            console.log('✅ Email de notificação enviado com sucesso');
          } else {
            console.warn('⚠️ Email não foi enviado (não crítico):', result.error);
          }
        })
        .catch(err => {
          console.warn('⚠️ Erro ao enviar email (não crítico):', err);
        });
      }
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao aprovar evento:', err);
      toast({
        title: '❌ Erro ao aprovar evento',
        description: error.message || 'Não foi possível aprovar o evento. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setApprovingEventId(null);
    }
  };

  const rejectEvent = async (eventId: string, reason?: string) => {
    // Evitar múltiplas rejeições simultâneas
    if (approvingEventId === eventId) return;
    
    setApprovingEventId(eventId);
    
    try {
      // Buscar dados do evento para o email
      const event = events.find(e => e.id === eventId);
      
      if (!event) {
        toast({
          title: 'Erro',
          description: 'Evento não encontrado',
          variant: 'destructive',
        });
        setApprovingEventId(null);
        return;
      }

      // Se o evento foi pago, processar reembolso
      if (event.sponsor_payment_status === 'paid') {
        try {
          const { data: refundData, error: refundError } = await supabase.functions.invoke('refund-event-payment', {
            body: { 
              event_id: eventId, 
              reason: reason || 'Evento rejeitado pelo administrador' 
            }
          });

          if (refundError) {
            console.error('Erro ao processar reembolso:', refundError);
            toast({
              title: 'Aviso',
              description: 'Evento rejeitado, mas reembolso falhou. Processe manualmente no Stripe.',
              variant: 'destructive',
            });
          } else {
            // Extrair informações do reembolso se disponível
            const refundAmount = refundData?.refund_amount;
            const stripeFee = refundData?.stripe_fee_deducted;
            
            let description = 'O pagamento foi reembolsado automaticamente.';
            if (refundAmount && stripeFee) {
              description = `Reembolso de R$ ${refundAmount.toFixed(2)} processado. Taxa do Stripe (R$ ${stripeFee.toFixed(2)}) descontada automaticamente.`;
            } else if (refundAmount) {
              description = `Reembolso de R$ ${refundAmount.toFixed(2)} processado. Taxa do Stripe descontada automaticamente.`;
            }
            
            toast({
              title: 'Reembolso processado',
              description: description,
            });
          }
        } catch (refundErr: unknown) {
          console.error('Erro ao chamar função de reembolso:', refundErr);
          toast({
            title: 'Aviso',
            description: 'Evento rejeitado, mas reembolso falhou. Processe manualmente no Stripe.',
            variant: 'destructive',
          });
        }
      }

      const nowIso = new Date().toISOString();
      const rejectionText = reason || 'Rejeitado pelo administrador';
      const updateData: Record<string, unknown> = {
        is_visible: false,
        updated_at: nowIso,
        approval_status: 'rejected',
        rejection_reason: rejectionText,
        moderation_decision_source: 'admin',
        moderated_at: nowIso,
      };

      console.log('🔄 Atualizando evento com dados:', updateData);

      // Tentar atualizar com approval_status primeiro
      const result = await updateEventWithFallback(eventId, updateData);
      const updatedEvent = result.data;

      if (!updatedEvent || updatedEvent.length === 0) {
        throw new Error('Nenhum evento foi atualizado. Verifique se você tem permissão.');
      }

      console.log('✅ Evento rejeitado com sucesso:', updatedEvent);
      console.log('📊 approval_status do evento atualizado:', updatedEvent[0]?.approval_status);

      // MOSTRAR TOAST DE SUCESSO IMEDIATAMENTE
      toast({
        title: '✅ Evento rejeitado',
        description: `O evento "${event.name}" foi rejeitado e removido da lista de pendentes.`,
        duration: 5000,
      });

      // Atualizar estado local imediatamente para feedback visual instantâneo
      // Usar os dados retornados do banco para garantir sincronização
      setEvents(prevEvents => {
        const updated = prevEvents.map(e => {
          if (e.id === eventId) {
            // Usar os dados atualizados do banco se disponíveis
            const updatedFromDb = updatedEvent[0] as Event & { approval_status?: string };
            const newEvent = {
              ...e,
              is_visible: false,
            };
            // Adicionar approval_status se existir
            if (updatedFromDb?.approval_status !== undefined) {
              (newEvent as Event & { approval_status?: string }).approval_status = updatedFromDb.approval_status;
            } else {
              // Se não existir no banco, marcar como rejeitado no estado local
              (newEvent as Event & { approval_status?: string }).approval_status = 'rejected';
            }
            return newEvent;
          }
          return e;
        });
        const pending = updated.filter(e => {
          const approvalStatus = (e as Event & { approval_status?: string }).approval_status;
          return !e.is_visible && approvalStatus !== 'rejected';
        });
        const rejected = updated.filter(e => (e as Event & { approval_status?: string }).approval_status === 'rejected');
        console.log('🔄 Estado atualizado. Eventos pendentes agora:', pending.length);
        console.log('🔄 Eventos rejeitados agora:', rejected.length);
        return updated;
      });

      // Recarregar eventos após um pequeno delay para garantir sincronização completa
      setTimeout(async () => {
        await loadEvents();
      }, 500);

      // Enviar email de notificação em background (não bloqueia)
      if (event?.organizador_email) {
        notifyEventRejected({
          organizerEmail: event.organizador_email,
          organizerName: event.organizador_nome,
          eventName: event.name,
          reason: reason,
          eventId: event.id,
        })
        .then(result => {
          if (result.success) {
            console.log('✅ Email de rejeição enviado com sucesso');
          } else {
            console.warn('⚠️ Email não foi enviado (não crítico):', result.error);
          }
        })
        .catch(err => {
          console.warn('⚠️ Erro ao enviar email (não crítico):', err);
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao rejeitar evento:', err);
      toast({
        title: '❌ Erro ao rejeitar evento',
        description: error.message || 'Não foi possível rejeitar o evento. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setApprovingEventId(null);
    }
  };

  const deleteEvent = async (eventId: string) => {
    
    setDeletingEventId(eventId);
    
    try {
      // Buscar dados do evento antes de excluir
      const event = events.find(e => e.id === eventId);

      if (!event) {
        
        toast({
          title: 'Erro',
          description: 'Evento não encontrado',
          variant: 'destructive',
        });
        setDeletingEventId(null);
        return;
      }

      // Se o evento foi pago, processar reembolso antes de excluir
      if (event.sponsor_payment_status === 'paid') {
        
        try {
          const { data: refundData, error: refundError } = await supabase.functions.invoke('refund-event-payment', {
            body: { 
              event_id: eventId, 
              reason: 'Evento excluído permanentemente pelo administrador' 
            }
          });

          if (refundError) {
            console.error('Erro ao processar reembolso:', refundError);
            toast({
              title: 'Aviso',
              description: 'Evento será excluído, mas reembolso falhou. Processe manualmente no Stripe.',
              variant: 'destructive',
            });
          } else {
            // Extrair informações do reembolso se disponível
            const refundAmount = refundData?.refund_amount;
            const stripeFee = refundData?.stripe_fee_deducted;
            
            let description = 'O pagamento foi reembolsado antes da exclusão.';
            if (refundAmount && stripeFee) {
              description = `Reembolso de R$ ${refundAmount.toFixed(2)} processado. Taxa do Stripe (R$ ${stripeFee.toFixed(2)}) descontada automaticamente.`;
            } else if (refundAmount) {
              description = `Reembolso de R$ ${refundAmount.toFixed(2)} processado. Taxa do Stripe descontada automaticamente.`;
            }
            
            toast({
              title: 'Reembolso processado',
              description: description,
            });
          }
        } catch (refundErr: unknown) {
          
          console.error('Erro ao chamar função de reembolso:', refundErr);
          toast({
            title: 'Aviso',
            description: 'Evento será excluído, mas reembolso falhou. Processe manualmente no Stripe.',
            variant: 'destructive',
          });
        }
      }

      // Excluir evento permanentemente do banco de dados
      
      const { error, data } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .select();

      if (error) {
        console.error('Erro ao excluir evento:', error);
        
        throw error;
      }

      toast({
        title: '✅ Evento excluído',
        description: `O evento "${event.name}" foi excluído permanentemente.`,
        duration: 5000,
      });

      // Fechar diálogos
      setDeleteDialogOpen(false);
      setDeleteConfirmName('');
      setSelectedEvent(null);

      // Recarregar lista de eventos
      
      await loadEvents();

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      console.error('Erro ao excluir evento:', err);
      toast({
        title: '❌ Erro ao excluir evento',
        description: error.message || 'Não foi possível excluir o evento. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setDeletingEventId(null);
      
    }
  };

  const toggleSponsorship = async (eventId: string, isSponsored: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          is_sponsored: !isSponsored,
          sponsor_payment_status: !isSponsored ? 'paid' : 'cancelled'
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: isSponsored ? 'Destaque removido' : 'Destaque ativado!',
        description: isSponsored
          ? 'O evento não aparece mais em destaque.'
          : 'O evento agora aparece em destaque.',
      });
      loadEvents();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

      console.log('🔧 Iniciando edição de evento:', editingEvent.id);

      setSaving(true);
    try {
      let imageUrl = editingEvent.image_url;
      let logoUrl = editingEvent.logo_evento;

      // Upload main image if a new file is selected
      if (imageFile) {
        const { data, error } = await supabase.storage
          .from('event-images')
          .upload(`public/${Date.now()}-${imageFile.name}`, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (error) throw error;
        imageUrl = `${supabase.storage.from('event-images').getPublicUrl(data.path).data.publicUrl}`;
      }

      // Upload logo image if a new file is selected
      if (logoFile) {
        const { data, error } = await supabase.storage
          .from('event-logos')
          .upload(`public/${Date.now()}-${logoFile.name}`, logoFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (error) throw error;
        logoUrl = `${supabase.storage.from('event-logos').getPublicUrl(data.path).data.publicUrl}`;
      }

      // Campos básicos que sempre existem (campos essenciais)
      let updateData: Record<string, unknown> = {};

      // Usar nomes de campos baseados na estrutura real da tabela descoberta
      // Usar campos baseados na estrutura real da tabela descoberta via debug
      updateData = {
        titulo: editingEvent.name,
        descricao: editingEvent.description,
        data_inicio: editingEvent.start_date,
        data_fim: editingEvent.end_date || null,
        local: editingEvent.location,
        categoria: editingEvent.category,
        organizador: editingEvent.organizador_nome || editingEvent.organizador,
        imagem_principal: imageUrl,
        video_promocional: editingEvent.video_url,
        updated_at: new Date().toISOString(),
      };

      const optionalFields = [
        { tableField: 'organizador_telefone', formField: 'organizador_telefone' },
        { tableField: 'organizador_email', formField: 'organizador_email' },
        { tableField: 'site_oficial', formField: 'site_oficial' },
        { tableField: 'start_time', formField: 'start_time' },
        { tableField: 'end_time', formField: 'end_time' },
        { tableField: 'approval_status', formField: 'approval_status' },
      ];

      for (const mapping of optionalFields) {
        if (editingEvent[mapping.formField as keyof typeof editingEvent]) {
          // Campos que sabemos que existem na tabela real (baseado na investigação)
          updateData[mapping.tableField] = editingEvent[mapping.formField as keyof typeof editingEvent];
        }
      }

      // Adicionar logo_evento se foi feito upload
      if (logoUrl) {
        updateData.logo_evento = logoUrl;
      }

      // Se tipo_entrada não foi definido, definir baseado em is_free
      if (!updateData.tipo_entrada && editingEvent.is_free !== undefined) {
        updateData.tipo_entrada = editingEvent.is_free ? 'gratuito' : 'pago';
      }

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', editingEvent.id);

      if (error) {
        console.error('❌ Erro ao editar evento:', error);
        throw error;
      }

      // Atualizar também a tabela event_details se existir
      if (editingEvent.video_url || editingEvent.image_url) {
        try {
          const { data: existingDetails } = await supabase
            .from('event_details')
            .select('id')
            .eq('event_id', editingEvent.id)
            .single();

          const detailsData: Record<string, unknown> = {
            event_id: editingEvent.id,
            updated_at: new Date().toISOString()
          };

          if (editingEvent.video_url) {
            detailsData.video_url = editingEvent.video_url;
          }

          if (editingEvent.image_url) {
            detailsData.cover_image_url = editingEvent.image_url;
          }

          if (existingDetails) {
            // Atualizar registro existente
            await supabase
              .from('event_details')
              .update(detailsData)
              .eq('event_id', editingEvent.id);
          } else {
            // Criar novo registro
            await supabase
              .from('event_details')
              .insert(detailsData);
          }
        } catch (detailsError) {
          console.warn('⚠️ Não foi possível atualizar event_details:', detailsError);
          // Não falhar a edição principal por causa disso
        }
      }

      // Traduzir automaticamente após salvar (se evento estiver aprovado ou for aprovado agora)
      try {
        const { data: updatedEvent } = await supabase
          .from('events')
          .select('id, name, description, location, category, approval_status')
          .eq('id', editingEvent.id)
          .single();

        if (updatedEvent && (updatedEvent.approval_status === 'approved' || updateData.approval_status === 'approved')) {
          const { autoTranslateEvent } = await import('@/utils/autoTranslation');
          // Traduzir em background (não bloquear UI)
          autoTranslateEvent({
            id: updatedEvent.id,
            name: updatedEvent.name || editingEvent.name || '',
            description: updatedEvent.description || editingEvent.description || null,
            location: updatedEvent.location || editingEvent.location || null,
            category: updatedEvent.category || editingEvent.category || null,
          });
        }
      } catch (translationError) {
        console.error('Erro ao traduzir evento (não crítico):', translationError);
        // Não bloquear o fluxo principal se a tradução falhar
      }

      toast({
        title: 'Evento atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });

      setEditDialogOpen(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao editar evento:', err);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filtrar eventos: pendentes são os que não estão visíveis E não foram rejeitados
  // Se approval_status não existir, considerar apenas is_visible
  const pendingEvents = events.filter(e => {
    const approvalStatus = (e as Event & { approval_status?: string }).approval_status;
    // Se não tem approval_status definido e não está visível, é pendente
    if (approvalStatus === undefined || approvalStatus === null) {
      return !e.is_visible; // Considerar pendente se não estiver visível
    }
    // Se tem approval_status, verificar se não é rejeitado
    return !e.is_visible && approvalStatus !== 'rejected';
  });
  const approvedEvents = events.filter(e => e.is_visible && !e.is_sponsored);
  const sponsoredEvents = events.filter(e => e.is_sponsored);
  const rejectedSystemEvents = events.filter((e) => {
    const approvalStatus = (e as Event & { approval_status?: string }).approval_status;
    return approvalStatus === 'rejected' && e.moderation_decision_source === 'system';
  });
  const rejectedManualEvents = events.filter((e) => {
    const approvalStatus = (e as Event & { approval_status?: string }).approval_status;
    return approvalStatus === 'rejected' && e.moderation_decision_source !== 'system';
  });

  // Função para extrair ID do YouTube
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    // Padrões comuns de URLs do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  // Função para obter URL de embed do YouTube
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Função para determinar região turística
  const getTouristRegion = (location: string) => {
    const locationLower = location.toLowerCase();
    const regionMappings = {
      'pantanal': ['corumbá', 'ladário', 'aquidauana', 'miranda', 'anastácio'],
      'bonito-serra-bodoquena': ['bonito', 'bodoquena', 'jardim', 'bela vista', 'caracol', 'guia lopes', 'nioaque', 'porto murtinho'],
      'vale-aguas': ['nova andradina', 'angélica', 'batayporã', 'ivinhema', 'jateí', 'novo horizonte do sul', 'taquarussu'],
      'vale-apore': ['cassilândia', 'chapadão do sul', 'inocência'],
      'rota-norte': ['coxim', 'alcinópolis', 'bandeirantes', 'camapuã', 'costa rica', 'figueirão', 'paraíso das águas', 'pedro gomes', 'rio verde de mato grosso', 'são gabriel do oeste', 'sonora'],
      'caminho-ipes': ['campo grande', 'corguinho', 'dois irmãos do buriti', 'jaraguari', 'nova alvorada', 'ribas do rio pardo', 'rio negro', 'sidrolândia', 'terenos'],
      'caminhos-fronteira': ['ponta porã', 'antônio joão', 'laguna carapã'],
      'costa-leste': ['três lagoas', 'água clara', 'aparecida do taboado', 'bataguassu', 'brasilândia', 'paranaíba', 'santa rita do pardo'],
      'grande-dourados': ['dourados', 'caarapó', 'deodápolis', 'douradina', 'fátima do sul', 'glória de dourados', 'itaporã', 'maracaju', 'rio brilhante', 'vicentina']
    };

    for (const [region, cities] of Object.entries(regionMappings)) {
      if (cities.some(city => locationLower.includes(city))) {
        return region;
      }
    }
    return 'descubra-ms';
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const EventCard = ({ event, showActions = true }: { event: Event; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(event.start_date)}
                  {event.start_time && ` às ${event.start_time}`}
                </div>
              </div>
              <div className="flex gap-1">
                {event.is_sponsored && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}
                {(event as Event & { approval_status?: string }).approval_status === 'rejected' && (
                  <Badge variant="destructive">
                    <X className="w-3 h-3 mr-1" />
                    Rejeitado
                  </Badge>
                )}
                {(event as Event & { approval_status?: string }).approval_status === 'rejected' &&
                  event.moderation_decision_source === 'system' && (
                    <Badge variant="outline" className="border-amber-500 text-amber-800 bg-amber-50">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Sistema
                    </Badge>
                  )}
                {!event.is_visible && (event as Event & { approval_status?: string }).approval_status !== 'rejected' && (
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendente
                  </Badge>
                )}
                {!event.is_visible && (event as Event & { approval_status?: string }).approval_status === 'approved' && (
                  <Badge variant="outline" className="bg-gray-100">
                    Arquivado
                  </Badge>
                )}
              </div>
            </div>

            {event.organizador_nome && (
              <div className="mt-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 inline mr-1" />
                {event.organizador_nome}
                {event.organizador_empresa && ` - ${event.organizador_empresa}`}
              </div>
            )}

            {event.rejection_reason && (
              <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-2 py-1.5">
                <strong>Motivo:</strong> {event.rejection_reason}
              </p>
            )}

            {showActions && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedEvent(event)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
                
                {(event as Event & { approval_status?: string }).approval_status === 'rejected' && (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => approveEvent(event.id)}
                    disabled={approvingEventId === event.id}
                  >
                    {approvingEventId === event.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    {approvingEventId === event.id
                      ? 'Publicando...'
                      : event.moderation_decision_source === 'system'
                        ? 'Aprovar e publicar'
                        : 'Reativar'}
                  </Button>
                )}
                
                {!event.is_visible && (event as Event & { approval_status?: string }).approval_status !== 'rejected' && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => approveEvent(event.id)}
                      disabled={approvingEventId === event.id}
                    >
                      {approvingEventId === event.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      {approvingEventId === event.id ? 'Aprovando...' : 'Aprovar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectEvent(event.id)}
                      disabled={approvingEventId === event.id}
                    >
                      {approvingEventId === event.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-1" />
                      )}
                      {approvingEventId === event.id ? 'Rejeitando...' : 'Rejeitar'}
                    </Button>
                  </>
                )}

                {event.is_visible && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant={event.is_sponsored ? "secondary" : "outline"}
                      onClick={() => toggleSponsorship(event.id, event.is_sponsored)}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      {event.is_sponsored ? 'Remover Destaque' : 'Dar Destaque'}
                    </Button>
                  </>
                )}

                {!event.is_visible && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Eventos"
          description="Aprove, edite ou remova eventos cadastrados por parceiros e organizadores."
          helpText="Aprove, edite ou remova eventos cadastrados por parceiros e organizadores."
        />
        <div className="flex items-center gap-4">
          <Button onClick={loadEvents} variant="outline">
            Atualizar Lista
          </Button>
        </div>
      </div>

      {/* Card de Configuração de Pagamento - Colapsável */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Aprovação Automática de Eventos
            </span>
            <Badge variant={autoApprovalEnabled ? 'default' : 'secondary'} className={autoApprovalEnabled ? 'bg-emerald-600' : ''}>
              {autoApprovalEnabled ? 'Ativada' : 'Desativada'}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Controle se eventos pendentes podem ser aprovados/rejeitados automaticamente pelo agente.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Autoaprovação de eventos</p>
              <p className="text-xs text-gray-500">
                Quando ligada, o sistema verifica eventos pendentes periodicamente.
              </p>
            </div>
            <Switch
              checked={autoApprovalEnabled}
              onCheckedChange={handleToggleAutoApproval}
              disabled={loadingAutoApproval || savingAutoApproval}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3 bg-gray-50">
            <div>
              <p className="font-medium text-sm">Agente IA 24/7</p>
              <p className="text-xs text-gray-500">
                Status geral do scheduler que executa as tarefas automáticas.
              </p>
            </div>
            <Badge variant={agentActive ? 'default' : 'secondary'} className={agentActive ? 'bg-blue-600' : ''}>
              {agentActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Card de Configuração de Pagamento - Colapsável */}
      <Card className="border-blue-200">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setPaymentConfigExpanded(!paymentConfigExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Configuração de Pagamento
            </CardTitle>
            <div className="flex items-center gap-2">
              {defaultPaymentLink && !paymentConfigExpanded && (
                <Badge variant="outline" className="font-mono text-xs max-w-xs truncate">
                  {defaultPaymentLink.substring(0, 40)}...
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentConfigExpanded(!paymentConfigExpanded);
                }}
              >
                {paymentConfigExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Fechar
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-1" />
                    Editar
                  </>
                )}
              </Button>
            </div>
          </div>
          {!paymentConfigExpanded && defaultPaymentLink && (
            <p className="text-sm text-gray-600 mt-2">
              Link padrão configurado. Este link será usado para todos os eventos em destaque que não tiverem link próprio.
            </p>
          )}
        </CardHeader>
        
        {paymentConfigExpanded && (
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configure o link padrão de pagamento do Stripe para eventos em destaque. 
                Este link será usado automaticamente quando um evento não tiver link próprio configurado.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="default-payment-link">Link Padrão de Pagamento (Stripe Payment Link)</Label>
              <div className="flex gap-2">
                <Input
                  id="default-payment-link"
                  type="url"
                  placeholder="https://buy.stripe.com/test_..."
                  value={defaultPaymentLink}
                  onChange={(e) => setDefaultPaymentLink(e.target.value)}
                  disabled={loadingPaymentLink}
                  className={defaultPaymentLink && !validatePaymentLink(defaultPaymentLink) ? 'border-red-500' : ''}
                />
                {defaultPaymentLink && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(defaultPaymentLink);
                        toast({
                          title: 'Link copiado',
                          description: 'Link copiado para a área de transferência',
                        });
                      }}
                      title="Copiar link"
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(defaultPaymentLink, '_blank')}
                      title="Testar link"
                    >
                      <ExternalLink size={16} />
                    </Button>
                  </>
                )}
              </div>
              
              {defaultPaymentLink && !validatePaymentLink(defaultPaymentLink) && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Link inválido. Use o formato: https://buy.stripe.com/...
                </p>
              )}
              
              {defaultPaymentLink && validatePaymentLink(defaultPaymentLink) && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Link válido
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                Deixe em branco para desabilitar o link padrão. Neste caso, o sistema usará checkout dinâmico.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setPaymentConfigExpanded(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePaymentLink} 
                disabled={savingPaymentLink || loadingPaymentLink || (defaultPaymentLink && !validatePaymentLink(defaultPaymentLink))}
              >
                {savingPaymentLink ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar Link Padrão
                  </>
                )}
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Importante:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Configure o Payment Link no Stripe Dashboard com <code>client_reference_id</code> = <code>{'{EVENT_ID}'}</code></li>
                  <li>O sistema adiciona automaticamente o <code>client_reference_id</code> quando o organizador clica no link</li>
                  <li>Para alterar o valor, crie um novo Payment Link no Stripe e atualize aqui</li>
                  <li>Links de teste começam com <code>test_</code>, links de produção não têm esse prefixo</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Card de Configuração de Preço */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Preço de Eventos em Destaque
            </span>
            {sponsorPrice && !paymentConfigExpanded && (
              <Badge variant="outline" className="font-mono text-xs">
                R$ {parseFloat(sponsorPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setPaymentConfigExpanded(!paymentConfigExpanded);
              }}
            >
              {paymentConfigExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Fechar
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-1" />
                  Editar
                </>
              )}
            </Button>
          </CardTitle>
          {!paymentConfigExpanded && sponsorPrice && (
            <p className="text-sm text-gray-600 mt-2">
              Este preço será exibido na plataforma para eventos em destaque.
            </p>
          )}
        </CardHeader>
        
        {paymentConfigExpanded && (
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configure o preço exibido na plataforma para eventos em destaque. 
                Este valor é apenas visual e não afeta o valor cobrado no Stripe.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="sponsor-price">Preço (em reais)</Label>
              <div className="flex gap-2 items-center">
                <span className="text-lg font-semibold">R$</span>
                <Input
                  id="sponsor-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="499.90"
                  value={sponsorPrice}
                  onChange={(e) => setSponsorPrice(e.target.value)}
                  disabled={loadingSponsorPrice}
                  className="max-w-xs"
                />
              </div>
              
              {sponsorPrice && parseFloat(sponsorPrice) > 0 && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Preço válido: R$ {parseFloat(sponsorPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}

              {sponsorPrice && (isNaN(parseFloat(sponsorPrice)) || parseFloat(sponsorPrice) <= 0) && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Preço inválido. Use um número maior que zero (ex: 499.90)
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                Formato: use ponto para decimais (ex: 499.90). Este valor será exibido em todos os formulários de cadastro de eventos.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setPaymentConfigExpanded(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveSponsorPrice} 
                disabled={savingSponsorPrice || loadingSponsorPrice || (sponsorPrice && (isNaN(parseFloat(sponsorPrice)) || parseFloat(sponsorPrice) <= 0))}
              >
                {savingSponsorPrice ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Salvar Preço
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{pendingEvents.length}</div>
            <p className="text-xs text-yellow-600">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Revisar (automático)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-950">{rejectedSystemEvents.length}</div>
            <p className="text-xs text-amber-800">Rejeitados pelo sistema — você pode aprovar</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{approvedEvents.length}</div>
            <p className="text-xs text-green-600">Visíveis na plataforma</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{sponsoredEvents.length}</div>
            <p className="text-xs text-purple-600">Eventos patrocinados</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Rejeitados (manual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{rejectedManualEvents.length}</div>
            <p className="text-xs text-red-600">Rejeição pelo admin ou legado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de eventos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="reject-system" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Revisar automático ({rejectedSystemEvents.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <Check className="w-4 h-4" />
            Aprovados ({approvedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="sponsored" className="gap-2">
            <Star className="w-4 h-4" />
            Em Destaque ({sponsoredEvents.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <X className="w-4 h-4" />
            Rejeitados manual ({rejectedManualEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : pendingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento pendente de aprovação
            </div>
          ) : (
            pendingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approvedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento aprovado
            </div>
          ) : (
            approvedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="sponsored" className="space-y-4 mt-4">
          {sponsoredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento em destaque
            </div>
          ) : (
            sponsoredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {rejectedManualEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum evento rejeitado manualmente
            </div>
          ) : (
            rejectedManualEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento</DialogTitle>
          </DialogHeader>

          {editingEvent && (
            <div className="space-y-6 py-4">
              {/* Nome */}
              <div>
                <Label htmlFor="edit-name">Nome do Evento *</Label>
                <Input
                  id="edit-name"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({...editingEvent, name: e.target.value})}
                  placeholder="Nome do evento"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                  placeholder="Descrição detalhada do evento"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Data de início */}
                <div>
                  <Label htmlFor="edit-start-date">Data de Início</Label>
                  <Input
                    id="edit-start-date"
                    type="datetime-local"
                    value={toDateTimeLocalValue(editingEvent.start_date)}
                    onChange={(e) => setEditingEvent({...editingEvent, start_date: e.target.value})}
                  />
                </div>

                {/* Data de fim */}
                <div>
                  <Label htmlFor="edit-end-date">Data de Fim</Label>
                  <Input
                    id="edit-end-date"
                    type="datetime-local"
                    value={toDateTimeLocalValue(editingEvent.end_date)}
                    onChange={(e) => setEditingEvent({...editingEvent, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Local */}
                <div>
                  <Label htmlFor="edit-location">Local</Label>
                  <Input
                    id="edit-location"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                    placeholder="Local do evento"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Input
                    id="edit-category"
                    value={editingEvent.category || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                    placeholder="Ex: cultural, esportivo, etc."
                  />
                </div>
              </div>

              {/* Organizadores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-organizer">Organizador</Label>
                  <Input
                    id="edit-organizer"
                    value={editingEvent.organizador_nome || editingEvent.organizador || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_nome: e.target.value})}
                    placeholder="Nome do organizador"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Input
                    id="edit-company"
                    value={(editingEvent as Event & { organizador_empresa?: string }).organizador_empresa || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_empresa: e.target.value} as Event & { organizador_empresa?: string })}
                    placeholder="Empresa organizadora"
                  />
                </div>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingEvent.organizador_email || editingEvent.contato_email || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingEvent.organizador_telefone || editingEvent.contato_telefone || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, organizador_telefone: e.target.value})}
                    placeholder="(67) 99999-9999"
                  />
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-website">Site Oficial</Label>
                  <Input
                    id="edit-website"
                    value={editingEvent.site_oficial || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, site_oficial: e.target.value})}
                    placeholder="https://site.com"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-video-url">URL do Vídeo (YouTube)</Label>
                  <Input
                    id="edit-video-url"
                    value={editingEvent.video_url || ''}
                    onChange={(e) => setEditingEvent({...editingEvent, video_url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              {/* Imagens */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-image">Imagem Principal</Label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  {editingEvent.image_url && (
                    <p className="text-sm text-gray-500 mt-1">Imagem atual: {editingEvent.image_url}</p>
                  )}
                  {imageFile && (
                    <p className="text-sm text-green-600 mt-1">Novo arquivo: {imageFile.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-logo">Logo do Evento</Label>
                  <Input
                    id="edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {editingEvent.logo_evento && (
                    <p className="text-sm text-gray-500 mt-1">Logo atual: {editingEvent.logo_evento}</p>
                  )}
                  {logoFile && (
                    <p className="text-sm text-green-600 mt-1">Novo arquivo: {logoFile.name}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes - Prévia do que aparece para os usuários */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl [&>button]:hidden">
          {selectedEvent && (() => {
            const touristRegion = getTouristRegion(selectedEvent.location);
            const regionColors = {
              'pantanal': 'from-blue-600 to-cyan-600',
              'bonito-serra-bodoquena': 'from-green-600 to-emerald-600',
              'vale-aguas': 'from-purple-600 to-indigo-600',
              'vale-apore': 'from-orange-600 to-red-600',
              'rota-norte': 'from-yellow-600 to-amber-600',
              'caminho-ipes': 'from-pink-600 to-rose-600',
              'caminhos-fronteira': 'from-teal-600 to-cyan-600',
              'costa-leste': 'from-indigo-600 to-purple-600',
              'grande-dourados': 'from-lime-600 to-green-600',
              'descubra-ms': 'from-ms-primary-blue to-ms-discovery-teal'
            };

            const regionEmojis = {
              'pantanal': '🐊',
              'bonito-serra-bodoquena': '🏔️',
              'vale-aguas': '💧',
              'vale-apore': '🏞️',
              'rota-norte': '🧭',
              'caminho-ipes': '🌸',
              'caminhos-fronteira': '🌎',
              'costa-leste': '🌊',
              'grande-dourados': '🌾',
              'descubra-ms': '🇧🇷'
            };

            const regionNames = {
              'pantanal': 'Pantanal',
              'bonito-serra-bodoquena': 'Bonito-Serra da Bodoquena',
              'vale-aguas': 'Vale das Águas',
              'vale-apore': 'Vale do Aporé',
              'rota-norte': 'Rota Norte',
              'caminho-ipes': 'Caminho dos Ipês',
              'caminhos-fronteira': 'Caminhos da Fronteira',
              'costa-leste': 'Costa Leste',
              'grande-dourados': 'Grande Dourados',
              'descubra-ms': 'Descubra MS'
            };

            return (
              <div className="relative max-h-[90vh] overflow-y-auto">
                {/* Header com imagem/vídeo - Igual ao que aparece para usuários */}
                <div className={`relative h-72 bg-gradient-to-br ${regionColors[touristRegion as keyof typeof regionColors] || regionColors['descubra-ms']} flex-shrink-0`}>
                  {selectedEvent.video_url && getYouTubeEmbedUrl(selectedEvent.video_url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedEvent.video_url)!}
                      className="w-full h-full"
                      allowFullScreen
                      title="Vídeo do evento"
                    />
                  ) : (selectedEvent.logo_evento || selectedEvent.image_url) ? (
                    <img
                      src={optimizeModalImage(selectedEvent.logo_evento || selectedEvent.image_url)}
                      alt={selectedEvent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="w-24 h-24 text-white/30" />
                    </div>
                  )}

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Badges no topo */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Badge Pendente (apenas admin) */}
                    {!selectedEvent.is_visible && (
                      <Badge className="bg-amber-500 text-white border-0 px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente de Aprovação
                      </Badge>
                    )}
                    {/* Badge destaque */}
                    {selectedEvent.is_sponsored && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Em Destaque
                      </Badge>
                    )}
                    {/* Badge da região turística */}
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1">
                      <span className="mr-2">{regionEmojis[touristRegion as keyof typeof regionEmojis] || regionEmojis['descubra-ms']}</span>
                      <span className="font-medium">{regionNames[touristRegion as keyof typeof regionNames] || regionNames['descubra-ms']}</span>
                    </Badge>
                    {/* Badge categoria */}
                    {selectedEvent.category && (
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1 capitalize">
                        {selectedEvent.category}
                      </Badge>
                    )}
                  </div>

                  {/* Título no overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {selectedEvent.name}
                    </h2>
                    <p className="text-white/90 text-sm drop-shadow">
                      {selectedEvent.description?.substring(0, 150)}...
                    </p>
                  </div>
                </div>

                {/* Conteúdo principal */}
                <div className="p-6 space-y-6 bg-white">
                  {/* Informações principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data e horário */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-ms-primary-blue" />
                        Data e Horário
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-blue-50 text-ms-primary-blue px-4 py-2 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{formatDate(selectedEvent.start_date)}</span>
                          {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date && (
                            <span className="text-sm"> até {formatDate(selectedEvent.end_date)}</span>
                          )}
                        </div>
                        {selectedEvent.start_time && (
                          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {selectedEvent.start_time}
                              {selectedEvent.end_time && ` - ${selectedEvent.end_time}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Localização */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-ms-primary-blue" />
                        Localização
                      </h3>
                      <div className="bg-gray-50 px-4 py-3 rounded-lg">
                        <p className="text-gray-700 font-medium">{selectedEvent.location}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {regionNames[touristRegion as keyof typeof regionNames] || regionNames['descubra-ms']}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Descrição completa */}
                  {selectedEvent.description && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Sobre o Evento</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Categoria */}
                  {selectedEvent.category && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900">Categoria</h3>
                      <div className="bg-indigo-50 px-4 py-2 rounded-lg inline-block">
                        <Badge className="bg-indigo-600 text-white capitalize">
                          {selectedEvent.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Logo do Evento (se diferente da imagem principal) */}
                  {selectedEvent.logo_evento && selectedEvent.logo_evento !== selectedEvent.image_url && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-ms-primary-blue" />
                        Logo do Evento
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                        <img 
                          src={optimizeModalImage(selectedEvent.logo_evento)} 
                          alt="Logo do evento"
                          className="max-w-xs max-h-48 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Informações do organizador */}
                  {(selectedEvent.organizador_nome || selectedEvent.organizador_email || selectedEvent.organizador_telefone) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-ms-primary-blue" />
                        Organização
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        {selectedEvent.organizador_nome && (
                          <p className="text-gray-700">
                            <span className="font-medium">Organizado por:</span> {selectedEvent.organizador_nome}
                            {selectedEvent.organizador_empresa && ` - ${selectedEvent.organizador_empresa}`}
                          </p>
                        )}
                        {selectedEvent.organizador_email && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Email:</span>{' '}
                            <a href={`mailto:${selectedEvent.organizador_email}`} className="text-blue-600 hover:underline">
                              {selectedEvent.organizador_email}
                            </a>
                          </p>
                        )}
                        {selectedEvent.organizador_telefone && (
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Telefone:</span>{' '}
                            <a href={`tel:${selectedEvent.organizador_telefone}`} className="text-blue-600 hover:underline">
                              {selectedEvent.organizador_telefone}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Site oficial */}
                  {selectedEvent.site_oficial && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-ms-primary-blue" />
                        Site Oficial
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <a 
                          href={selectedEvent.site_oficial} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-2"
                        >
                          {selectedEvent.site_oficial}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Informações de Patrocínio */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      Informações de Patrocínio
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase mb-2">Status do Pagamento</p>
                          <Badge 
                            variant={selectedEvent.sponsor_payment_status === 'paid' ? 'default' : 'secondary'}
                            className={selectedEvent.sponsor_payment_status === 'paid' ? 'bg-green-600' : 'bg-amber-500'}
                          >
                            {selectedEvent.sponsor_payment_status === 'paid' ? 'Pago' : selectedEvent.sponsor_payment_status || 'Gratuito'}
                          </Badge>
                        </div>
                        {selectedEvent.sponsor_amount && (
                          <div>
                            <p className="text-xs text-gray-600 uppercase mb-2">Valor</p>
                            <p className="text-lg font-bold text-gray-900">
                              R$ {selectedEvent.sponsor_amount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedEvent.refund_status && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-600 uppercase mb-2">Status do Reembolso</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="bg-white">
                            {selectedEvent.refund_status}
                          </Badge>
                          {selectedEvent.refund_amount && (
                            <span className="text-sm text-gray-700">
                              Valor: R$ {Number(selectedEvent.refund_amount).toFixed(2)}
                            </span>
                          )}
                        </div>
                        {selectedEvent.stripe_refund_id && (
                          <p className="text-xs text-gray-600 mt-2">
                            Referência Stripe: {selectedEvent.stripe_refund_id}
                          </p>
                        )}
                        {selectedEvent.refunded_at && (
                          <p className="text-xs text-gray-600 mt-1">
                            Concluído em: {new Date(selectedEvent.refunded_at).toLocaleString('pt-BR')}
                          </p>
                        )}
                        {selectedEvent.refund_error_message && (
                          <p className="text-xs text-red-700 mt-1">
                            Erro: {selectedEvent.refund_error_message}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Configuração de Payment Link - Apenas para eventos com patrocínio/pagamento */}
                    {selectedEvent.is_visible &&
                      (selectedEvent as Event & { approval_status?: string }).approval_status === 'approved' &&
                      (selectedEvent.is_sponsored || selectedEvent.sponsor_payment_status === 'paid') && (
                      <div className="mt-4">
                        <EventPaymentConfig
                          eventId={selectedEvent.id}
                          currentPaymentLink={selectedEvent.stripe_payment_link_url}
                          paymentStatus={selectedEvent.sponsor_payment_status}
                          onUpdate={loadEvents}
                        />
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação - Apenas para admin */}
                  {!selectedEvent.is_visible && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                        onClick={() => {
                          approveEvent(selectedEvent.id);
                          setSelectedEvent(null);
                        }}
                        disabled={approvingEventId === selectedEvent.id}
                        size="lg"
                      >
                        {approvingEventId === selectedEvent.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        {approvingEventId === selectedEvent.id ? 'Aprovando...' : 'Aprovar Evento'}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-full"
                        onClick={async () => {
                          try {
                            await rejectEvent(selectedEvent.id);
                            // Fechar modal após atualização
                            setSelectedEvent(null);
                          } catch (error) {
                            console.error('Erro ao rejeitar evento:', error);
                            // Não fechar modal se houver erro
                          }
                        }}
                        disabled={approvingEventId === selectedEvent.id}
                        size="lg"
                      >
                        {approvingEventId === selectedEvent.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        {approvingEventId === selectedEvent.id ? 'Rejeitando...' : 'Rejeitar'}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-full"
                        onClick={() => {
                          setDeleteDialogOpen(true);
                          setDeleteConfirmName('');
                        }}
                        disabled={deletingEventId === selectedEvent.id}
                        size="lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Evento
                      </Button>
                    </div>
                  )}

                  {/* Botão de Excluir - Para eventos já aprovados/visíveis */}
                  {selectedEvent.is_visible && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-full"
                        onClick={() => {
                          setDeleteDialogOpen(true);
                          setDeleteConfirmName('');
                        }}
                        disabled={deletingEventId === selectedEvent.id}
                        size="lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Evento
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão Permanente
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O evento será excluído permanentemente do banco de dados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Você está prestes a excluir permanentemente o evento <strong>{selectedEvent?.name}</strong>.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirm-name">
                Digite o nome do evento para confirmar: <strong>{selectedEvent?.name}</strong>
              </Label>
              <Input
                id="confirm-name"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Digite o nome do evento"
                className={deleteConfirmName && deleteConfirmName !== selectedEvent?.name ? 'border-red-500' : ''}
              />
              {deleteConfirmName && deleteConfirmName !== selectedEvent?.name && (
                <p className="text-sm text-red-600">O nome não corresponde ao evento.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedEvent && deleteConfirmName === selectedEvent.name) {
                  deleteEvent(selectedEvent.id);
                }
              }}
              disabled={!selectedEvent || deleteConfirmName !== selectedEvent.name || deletingEventId === selectedEvent.id}
            >
              {deletingEventId === selectedEvent?.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

