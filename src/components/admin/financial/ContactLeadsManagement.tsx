/**
 * Contact Leads Management
 * Gerencia leads do formulário de contato
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Search, 
  Eye,
  MessageSquare,
  Filter,
  User,
  CheckCircle,
  Edit,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { dataSaleReportService } from '@/services/admin/dataSaleReportService';
import { sendNotificationEmail } from '@/services/email/notificationEmailService';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Download,
  Loader2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  custom_fields: any;
  created_at: string;
  status_id: string | null;
  priority_id: string | null;
  source_id: string | null;
}

interface DataSaleRequest {
  id: string;
  lead_id: string | null;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  requester_organization: string | null;
  requester_city: string | null;
  report_type: 'explanatory' | 'raw_data' | 'both';
  period_start: string;
  period_end: string;
  period_months: number;
  status: 'pending' | 'approved' | 'paid' | 'generating' | 'generated' | 'delivered' | 'cancelled' | 'failed';
  price_paid: number | null;
  stripe_payment_id: string | null;
  stripe_checkout_session_id: string | null;
  report_file_path: string | null;
  raw_data_file_path: string | null;
  generated_at: string | null;
  delivered_at: string | null;
  data_validation_status: 'pending' | 'validating' | 'valid' | 'insufficient' | 'invalid';
  data_validation_notes: string | null;
  data_sources_used: string[] | null;
  total_records_count: number | null;
  created_at: string;
  updated_at: string;
}

export default function ContactLeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resolvingLeadId, setResolvingLeadId] = useState<string | null>(null);
  const [dataSaleRequest, setDataSaleRequest] = useState<DataSaleRequest | null>(null);
  const [loadingDataSale, setLoadingDataSale] = useState(false);
  const [price, setPrice] = useState<string>('300.00');
  const [loadingPrice, setLoadingPrice] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();
  
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'master_admin';

  useEffect(() => {
    fetchLeads();
    fetchPrice();
  }, []);

  // Buscar data_sale_request quando um lead com requestData é selecionado
  useEffect(() => {
    if (selectedLead?.custom_fields?.requestData && selectedLead.id) {
      fetchDataSaleRequest(selectedLead.id);
    } else {
      setDataSaleRequest(null);
    }
  }, [selectedLead]);

  const fetchPrice = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'data_sale_price')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setPrice(data.value || '300.00');
      }
    } catch (error: any) {
      console.error('Erro ao carregar preço:', error);
    }
  };

  const fetchDataSaleRequest = async (leadId: string) => {
    try {
      setLoadingDataSale(true);
      const { data, error } = await supabase
        .from('data_sale_requests')
        .select('*')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setDataSaleRequest(data || null);
    } catch (error: any) {
      console.error('Erro ao buscar solicitação de dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar informações da solicitação de dados',
        variant: 'destructive',
      });
    } finally {
      setLoadingDataSale(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Buscar apenas leads do formulário de contato (viajartur)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('source_id', '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a') // Website source
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filtrar apenas leads do formulário de contato ViajARTur
      const contactLeads = (data || []).filter((lead: any) => 
        lead.custom_fields?.origin === 'viajartur' || 
        lead.custom_fields?.form_type === 'contact'
      );

      setLeads(contactLeads);
    } catch (error: any) {
      console.error('Erro ao carregar leads:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar leads de contato',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (statusId: string | null) => {
    if (!statusId) return 'Novo';
    // IDs dos status da migration
    if (statusId === '1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b') return 'Novo';
    if (statusId === '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b') return 'Contatado';
    if (statusId === '3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b') return 'Qualificado';
    if (statusId === '4b4b4b4b-4b4b-4b4b-4b4b-4b4b4b4b4b4b') return 'Proposta';
    if (statusId === '5b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b') return 'Negociação';
    if (statusId === '6b6b6b6b-6b6b-6b6b-6b6b-6b6b6b6b6b6b') return 'Ganho';
    if (statusId === '7b7b7b7b-7b7b-7b7b-7b7b-7b7b7b7b7b7b') return 'Perdido';
    if (statusId === '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b') return 'Resolvido';
    return 'Novo';
  };

  const getStatusColor = (statusId: string | null) => {
    const status = getStatusLabel(statusId);
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'Contatado': return 'bg-yellow-100 text-yellow-800';
      case 'Qualificado': return 'bg-green-100 text-green-800';
      case 'Proposta': return 'bg-purple-100 text-purple-800';
      case 'Negociação': return 'bg-orange-100 text-orange-800';
      case 'Ganho': return 'bg-emerald-100 text-emerald-800';
      case 'Perdido': return 'bg-red-100 text-red-800';
      case 'Resolvido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return '—';
    if (role === 'empresario') return 'Empresário do setor turístico';
    if (role === 'secretaria') return 'Secretaria de Turismo / Prefeitura';
    if (role === 'outro') return 'Outro';
    return role;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      getStatusLabel(lead.status_id).toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setEditFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      notes: lead.notes || '',
      status_id: lead.status_id || '1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b',
      priority_id: lead.priority_id || '2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c',
      role: lead.custom_fields?.role || '',
      requestData: lead.custom_fields?.requestData || false,
      dataReportType: lead.custom_fields?.dataReportType || 'both',
      dataPeriodStart: lead.custom_fields?.dataPeriodStart || '',
      dataPeriodEnd: lead.custom_fields?.dataPeriodEnd || '',
      dataCity: lead.custom_fields?.dataCity || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveLead = async () => {
    if (!editingLead) return;

    setSaving(true);
    try {
      const customFields = {
        ...editingLead.custom_fields,
        role: editFormData.role || null,
        requestData: editFormData.requestData || false,
        dataReportType: editFormData.requestData ? editFormData.dataReportType : null,
        dataPeriodStart: editFormData.requestData ? editFormData.dataPeriodStart : null,
        dataPeriodEnd: editFormData.requestData ? editFormData.dataPeriodEnd : null,
        dataCity: editFormData.requestData ? editFormData.dataCity : null,
      };

      const { error } = await supabase
        .from('leads')
        .update({
          name: editFormData.name,
          email: editFormData.email,
          phone: editFormData.phone || null,
          company: editFormData.company || null,
          notes: editFormData.notes || null,
          status_id: editFormData.status_id || null,
          priority_id: editFormData.priority_id || null,
          custom_fields: customFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingLead.id);

      if (error) throw error;

      toast({
        title: '✅ Lead atualizado!',
        description: 'As informações do lead foram salvas com sucesso.',
      });

      setEditDialogOpen(false);
      setEditingLead(null);
      fetchLeads();
    } catch (error: any) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: '❌ Erro ao salvar',
        description: error.message || 'Não foi possível atualizar o lead.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = async () => {
    try {
      setLoadingPrice(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'data_sale_price',
          value: price,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast({
        title: 'Preço atualizado',
        description: `Novo preço: R$ ${parseFloat(price).toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar preço',
        variant: 'destructive',
      });
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleApproveDataSale = async () => {
    if (!dataSaleRequest) return;
    
    try {
      // Criar checkout do Stripe
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('data-sale-checkout', {
        body: {
          requestId: dataSaleRequest.id,
          amount: price,
          successUrl: `${window.location.origin}/viajar/admin/financial/contact-leads?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/viajar/admin/financial/contact-leads?payment=cancelled`
        }
      });

      if (checkoutError || !checkoutData?.success) {
        throw new Error(checkoutError?.message || 'Erro ao criar checkout');
      }

      // Atualizar status para aprovado
      const { error } = await supabase
        .from('data_sale_requests')
        .update({ 
          status: 'approved',
          stripe_checkout_session_id: checkoutData.sessionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', dataSaleRequest.id);

      if (error) throw error;

      // Log da ação
      await supabase.rpc('log_data_sale_action', {
        p_request_id: dataSaleRequest.id,
        p_action: 'approved',
        p_notes: 'Solicitação aprovada pelo admin'
      });

      // Enviar email de aprovação com link de pagamento
      await sendNotificationEmail({
        type: 'data_report_approved',
        to: dataSaleRequest.requester_email,
        data: {
          requesterName: dataSaleRequest.requester_name,
          reportType: dataSaleRequest.report_type,
          periodStart: dataSaleRequest.period_start,
          periodEnd: dataSaleRequest.period_end,
          price: price,
          checkoutUrl: checkoutData.checkoutUrl
        }
      });

      toast({
        title: 'Aprovado',
        description: 'Solicitação aprovada. Link de pagamento enviado por email.',
      });

      await fetchDataSaleRequest(selectedLead!.id);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aprovar solicitação',
        variant: 'destructive',
      });
    }
  };

  const handleValidateData = async () => {
    if (!dataSaleRequest) return;
    
    try {
      // Atualizar status para validando
      await supabase
        .from('data_sale_requests')
        .update({ data_validation_status: 'validating' })
        .eq('id', dataSaleRequest.id);

      // Validar dados disponíveis usando o serviço
      const validationResult = await dataSaleReportService.validateDataAvailability(
        new Date(dataSaleRequest.period_start),
        new Date(dataSaleRequest.period_end),
        dataSaleRequest.requester_city || undefined
      );

      const isValid = validationResult.isValid;
      const totalRecords = validationResult.totalRecords;

      // Atualizar status da validação
      await supabase
        .from('data_sale_requests')
        .update({
          data_validation_status: isValid ? 'valid' : 'insufficient',
          data_validation_notes: isValid 
            ? `Dados válidos. Total de registros: ${totalRecords}`
            : `Dados insuficientes. Total de registros: ${totalRecords} (mínimo: 10)`,
          total_records_count: totalRecords,
          data_sources_used: validationResult.dataSources
        })
        .eq('id', dataSaleRequest.id);

      toast({
        title: isValid ? 'Dados válidos' : 'Dados insuficientes',
        description: `Total de registros encontrados: ${totalRecords}`,
        variant: isValid ? 'default' : 'destructive',
      });

      await fetchDataSaleRequest(selectedLead!.id);
    } catch (error: any) {
      toast({
        title: 'Erro na validação',
        description: error.message || 'Erro ao validar dados',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!dataSaleRequest) return;
    
    try {
      if (dataSaleRequest.data_validation_status !== 'valid') {
        toast({
          title: 'Validação necessária',
          description: 'Os dados devem ser validados antes de gerar o relatório',
          variant: 'destructive',
        });
        return;
      }

      if (dataSaleRequest.status !== 'paid') {
        toast({
          title: 'Pagamento necessário',
          description: 'O pagamento deve ser confirmado antes de gerar o relatório',
          variant: 'destructive',
        });
        return;
      }

      // Atualizar status para gerando
      await supabase
        .from('data_sale_requests')
        .update({ status: 'generating' })
        .eq('id', dataSaleRequest.id);

      // Agregar dados reais
      const aggregatedData = await dataSaleReportService.aggregateRealData(
        new Date(dataSaleRequest.period_start),
        new Date(dataSaleRequest.period_end),
        dataSaleRequest.requester_city || undefined
      );

      // Gerar e fazer upload dos relatórios
      const requestForService: any = {
        id: dataSaleRequest.id,
        requester_name: dataSaleRequest.requester_name,
        requester_email: dataSaleRequest.requester_email,
        requester_city: dataSaleRequest.requester_city,
        report_type: dataSaleRequest.report_type,
        period_start: new Date(dataSaleRequest.period_start),
        period_end: new Date(dataSaleRequest.period_end),
        status: dataSaleRequest.status
      };
      
      const { reportUrl, rawDataUrl } = await dataSaleReportService.generateAndUploadReports(
        requestForService,
        aggregatedData
      );

      // Atualizar com URLs dos arquivos
      await supabase
        .from('data_sale_requests')
        .update({
          status: 'generated',
          generated_at: new Date().toISOString(),
          report_file_path: reportUrl || null,
          raw_data_file_path: rawDataUrl || null
        })
        .eq('id', dataSaleRequest.id);

      // Log da ação
      await supabase.rpc('log_data_sale_action', {
        p_request_id: dataSaleRequest.id,
        p_action: 'generated',
        p_notes: 'Relatório gerado e enviado com sucesso'
      });

      // Enviar email com links de download
      await sendNotificationEmail({
        type: 'data_report_ready',
        to: dataSaleRequest.requester_email,
        data: {
          requesterName: dataSaleRequest.requester_name,
          reportType: dataSaleRequest.report_type,
          periodStart: dataSaleRequest.period_start,
          periodEnd: dataSaleRequest.period_end,
          totalRecords: dataSaleRequest.total_records_count,
          reportUrl: reportUrl,
          rawDataUrl: rawDataUrl
        }
      });

      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado e o link foi enviado por email.',
      });

      await fetchDataSaleRequest(selectedLead!.id);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      await supabase
        .from('data_sale_requests')
        .update({ status: 'failed' })
        .eq('id', dataSaleRequest.id);

      toast({
        title: 'Erro ao gerar relatório',
        description: error.message || 'Erro ao gerar relatório',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!dataSaleRequest) return;
    
    try {
      await supabase
        .from('data_sale_requests')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', dataSaleRequest.id);

      toast({
        title: 'Marcado como entregue',
        description: 'A solicitação foi marcada como entregue.',
      });

      await fetchDataSaleRequest(selectedLead!.id);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao marcar como entregue',
        variant: 'destructive',
      });
    }
  };

  const getDataSaleStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'outline' },
      approved: { label: 'Aprovado', variant: 'default' },
      paid: { label: 'Pago', variant: 'default' },
      generating: { label: 'Gerando', variant: 'secondary' },
      generated: { label: 'Gerado', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'default' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
      failed: { label: 'Falhou', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getValidationStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'outline' },
      validating: { label: 'Validando', variant: 'secondary' },
      valid: { label: 'Válido', variant: 'default' },
      insufficient: { label: 'Insuficiente', variant: 'destructive' },
      invalid: { label: 'Inválido', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const markAsResolved = async (leadId: string, leadName: string) => {
    // Feedback visual imediato
    setResolvingLeadId(leadId);
    
    try {
      const RESOLVED_STATUS_ID = '8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b';
      
      console.log('🔄 Marcando lead como resolvido:', { leadId, leadName, RESOLVED_STATUS_ID });
      
      // Atualizar o lead diretamente
      const { data, error } = await supabase
        .from('leads')
        .update({ status_id: RESOLVED_STATUS_ID })
        .eq('id', leadId)
        .select();

      if (error) {
        console.error('❌ Erro ao atualizar lead:', error);
        
        // Se o erro for de foreign key (status não existe), fornecer mensagem clara
        if (error.code === '23503' && error.details?.includes('lead_statuses')) {
          throw new Error(
            'Status "Resolvido" não existe no banco de dados. ' +
            'Execute a migration 20251215000001_add_resolved_status_to_leads.sql no Supabase Dashboard. ' +
            'Veja o SQL abaixo para copiar e colar no SQL Editor do Supabase.'
          );
        }
        
        throw error;
      }

      console.log('✅ Lead atualizado com sucesso:', data);

      // Atualizar o lead localmente com animação
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, status_id: RESOLVED_STATUS_ID }
          : lead
      ));

      // Feedback visual de sucesso
      toast({
        title: '✅ Lead marcado como resolvido!',
        description: `"${leadName}" foi marcado como resolvido com sucesso.`,
        duration: 3000,
      });

      // Pequeno delay para feedback visual antes de remover o loading
      setTimeout(() => {
        setResolvingLeadId(null);
      }, 500);
    } catch (error: any) {
      console.error('❌ Erro completo ao marcar lead como resolvido:', error);
      setResolvingLeadId(null);
      
      toast({
        title: '❌ Erro ao marcar como resolvido',
        description: error.message || 'Não foi possível marcar o lead como resolvido. Verifique o console para mais detalhes.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => getStatusLabel(l.status_id) === 'Novo').length,
    contacted: leads.filter(l => getStatusLabel(l.status_id) === 'Contatado').length,
    qualified: leads.filter(l => getStatusLabel(l.status_id) === 'Qualificado').length,
    resolved: leads.filter(l => getStatusLabel(l.status_id) === 'Resolvido').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Mensagens de Contato</h2>
        <p className="text-muted-foreground mt-1">
          Visualize as informações enviadas através do formulário "Entre em Contato"
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted + stats.qualified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Todas as Mensagens</option>
              <option value="novo">Novas (não lidas)</option>
              <option value="contatado">Em Andamento</option>
              <option value="qualificado">Respondidas</option>
              <option value="resolvido">Resolvidas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>
            Lista de leads do formulário de contato
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lead encontrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{lead.name}</span>
                        {lead.custom_fields?.requestData && (
                          <Badge 
                            className="bg-blue-100 text-blue-800 border-blue-300 border-2 text-xs font-semibold px-2 py-0.5"
                            title="Solicitou relatório de dados"
                          >
                            📊 Solicitou Relatório
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.company || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getRoleLabel(lead.custom_fields?.role)}
                        {lead.custom_fields?.requestData && (
                          <Badge
                            className="bg-blue-100 text-blue-800 border-blue-300 border-2 text-xs font-semibold px-2 py-0.5 mt-1"
                            title="Solicitou relatório de dados"
                          >
                            📊 Solicitou Relatório
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status_id)}>
                        {getStatusLabel(lead.status_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(lead);
                          setDialogOpen(true);
                        }}
                          title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                        {getStatusLabel(lead.status_id) !== 'Resolvido' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('🖱️ Botão clicado para lead:', lead.id, lead.name);
                              markAsResolved(lead.id, lead.name);
                            }}
                            title="Marcar como resolvido"
                            className={`text-green-600 hover:text-green-700 hover:bg-green-50 transition-all ${
                              resolvingLeadId === lead.id ? 'opacity-50 cursor-wait animate-pulse' : ''
                            }`}
                            disabled={resolvingLeadId === lead.id}
                          >
                            {resolvingLeadId === lead.id ? (
                              <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {getStatusLabel(lead.status_id) === 'Resolvido' && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            ✓ Resolvido
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>
              Informações completas do lead de contato
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              {/* Informações de Contato */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações de Contato</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <p className="text-sm font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">
                      <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">
                        {selectedLead.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-sm">
                      {selectedLead.phone ? (
                        <a href={`tel:${selectedLead.phone}`} className="text-blue-600 hover:underline">
                          {selectedLead.phone}
                        </a>
                      ) : (
                        'Não informado'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Empresa/Organização</label>
                    <p className="text-sm">{selectedLead.company || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo de Interesse</label>
                    <p className="text-sm">{getRoleLabel(selectedLead.custom_fields?.role)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Envio</label>
                    <p className="text-sm">
                      {format(new Date(selectedLead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerta de Solicitação de Dados */}
              {selectedLead.custom_fields?.requestData && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">
                      ⚠️ Este lead solicitou um relatório de dados
                    </h3>
                    <p className="text-sm text-amber-800">
                      Verifique a seção abaixo para mais detalhes sobre a solicitação.
                    </p>
                  </div>
                </div>
              )}

              {/* Solicitação de Dados - Seção Completa */}
              {selectedLead.custom_fields?.requestData && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Solicitação de Relatório de Dados
                    </h3>
                    {loadingDataSale ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : dataSaleRequest ? (
                      <div className="flex gap-2">
                        {getDataSaleStatusBadge(dataSaleRequest.status)}
                        {getValidationStatusBadge(dataSaleRequest.data_validation_status)}
                      </div>
                    ) : null}
                  </div>

                  {loadingDataSale ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Carregando informações da solicitação...</p>
                    </div>
                  ) : dataSaleRequest ? (
                    <div className="space-y-4">
                      {/* Informações da Solicitação */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-xs font-medium text-blue-700">Tipo de Relatório</label>
                          <p className="text-blue-900 font-medium">
                            {dataSaleRequest.report_type === 'explanatory' ? 'Apenas Tratado (PDF)' : 
                             dataSaleRequest.report_type === 'raw_data' ? 'Apenas Bruto (Excel)' : 
                             'Tratado + Bruto (PDF + Excel)'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-blue-700">Período</label>
                          <p className="text-blue-900 font-medium">
                            {format(new Date(dataSaleRequest.period_start), 'dd/MM/yyyy', { locale: ptBR })} a {' '}
                            {format(new Date(dataSaleRequest.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        {dataSaleRequest.requester_city && (
                          <div>
                            <label className="text-xs font-medium text-blue-700">Cidade/Região</label>
                            <p className="text-blue-900 font-medium">{dataSaleRequest.requester_city}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-blue-700">Preço</label>
                          <p className="text-blue-900 font-medium">
                            {dataSaleRequest.price_paid 
                              ? `R$ ${dataSaleRequest.price_paid.toFixed(2)} (Pago)`
                              : `R$ ${parseFloat(price).toFixed(2)} (A definir)`}
                          </p>
                        </div>
                      </div>

                      {/* Status de Validação */}
                      {dataSaleRequest.data_validation_notes && (
                        <div className={`p-3 rounded-md ${
                          dataSaleRequest.data_validation_status === 'valid' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-yellow-50 border border-yellow-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            {dataSaleRequest.data_validation_status === 'valid' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-700 mb-1">Validação de Dados</p>
                              <p className="text-xs text-gray-600">{dataSaleRequest.data_validation_notes}</p>
                              {dataSaleRequest.data_sources_used && dataSaleRequest.data_sources_used.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Fontes: {dataSaleRequest.data_sources_used.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ações Disponíveis */}
                      {isAdmin && (
                        <div className="pt-4 border-t border-blue-200">
                          <h4 className="text-sm font-semibold text-blue-900 mb-3">Ações</h4>
                          <div className="flex flex-wrap gap-2">
                            {/* Aprovar */}
                            {dataSaleRequest.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={handleApproveDataSale}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Aprovar e Enviar Link de Pagamento
                              </Button>
                            )}

                            {/* Validar Dados */}
                            {dataSaleRequest.status === 'pending' || dataSaleRequest.status === 'approved' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleValidateData}
                                disabled={dataSaleRequest.data_validation_status === 'validating'}
                              >
                                {dataSaleRequest.data_validation_status === 'validating' ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Validando...
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Validar Dados Disponíveis
                                  </>
                                )}
                              </Button>
                            ) : null}

                            {/* Gerar Relatório */}
                            {dataSaleRequest.status === 'paid' && dataSaleRequest.data_validation_status === 'valid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleGenerateReport}
                                disabled={dataSaleRequest.status === 'generating'}
                              >
                                {dataSaleRequest.status === 'generating' ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Gerando...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Gerar Relatório
                                  </>
                                )}
                              </Button>
                            )}

                            {/* Marcar como Entregue */}
                            {dataSaleRequest.status === 'generated' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleMarkAsDelivered}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar como Entregue
                              </Button>
                            )}

                            {/* Download dos Arquivos */}
                            {(dataSaleRequest.report_file_path || dataSaleRequest.raw_data_file_path) && (
                              <div className="flex gap-2">
                                {dataSaleRequest.report_file_path && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(dataSaleRequest.report_file_path!, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar PDF
                                  </Button>
                                )}
                                {dataSaleRequest.raw_data_file_path && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(dataSaleRequest.raw_data_file_path!, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Baixar Excel
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Configuração de Preço (apenas para admins) */}
                      {isAdmin && dataSaleRequest.status === 'pending' && (
                        <div className="pt-4 border-t border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-4 w-4 text-blue-700" />
                            <label className="text-sm font-medium text-blue-700">Preço do Relatório (R$)</label>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="max-w-[150px]"
                            />
                            <Button 
                              onClick={updatePrice} 
                              disabled={loadingPrice}
                              size="sm"
                              variant="outline"
                            >
                              {loadingPrice ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Atualizar'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Solicitação de dados ainda não foi criada no sistema. 
                        Isso pode acontecer se o lead foi criado antes da implementação desta funcionalidade.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Mensagem */}
              {selectedLead.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Mensagem Enviada
                  </label>
                  <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedLead.notes}
                  </div>
                </div>
              )}

              {/* Botão Editar (apenas para admins) */}
              {isAdmin && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      handleEditLead(selectedLead);
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Lead
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Atualize as informações do lead. Todas as alterações serão salvas no banco de dados.
            </DialogDescription>
          </DialogHeader>

          {editingLead && (
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações de Contato</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nome *</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company">Empresa/Organização</Label>
                    <Input
                      id="edit-company"
                      value={editFormData.company}
                      onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Status e Prioridade */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Status e Prioridade</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <select
                      id="edit-status"
                      value={editFormData.status_id}
                      onChange={(e) => setEditFormData({ ...editFormData, status_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b">Novo</option>
                      <option value="2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b">Contatado</option>
                      <option value="3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b">Qualificado</option>
                      <option value="4b4b4b4b-4b4b-4b4b-4b4b-4b4b4b4b4b4b">Proposta</option>
                      <option value="5b5b5b5b-5b5b-5b5b-5b5b-5b5b5b5b5b5b">Negociação</option>
                      <option value="6b6b6b6b-6b6b-6b6b-6b6b-6b6b6b6b6b6b">Ganho</option>
                      <option value="7b7b7b7b-7b7b-7b7b-7b7b-7b7b7b7b7b7b">Perdido</option>
                      <option value="8b8b8b8b-8b8b-8b8b-8b8b-8b8b8b8b8b8b">Resolvido</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-priority">Prioridade</Label>
                    <select
                      id="edit-priority"
                      value={editFormData.priority_id}
                      onChange={(e) => setEditFormData({ ...editFormData, priority_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c">Baixa</option>
                      <option value="2c2c2c2c-2c2c-2c2c-2c2c-2c2c2c2c2c2c">Média</option>
                      <option value="3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c">Alta</option>
                      <option value="4c4c4c4c-4c4c-4c4c-4c4c-4c4c4c4c4c4c">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tipo de Interesse */}
              <div>
                <Label htmlFor="edit-role">Tipo de Interesse</Label>
                <select
                  id="edit-role"
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Selecione...</option>
                  <option value="empresario">Empresário do setor turístico</option>
                  <option value="secretaria">Secretaria de Turismo / Prefeitura</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Solicitação de Dados */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="edit-requestData"
                    checked={editFormData.requestData}
                    onChange={(e) => setEditFormData({ ...editFormData, requestData: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-requestData" className="font-semibold cursor-pointer">
                    Solicitar Relatório de Dados
                  </Label>
                </div>
                {editFormData.requestData && (
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="edit-dataReportType">Tipo de Relatório</Label>
                      <select
                        id="edit-dataReportType"
                        value={editFormData.dataReportType}
                        onChange={(e) => setEditFormData({ ...editFormData, dataReportType: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="both">Tratado + Bruto</option>
                        <option value="explanatory">Apenas Tratado</option>
                        <option value="raw_data">Apenas Bruto</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="edit-dataPeriodStart">Período Início</Label>
                        <Input
                          id="edit-dataPeriodStart"
                          type="date"
                          value={editFormData.dataPeriodStart}
                          onChange={(e) => setEditFormData({ ...editFormData, dataPeriodStart: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-dataPeriodEnd">Período Fim</Label>
                        <Input
                          id="edit-dataPeriodEnd"
                          type="date"
                          value={editFormData.dataPeriodEnd}
                          onChange={(e) => setEditFormData({ ...editFormData, dataPeriodEnd: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-dataCity">Cidade/Região</Label>
                      <Input
                        id="edit-dataCity"
                        value={editFormData.dataCity}
                        onChange={(e) => setEditFormData({ ...editFormData, dataCity: e.target.value })}
                        placeholder="Ex: Campo Grande, Bonito, etc."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <Label htmlFor="edit-notes">Notas</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={6}
                  placeholder="Adicione observações sobre este lead..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingLead(null);
              }}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveLead} disabled={saving}>
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
