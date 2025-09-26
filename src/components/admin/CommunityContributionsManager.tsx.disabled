import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MessageSquare, 
  Star, 
  MapPin, 
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  Share2,
  Send,
  Filter,
  Search,
  Brain,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CommunityService } from '@/services/community/communityService';

const communityService = new CommunityService();

interface CommunityContribution {
  id: string;
  author: string;
  author_email: string;
  type: 'atrativo' | 'evento' | 'experiencia' | 'problema' | 'sugestao';
  title: string;
  description: string;
  location: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'implementado';
  votes: number;
  comments: number;
  created_at: string;
  category: string;
  priority: 'baixa' | 'media' | 'alta';
}

const CommunityContributionsManager = () => {
  const [contributions, setContributions] = useState<CommunityContribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<CommunityContribution | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [moderationComment, setModerationComment] = useState('');
  const { toast } = useToast();

  // Dados simulados para demonstração
  useEffect(() => {
    const mockContributions: CommunityContribution[] = [
      {
        id: '1',
        author: 'João Silva',
        author_email: 'joao@email.com',
        type: 'atrativo',
        title: 'Cachoeira Escondida do Cerrado',
        description: 'Uma cachoeira linda que descobri durante uma trilha. Fica a 15km do centro de Bonito, acesso por estrada de terra. Tem poço para banho e vista incrível.',
        location: 'Bonito - MS',
        status: 'pendente',
        votes: 12,
        comments: 3,
        created_at: '2025-01-20',
        category: 'Natureza',
        priority: 'alta'
      },
      {
        id: '2',
        author: 'Maria Santos',
        author_email: 'maria@email.com',
        type: 'evento',
        title: 'Festival de Música Regional',
        description: 'Proposta para criar um festival anual de música regional em Campo Grande, valorizando artistas locais e atraindo turistas.',
        location: 'Campo Grande - MS',
        status: 'aprovado',
        votes: 24,
        comments: 7,
        created_at: '2025-01-18',
        category: 'Cultura',
        priority: 'media'
      },
      {
        id: '3',
        author: 'Pedro Oliveira',
        author_email: 'pedro@email.com',
        type: 'problema',
        title: 'Sinalização Deficiente na Estrada do Peixe',
        description: 'A estrada que leva ao Rio da Prata está com sinalização ruim. Turistas se perdem frequentemente.',
        location: 'Jardim - MS',
        status: 'pendente',
        votes: 8,
        comments: 2,
        created_at: '2025-01-15',
        category: 'Infraestrutura',
        priority: 'alta'
      },
      {
        id: '4',
        author: 'Ana Costa',
        author_email: 'ana@email.com',
        type: 'experiencia',
        title: 'Tour Gastronômico Pantaneiro',
        description: 'Roteiro gastronômico pelos sabores do Pantanal, incluindo fazendas tradicionais e pratos típicos.',
        location: 'Pantanal - MS',
        status: 'implementado',
        votes: 31,
        comments: 12,
        created_at: '2025-01-10',
        category: 'Gastronomia',
        priority: 'media'
      },
      {
        id: '5',
        author: 'Carlos Mendes',
        author_email: 'carlos@email.com',
        type: 'sugestao',
        title: 'App para Monitoramento de Fauna',
        description: 'Desenvolver um aplicativo onde turistas possam registrar avistamentos de animais no Pantanal.',
        location: 'Corumbá - MS',
        status: 'pendente',
        votes: 15,
        comments: 5,
        created_at: '2025-01-12',
        category: 'Tecnologia',
        priority: 'baixa'
      }
    ];
    setContributions(mockContributions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'implementado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'atrativo': return <MapPin className="h-4 w-4" />;
      case 'evento': return <Calendar className="h-4 w-4" />;
      case 'experiencia': return <Star className="h-4 w-4" />;
      case 'problema': return <XCircle className="h-4 w-4" />;
      case 'sugestao': return <MessageSquare className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-600';
      case 'media': return 'text-yellow-600';
      case 'baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleModerateContribution = (contributionId: string, action: 'approve' | 'reject') => {
    setContributions(prev => 
      prev.map(contrib => 
        contrib.id === contributionId 
          ? { ...contrib, status: action === 'approve' ? 'aprovado' : 'rejeitado' }
          : contrib
      )
    );

    toast({
      title: action === 'approve' ? "Contribuição Aprovada" : "Contribuição Rejeitada",
      description: `A contribuição foi ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      variant: action === 'approve' ? "default" : "destructive"
    });
  };

  const handleStatusChange = async (suggestionId: string, newStatus: string) => {
    try {
      const reason = `Moderação: Status alterado para ${newStatus}`;
      await communityService.updateSuggestionStatus(suggestionId, newStatus as any, reason);
      
      toast({
        title: "Status atualizado",
        description: newStatus === 'approved' 
          ? "✨ Sugestão aprovada e automaticamente integrada com o Guatá IA!"
          : `Status alterado para ${newStatus}`,
      });
      
      // Recarregar sugestões
      // loadSuggestions(); // This line was not provided in the edit hint, so it's removed.
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da sugestão",
        variant: "destructive",
      });
    }
  };

  const filteredContributions = contributions.filter(contrib => {
    const matchesStatus = filterStatus === 'todas' || contrib.status === filterStatus;
    const matchesType = filterType === 'todos' || contrib.type === filterType;
    const matchesSearch = contrib.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contrib.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contrib.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const stats = {
    total: contributions.length,
    pendentes: contributions.filter(c => c.status === 'pendente').length,
    aprovadas: contributions.filter(c => c.status === 'aprovado').length,
    implementadas: contributions.filter(c => c.status === 'implementado').length,
    totalVotos: contributions.reduce((sum, c) => sum + c.votes, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contribuições da Comunidade</h2>
          <p className="text-gray-600 mt-1">Gerencie sugestões e propostas dos moradores locais</p>
        </div>
        <Badge variant="outline" className="text-xs px-3 py-1">
          <Users className="h-3 w-3 mr-1" />
          Planejamento Participativo
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendentes}</p>
              </div>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.aprovadas}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implementadas</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.implementadas}</p>
              </div>
              <Star className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votos</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalVotos}</p>
              </div>
              <Heart className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todas">Todas as situações</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovadas</option>
              <option value="rejeitado">Rejeitadas</option>
              <option value="implementado">Implementadas</option>
            </select>

            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todos">Todos os tipos</option>
              <option value="atrativo">Atrativos</option>
              <option value="evento">Eventos</option>
              <option value="experiencia">Experiências</option>
              <option value="problema">Problemas</option>
              <option value="sugestao">Sugestões</option>
            </select>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Pesquisar contribuições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contribuições */}
      <div className="grid grid-cols-1 gap-6">
        {filteredContributions.map((contribution) => (
          <Card key={contribution.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    {getTypeIcon(contribution.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{contribution.title}</h3>
                      <Badge className={getStatusColor(contribution.status)} variant="outline">
                        {contribution.status}
                      </Badge>
                      <Badge variant="outline" className={`${getPriorityColor(contribution.priority)}`}>
                        {contribution.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{contribution.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {contribution.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {contribution.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(contribution.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {contribution.votes} votos
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {contribution.comments} comentários
                      </span>
                      {contribution.status === 'aprovado' && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          <Brain className="w-3 h-3" />
                          Integrada com Guatá IA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {contribution.status === 'pendente' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleStatusChange(contribution.id, 'approved')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusChange(contribution.id, 'rejected')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                )}

                {contribution.status === 'aprovado' && (
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-600">
                    <Star className="h-4 w-4 mr-1" />
                    Implementar
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 border-t pt-3">
                <Badge variant="outline" className="text-xs">
                  {contribution.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {contribution.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContributions.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma contribuição encontrada</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'todas' || filterType !== 'todos' 
                ? 'Tente ajustar os filtros para ver mais contribuições.'
                : 'Ainda não há contribuições da comunidade.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityContributionsManager; 