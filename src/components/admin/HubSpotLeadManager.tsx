import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  DollarSign, 
  Calendar,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Send
} from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  company: string;
  phone: string;
  dealstage: string;
  amount: number;
  createdate: string;
  lastactivity?: string;
  source?: string;
}

interface CreateLeadData {
  email: string;
  firstname: string;
  lastname: string;
  company: string;
  phone: string;
  dealstage: string;
  amount: number;
  source: string;
}

const HubSpotLeadManager = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Estado para formulário de criação
  const [createForm, setCreateForm] = useState<CreateLeadData>({
    email: '',
    firstname: '',
    lastname: '',
    company: '',
    phone: '',
    dealstage: 'new',
    amount: 0,
    source: 'website'
  });

  // Estágios do pipeline de vendas
  const dealStages = [
    { value: 'new', label: 'Novo Lead', color: 'bg-gray-100 text-gray-800' },
    { value: 'qualified', label: 'Qualificado', color: 'bg-blue-100 text-blue-800' },
    { value: 'proposal', label: 'Proposta Enviada', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'negotiation', label: 'Em Negociação', color: 'bg-orange-100 text-orange-800' },
    { value: 'closed_won', label: 'Fechado (Ganho)', color: 'bg-green-100 text-green-800' },
    { value: 'closed_lost', label: 'Fechado (Perdido)', color: 'bg-red-100 text-red-800' }
  ];

  // Fontes de leads
  const leadSources = [
    { value: 'website', label: 'Website' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'referral', label: 'Indicação' },
    { value: 'event', label: 'Evento' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'email_campaign', label: 'Campanha de Email' }
  ];

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      
      // Mock data para demonstração
      const mockLeads: Lead[] = [
        {
          id: 'lead_1',
          email: 'secretaria.turismo@ms.gov.br',
          firstname: 'Secretaria',
          lastname: 'de Turismo MS',
          company: 'Governo de Mato Grosso do Sul',
          phone: '(67) 3318-9000',
          dealstage: 'closed_won',
          amount: 10000,
          createdate: '2024-01-15',
          lastactivity: '2024-01-20',
          source: 'website'
        },
        {
          id: 'lead_2',
          email: 'turismo@mt.gov.br',
          firstname: 'Secretaria',
          lastname: 'de Turismo MT',
          company: 'Governo de Mato Grosso',
          phone: '(65) 3613-9000',
          dealstage: 'proposal',
          amount: 5000,
          createdate: '2024-01-18',
          lastactivity: '2024-01-22',
          source: 'linkedin'
        },
        {
          id: 'lead_3',
          email: 'turismo@go.gov.br',
          firstname: 'Secretaria',
          lastname: 'de Turismo GO',
          company: 'Governo de Goiás',
          phone: '(62) 3201-9000',
          dealstage: 'qualified',
          amount: 8000,
          createdate: '2024-01-20',
          lastactivity: '2024-01-23',
          source: 'referral'
        },
        {
          id: 'lead_4',
          email: 'turismo@sp.gov.br',
          firstname: 'Secretaria',
          lastname: 'de Turismo SP',
          company: 'Governo de São Paulo',
          phone: '(11) 3120-9000',
          dealstage: 'new',
          amount: 15000,
          createdate: '2024-01-25',
          lastactivity: '2024-01-25',
          source: 'website'
        }
      ];

      setLeads(mockLeads);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    try {
      setCreating(true);
      
      // Simular criação de lead
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newLead: Lead = {
        id: `lead_${Date.now()}`,
        email: createForm.email,
        firstname: createForm.firstname,
        lastname: createForm.lastname,
        company: createForm.company,
        phone: createForm.phone,
        dealstage: createForm.dealstage,
        amount: createForm.amount,
        createdate: new Date().toISOString().split('T')[0],
        lastactivity: new Date().toISOString().split('T')[0],
        source: createForm.source
      };

      setLeads(prev => [newLead, ...prev]);
      setShowCreateForm(false);
      setCreateForm({
        email: '',
        firstname: '',
        lastname: '',
        company: '',
        phone: '',
        dealstage: 'new',
        amount: 0,
        source: 'website'
      });

      toast({
        title: "Sucesso!",
        description: "Lead criado com sucesso no HubSpot",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateDealStage = async (leadId: string, newStage: string) => {
    try {
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId ? { ...lead, dealstage: newStage } : lead
        )
      );

      toast({
        title: "Sucesso!",
        description: "Estágio do lead atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estágio",
        variant: "destructive",
      });
    }
  };

  const handleSendProposal = async (leadId: string) => {
    try {
      // Simular envio de proposta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId ? { ...lead, dealstage: 'proposal' } : lead
        )
      );

      toast({
        title: "Proposta Enviada!",
        description: "Proposta enviada com sucesso para o lead",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a proposta",
        variant: "destructive",
      });
    }
  };

  const getStageBadge = (stage: string) => {
    const stageInfo = dealStages.find(s => s.value === stage);
    if (!stageInfo) return <Badge variant="outline">{stage}</Badge>;

    return (
      <Badge className={stageInfo.color}>
        {stage === 'new' && <Clock className="w-3 h-3 mr-1" />}
        {stage === 'qualified' && <Target className="w-3 h-3 mr-1" />}
        {stage === 'proposal' && <Send className="w-3 h-3 mr-1" />}
        {stage === 'negotiation' && <Edit className="w-3 h-3 mr-1" />}
        {stage === 'closed_won' && <CheckCircle className="w-3 h-3 mr-1" />}
        {stage === 'closed_lost' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {stageInfo.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar leads baseado no estágio e termo de busca
  const filteredLeads = leads.filter(lead => {
    const matchesStage = filterStage === 'all' || lead.dealstage === filterStage;
    const matchesSearch = 
      lead.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStage && matchesSearch;
  });

  // Estatísticas
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !['closed_won', 'closed_lost'].includes(l.dealstage)).length;
  const totalValue = leads.reduce((sum, l) => sum + l.amount, 0);
  const conversionRate = totalLeads > 0 ? (leads.filter(l => l.dealstage === 'closed_won').length / totalLeads * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Leads - HubSpot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Carregando leads...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Ativos</p>
                <p className="text-2xl font-bold">{activeLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          <div>
            <Label htmlFor="filter-stage">Filtrar por Estágio</Label>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estágios</SelectItem>
                {dealStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Nome, empresa ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Formulário de Criação */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@estado.gov.br"
                  required
                />
              </div>

              <div>
                <Label htmlFor="firstname">Nome *</Label>
                <Input
                  id="firstname"
                  value={createForm.firstname}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, firstname: e.target.value }))}
                  placeholder="Secretaria"
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastname">Sobrenome *</Label>
                <Input
                  id="lastname"
                  value={createForm.lastname}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, lastname: e.target.value }))}
                  placeholder="de Turismo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  value={createForm.company}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Governo do Estado"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 3120-9000"
                />
              </div>

              <div>
                <Label htmlFor="amount">Valor Estimado</Label>
                <Input
                  id="amount"
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  placeholder="5000"
                />
              </div>

              <div>
                <Label htmlFor="dealstage">Estágio do Deal</Label>
                <Select
                  value={createForm.dealstage}
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, dealstage: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dealStages.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Fonte do Lead</Label>
                <Select
                  value={createForm.source}
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leadSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateLead} disabled={creating}>
                {creating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Lead'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum lead encontrado com os filtros aplicados
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold">
                            {lead.firstname} {lead.lastname}
                          </p>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                          <p className="text-sm text-gray-600">{lead.company}</p>
                          {lead.phone && (
                            <p className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className="font-semibold text-lg">
                            {formatCurrency(lead.amount)}
                          </p>
                          <p className="text-xs text-gray-500">valor estimado</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      {getStageBadge(lead.dealstage)}
                      
                      <div className="text-sm text-gray-600">
                        <p>Criado em: {formatDate(lead.createdate)}</p>
                        {lead.lastactivity && (
                          <p>Última atividade: {formatDate(lead.lastactivity)}</p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {lead.dealstage === 'qualified' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendProposal(lead.id)}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Enviar Proposta
                          </Button>
                        )}
                        
                        {lead.dealstage !== 'closed_won' && lead.dealstage !== 'closed_lost' && (
                          <Select
                            value={lead.dealstage}
                            onValueChange={(value) => handleUpdateDealStage(lead.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dealStages.map((stage) => (
                                <SelectItem key={stage.value} value={stage.value}>
                                  {stage.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Lead */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Detalhes do Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <p className="font-medium">{selectedLead.firstname} {selectedLead.lastname}</p>
                  </div>
                  
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  
                  <div>
                    <Label>Empresa</Label>
                    <p className="font-medium">{selectedLead.company}</p>
                  </div>
                  
                  <div>
                    <Label>Telefone</Label>
                    <p className="font-medium">{selectedLead.phone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <Label>Estágio do Deal</Label>
                    <div className="mt-1">{getStageBadge(selectedLead.dealstage)}</div>
                  </div>
                  
                  <div>
                    <Label>Valor Estimado</Label>
                    <p className="font-medium text-lg">{formatCurrency(selectedLead.amount)}</p>
                  </div>
                  
                  <div>
                    <Label>Data de Criação</Label>
                    <p className="font-medium">{formatDate(selectedLead.createdate)}</p>
                  </div>
                  
                  <div>
                    <Label>Última Atividade</Label>
                    <p className="font-medium">
                      {selectedLead.lastactivity ? formatDate(selectedLead.lastactivity) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setSelectedLead(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HubSpotLeadManager;

