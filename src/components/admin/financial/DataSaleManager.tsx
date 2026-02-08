/**
 * Data Sale Manager
 * Gerencia solicitações de venda de dados de turismo
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  FileText, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Download,
  Settings,
  AlertCircle,
  Calendar,
  MapPin,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { dataSaleReportService } from '@/services/admin/dataSaleReportService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { sendNotificationEmail } from '@/services/email/notificationEmailService';

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

export default function DataSaleManager() {
  const [requests, setRequests] = useState<DataSaleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<DataSaleRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [price, setPrice] = useState<string>('300.00');
  const [loadingPrice, setLoadingPrice] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchPrice();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('data_sale_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar solicitações:', err);
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao carregar solicitações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar preço:', err);
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
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao atualizar preço',
        variant: 'destructive',
      });
    } finally {
      setLoadingPrice(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getValidationBadge = (status: string) => {
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

  const handleApprove = async (request: DataSaleRequest) => {
    try {
      // Criar checkout do Stripe
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('data-sale-checkout', {
        body: {
          requestId: request.id,
          amount: price,
          successUrl: `${window.location.origin}/viajar/admin/financial/data-sales?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/viajar/admin/financial/data-sales?payment=cancelled`
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
        .eq('id', request.id);

      if (error) throw error;

      // Log da ação
      await supabase.rpc('log_data_sale_action', {
        p_request_id: request.id,
        p_action: 'approved',
        p_notes: 'Solicitação aprovada pelo admin'
      });

      // Enviar email de aprovação com link de pagamento
      await sendNotificationEmail({
        type: 'data_report_approved',
        to: request.requester_email,
        data: {
          requesterName: request.requester_name,
          reportType: request.report_type,
          periodStart: request.period_start,
          periodEnd: request.period_end,
          price: price,
          checkoutUrl: checkoutData.checkoutUrl
        }
      });

      toast({
        title: 'Aprovado',
        description: 'Solicitação aprovada. Link de pagamento enviado por email.',
      });

      fetchRequests();
      setDialogOpen(false);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao aprovar solicitação',
        variant: 'destructive',
      });
    }
  };

  const handleValidateData = async (request: DataSaleRequest) => {
    try {
      // Atualizar status para validando
      await supabase
        .from('data_sale_requests')
        .update({ data_validation_status: 'validating' })
        .eq('id', request.id);

      // Validar dados disponíveis
      const { data: validationResult, error: validationError } = await supabase.rpc('validate_data_availability', {
        p_period_start: request.period_start,
        p_period_end: request.period_end,
        p_city: request.requester_city || null
      });

      if (validationError) throw validationError;

      const isValid = validationResult?.is_valid || false;
      const totalRecords = validationResult?.total_records || 0;

      // Atualizar status da validação
      await supabase
        .from('data_sale_requests')
        .update({
          data_validation_status: isValid ? 'valid' : 'insufficient',
          data_validation_notes: isValid 
            ? `Dados válidos. Total de registros: ${totalRecords}`
            : `Dados insuficientes. Total de registros: ${totalRecords} (mínimo: 10)`,
          total_records_count: totalRecords,
          data_sources_used: [
            ...(validationResult.tourist_surveys_count > 0 ? ['tourist_surveys'] : []),
            ...(validationResult.user_interactions_count > 0 ? ['user_interactions'] : []),
            ...(validationResult.user_profiles_count > 0 ? ['user_profiles'] : [])
          ]
        })
        .eq('id', request.id);

      toast({
        title: isValid ? 'Dados válidos' : 'Dados insuficientes',
        description: `Total de registros encontrados: ${totalRecords}`,
        variant: isValid ? 'default' : 'destructive',
      });

      fetchRequests();
      if (selectedRequest?.id === request.id) {
        setSelectedRequest({ ...request, data_validation_status: isValid ? 'valid' : 'insufficient' });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro na validação',
        description: err.message || 'Erro ao validar dados',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = async (request: DataSaleRequest) => {
    try {
      if (request.data_validation_status !== 'valid') {
        toast({
          title: 'Validação necessária',
          description: 'Os dados devem ser validados antes de gerar o relatório',
          variant: 'destructive',
        });
        return;
      }

      if (request.status !== 'paid') {
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
        .eq('id', request.id);

      // Agregar dados reais
      const aggregatedData = await dataSaleReportService.aggregateRealData(
        new Date(request.period_start),
        new Date(request.period_end),
        request.requester_city || undefined
      );

      // Gerar e fazer upload dos relatórios
      const { reportUrl, rawDataUrl } = await dataSaleReportService.generateAndUploadReports(request, aggregatedData);

      // Atualizar com URLs dos arquivos
      await supabase
        .from('data_sale_requests')
        .update({
          status: 'generated',
          generated_at: new Date().toISOString(),
          report_file_path: reportUrl || null,
          raw_data_file_path: rawDataUrl || null
        })
        .eq('id', request.id);

      // Log da ação
      await supabase.rpc('log_data_sale_action', {
        p_request_id: request.id,
        p_action: 'generated',
        p_notes: 'Relatório gerado e enviado com sucesso'
      });

      // Enviar email com links de download
      await sendNotificationEmail({
        type: 'data_report_ready',
        to: request.requester_email,
        data: {
          requesterName: request.requester_name,
          reportType: request.report_type,
          periodStart: request.period_start,
          periodEnd: request.period_end,
          totalRecords: request.total_records_count,
          reportUrl: reportUrl,
          rawDataUrl: rawDataUrl
        }
      });

      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado e o link foi enviado por email.',
      });

      fetchRequests();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao gerar relatório:', err);
      await supabase
        .from('data_sale_requests')
        .update({ status: 'failed' })
        .eq('id', request.id);

      toast({
        title: 'Erro ao gerar relatório',
        description: error.message || 'Erro ao gerar relatório',
        variant: 'destructive',
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.requester_organization?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Venda de Dados de Turismo
              </CardTitle>
              <CardDescription>
                Gerencie solicitações de relatórios de dados agregados para secretarias de turismo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Configuração de preço */}
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Preço do Relatório (R$)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button 
                    onClick={updatePrice} 
                    disabled={loadingPrice}
                    size="sm"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Atualizar Preço
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  R$ {parseFloat(price || '0').toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Preço atual</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou organização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="generated">Gerado</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Validação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma solicitação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.requester_name}</div>
                          <div className="text-sm text-muted-foreground">{request.requester_email}</div>
                          {request.requester_organization && (
                            <div className="text-xs text-muted-foreground">{request.requester_organization}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(request.period_start), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(request.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                        <div className="text-xs text-muted-foreground">{request.period_months} meses</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.report_type === 'explanatory' ? 'Tratado' : 
                           request.report_type === 'raw_data' ? 'Bruto' : 'Ambos'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getValidationBadge(request.data_validation_status)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitação de Dados</DialogTitle>
            <DialogDescription>
              Detalhes da solicitação e ações disponíveis
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Informações do solicitante */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Solicitante
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Nome</div>
                    <div className="font-medium">{selectedRequest.requester_name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedRequest.requester_email}</div>
                  </div>
                  {selectedRequest.requester_phone && (
                    <div>
                      <div className="text-muted-foreground">Telefone</div>
                      <div className="font-medium">{selectedRequest.requester_phone}</div>
                    </div>
                  )}
                  {selectedRequest.requester_organization && (
                    <div>
                      <div className="text-muted-foreground">Organização</div>
                      <div className="font-medium">{selectedRequest.requester_organization}</div>
                    </div>
                  )}
                  {selectedRequest.requester_city && (
                    <div>
                      <div className="text-muted-foreground">Cidade/Região</div>
                      <div className="font-medium">{selectedRequest.requester_city}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalhes da solicitação */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Detalhes da Solicitação
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Tipo de Relatório</div>
                    <Badge variant="outline" className="mt-1">
                      {selectedRequest.report_type === 'explanatory' ? 'Apenas Tratado' : 
                       selectedRequest.report_type === 'raw_data' ? 'Apenas Bruto' : 'Ambos'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Período</div>
                    <div className="font-medium mt-1">
                      {format(new Date(selectedRequest.period_start), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(selectedRequest.period_end), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Validação de Dados</div>
                    <div className="mt-1">{getValidationBadge(selectedRequest.data_validation_status)}</div>
                  </div>
                  {selectedRequest.total_records_count !== null && (
                    <div>
                      <div className="text-muted-foreground">Total de Registros</div>
                      <div className="font-medium mt-1">{selectedRequest.total_records_count.toLocaleString('pt-BR')}</div>
                    </div>
                  )}
                  {selectedRequest.data_sources_used && selectedRequest.data_sources_used.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Fontes de Dados</div>
                      <div className="mt-1">
                        {selectedRequest.data_sources_used.map((source, idx) => (
                          <Badge key={idx} variant="secondary" className="mr-1">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {selectedRequest.data_validation_notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Notas de Validação:</div>
                    <div className="text-sm mt-1">{selectedRequest.data_validation_notes}</div>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedRequest.status === 'pending' && (
                  <Button onClick={() => handleApprove(selectedRequest)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Solicitação
                  </Button>
                )}
                {selectedRequest.data_validation_status === 'pending' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleValidateData(selectedRequest)}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Validar Dados
                  </Button>
                )}
                {selectedRequest.status === 'approved' && selectedRequest.data_validation_status === 'valid' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleGenerateReport(selectedRequest)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                )}
                {selectedRequest.status === 'generated' && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Relatório
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

