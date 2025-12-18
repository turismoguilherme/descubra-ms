/**
 * Contact Leads Management
 * Gerencia leads do formulário de contato
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function ContactLeadsManagement() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resolvingLeadId, setResolvingLeadId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

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
                    <TableCell className="font-medium">{lead.name}</TableCell>
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
                      {getRoleLabel(lead.custom_fields?.role)}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
