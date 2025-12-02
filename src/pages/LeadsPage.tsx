import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ViaJARLeadsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const leadStats = {
    totalLeads: leads.length || 0,
    newLeads: leads.filter(l => l._uiStatus === 'Novo').length,
    contactedLeads: leads.filter(l => l._uiStatus === 'Em Contato').length,
    qualifiedLeads: leads.filter(l => l._uiStatus === 'Qualificado').length,
    totalValue: leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }),
  };

  useEffect(() => {
    const loadLeads = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Busca leads criados pelo usuário ou atribuídos a ele
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao carregar leads:', error);
          throw error;
        }

        const mapped = (data || []).map((lead: any) => {
          // Mapeia status de forma simples com base em status_id; para uso interno podemos
          // refinar depois com uma tabela de status.
          let uiStatus = 'Novo';
          if (lead.status_id === '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b') uiStatus = 'Em Contato';
          if (lead.status_id === '3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b') uiStatus = 'Qualificado';
          if (lead.status_id === '6b6b6b6b-6b6b-6b6b-6b6b-6b6b6b6b6b6b') uiStatus = 'Convertido';

          let uiPriority = 'Média';
          if (lead.priority_id === '1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c') uiPriority = 'Baixa';
          if (lead.priority_id === '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c') uiPriority = 'Alta';

          return {
            ...lead,
            _uiStatus: uiStatus,
            _uiPriority: uiPriority,
          };
        });

        setLeads(mapped);
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar leads',
          description: error.message || 'Não foi possível carregar seus leads.',
          variant: 'destructive',
        });
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [user, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Novo': return 'bg-blue-100 text-blue-800';
      case 'Em Contato': return 'bg-yellow-100 text-yellow-800';
      case 'Qualificado': return 'bg-green-100 text-green-800';
      case 'Convertido': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Leads</h1>
              <p className="text-gray-600 mt-2">
                Gerencie leads, parceiros e oportunidades de negócio
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{leadStats.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Novos</p>
                  <p className="text-2xl font-bold text-gray-900">{leadStats.newLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Phone className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Contato</p>
                  <p className="text-2xl font-bold text-gray-900">{leadStats.contactedLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Qualificados</p>
                  <p className="text-2xl font-bold text-gray-900">{leadStats.qualifiedLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">{leadStats.totalValue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contato">Em Contato</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Lista de Leads</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leads Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Carregando leads...</div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum lead encontrado ainda. Assim que você começar a gerar leads pelo
                    Descubra MS ou outros canais, eles aparecerão aqui.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads
                      .filter((lead) => {
                        const term = searchTerm.toLowerCase();
                        const matchesSearch =
                          !term ||
                          lead.name?.toLowerCase().includes(term) ||
                          lead.email?.toLowerCase().includes(term) ||
                          lead.company?.toLowerCase().includes(term);

                        const status = lead._uiStatus;
                        const matchesStatus =
                          statusFilter === 'all' ||
                          (statusFilter === 'novo' && status === 'Novo') ||
                          (statusFilter === 'contato' && status === 'Em Contato') ||
                          (statusFilter === 'qualificado' && status === 'Qualificado') ||
                          (statusFilter === 'convertido' && status === 'Convertido');

                        return matchesSearch && matchesStatus;
                      })
                      .map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{lead.name}</h3>
                              <p className="text-sm text-gray-600">
                                {lead.company || lead.custom_fields?.partner_name || '—'}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                {lead.email && (
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {lead.email}
                                  </span>
                                )}
                                {lead.phone && (
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {lead.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(lead._uiStatus)}>
                              {lead._uiStatus}
                            </Badge>
                            <Badge className={getPriorityColor(lead._uiPriority)}>
                              {lead._uiPriority}
                            </Badge>
                            {lead.value && (
                              <span className="text-sm font-medium text-gray-900">
                                {Number(lead.value).toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                  minimumFractionDigits: 0,
                                })}
                              </span>
                            )}
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Pipeline em Desenvolvimento</h3>
                  <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics em Desenvolvimento</h3>
                  <p className="text-gray-600">Esta funcionalidade será implementada em breve.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ViaJARLeadsPage;

