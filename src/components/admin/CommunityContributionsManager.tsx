import React, { useState } from 'react';
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

interface CommunityContribution {
  id: string;
  author: string;
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
  const [contributions, setContributions] = useState<CommunityContribution[]>([
    {
      id: '1',
      author: 'Maria Silva',
      type: 'atrativo',
      title: 'Novo Mirante no Parque das Nações',
      description: 'Sugestão para construção de um mirante no ponto mais alto do parque, oferecendo vista panorâmica da cidade.',
      location: 'Parque das Nações Indígenas',
      status: 'pendente',
      votes: 23,
      comments: 5,
      created_at: '2024-09-28',
      category: 'Infraestrutura',
      priority: 'media'
    },
    {
      id: '2',
      author: 'João Santos',
      type: 'evento',
      title: 'Festival Gastronômico Regional',
      description: 'Proposta para um festival anual com pratos típicos da região, atraindo turistas e movimentando a economia local.',
      location: 'Centro Histórico',
      status: 'aprovado',
      votes: 45,
      comments: 12,
      created_at: '2024-09-25',
      category: 'Eventos',
      priority: 'alta'
    },
    {
      id: '3',
      author: 'Ana Costa',
      type: 'problema',
      title: 'Falta de Sinalização Turística',
      description: 'Muitos turistas se perdem devido à falta de placas indicativas para os principais pontos turísticos.',
      location: 'Toda a cidade',
      status: 'implementado',
      votes: 67,
      comments: 8,
      created_at: '2024-09-20',
      category: 'Infraestrutura',
      priority: 'alta'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'implementado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'atrativo': return <MapPin className="h-4 w-4" />;
      case 'evento': return <Calendar className="h-4 w-4" />;
      case 'experiencia': return <Star className="h-4 w-4" />;
      case 'problema': return <XCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredContributions = contributions.filter(contribution => {
    const matchesFilter = filter === 'all' || contribution.status === filter;
    const matchesSearch = contribution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id: string) => {
    setContributions(prev => 
      prev.map(contrib => 
        contrib.id === id ? { ...contrib, status: 'aprovado' as const } : contrib
      )
    );
  };

  const handleReject = (id: string) => {
    setContributions(prev => 
      prev.map(contrib => 
        contrib.id === id ? { ...contrib, status: 'rejeitado' as const } : contrib
      )
    );
  };

  const handleImplement = (id: string) => {
    setContributions(prev => 
      prev.map(contrib => 
        contrib.id === id ? { ...contrib, status: 'implementado' as const } : contrib
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Contribuições da Comunidade</h2>
          <p className="text-gray-600 mt-1">
            Gerencie sugestões, problemas e ideias enviadas pela comunidade
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {contributions.length} contribuições
        </Badge>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contribuições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filter === 'pendente' ? 'default' : 'outline'}
                onClick={() => setFilter('pendente')}
                size="sm"
              >
                Pendentes
              </Button>
              <Button
                variant={filter === 'aprovado' ? 'default' : 'outline'}
                onClick={() => setFilter('aprovado')}
                size="sm"
              >
                Aprovadas
              </Button>
              <Button
                variant={filter === 'implementado' ? 'default' : 'outline'}
                onClick={() => setFilter('implementado')}
                size="sm"
              >
                Implementadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contribuições */}
      <div className="space-y-4">
        {filteredContributions.map((contribution) => (
          <Card key={contribution.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(contribution.type)}
                      <h3 className="font-semibold text-gray-900">{contribution.title}</h3>
                    </div>
                    <Badge className={getStatusColor(contribution.status)}>
                      {contribution.status}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(contribution.priority)}>
                      {contribution.priority}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-4">{contribution.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {contribution.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {contribution.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {contribution.created_at}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {contribution.votes} votos
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {contribution.comments} comentários
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {contribution.status === 'pendente' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(contribution.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(contribution.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  {contribution.status === 'aprovado' && (
                    <Button
                      size="sm"
                      onClick={() => handleImplement(contribution.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Implementar
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{contributions.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contributions.filter(c => c.status === 'pendente').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contributions.filter(c => c.status === 'aprovado').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Implementadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contributions.filter(c => c.status === 'implementado').length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityContributionsManager;

