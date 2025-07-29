import React, { useEffect, useState } from 'react';
import { communityService } from '@/services/community/communityService';
import { CommunitySuggestion } from '@/types/community-contributions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, MapPin, ImageIcon, CalendarDays } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom'; // Importar Link
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Importar Select
import { Sparkles, Map } from 'lucide-react'; // Adicionar Sparkles e Map para ícones

interface CommunitySuggestionsListProps {
  defaultStatusFilter?: CommunitySuggestion['status'];
  defaultSortBy?: 'votes' | 'recent';
  showModerationActions?: boolean; // Para gestores
}

const CommunitySuggestionsList: React.FC<CommunitySuggestionsListProps> = ({
  defaultStatusFilter = 'approved',
  defaultSortBy = 'recent',
  showModerationActions = false,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CommunitySuggestion['status'] | 'all'>(defaultStatusFilter);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>(defaultSortBy);

  useEffect(() => {
    fetchSuggestions();
  }, [statusFilter, sortBy]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const fetchedSuggestions = await communityService.getSuggestions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: sortBy,
      });

      // Para cada sugestão, verificar se o usuário atual votou (se estiver logado)
      const suggestionsWithVoteStatus = await Promise.all(
        fetchedSuggestions.map(async (suggestion) => {
          let hasVoted = false;
          if (user?.id) {
            hasVoted = await communityService.hasUserVoted(suggestion.id, user.id);
          }
          return { ...suggestion, hasVoted };
        })
      );
      setSuggestions(suggestionsWithVoteStatus as CommunitySuggestion[]);

    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sugestões da comunidade.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId: string) => {
    if (!user) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para votar.",
        variant: "warning",
      });
      return;
    }
    try {
      const isVoting = await communityService.toggleVote(suggestionId);
      setSuggestions(prevSuggestions =>
        prevSuggestions.map(s =>
          s.id === suggestionId ? { ...s, votes_count: s.votes_count + (isVoting ? 1 : -1), hasVoted: isVoting } : s
        )
      );
      toast({
        title: "Voto Registrado!",
        description: isVoting ? "Sua voz foi ouvida." : "Voto removido.",
      });
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar seu voto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Ações de moderação (visíveis apenas se showModerationActions for true)
  const handleModerate = async (suggestionId: string, status: 'approved' | 'rejected' | 'implemented') => {
    // Implementar lógica de moderação aqui
    if (!user || !showModerationActions) return;
    try {
        await communityService.updateSuggestionStatus(suggestionId, status, `Ação ${status} via painel de moderação.`);
        toast({
            title: "Sucesso",
            description: `Sugestão ${status} com sucesso.`, 
        });
        fetchSuggestions(); // Recarregar a lista
    } catch (error) {
        console.error('Erro ao moderar sugestão:', error);
        toast({
            title: "Erro",
            description: "Não foi possível moderar a sugestão. Verifique suas permissões.",
            variant: "destructive",
        });
    }
  };

  const getCategoryIcon = (category: CommunitySuggestion['category']) => {
    switch (category) {
      case 'atrativo': return <MapPin size={16} className="text-ms-primary-blue" />;
      case 'evento': return <CalendarDays size={16} className="text-ms-primary-blue" />;
      case 'melhoria': return <Sparkles size={16} className="text-ms-primary-blue" />;
      case 'roteiro': return <Map size={16} className="text-ms-primary-blue" />;
      default: return null; // Ou um ícone padrão
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ordenação */}
      <Card>
        <CardContent className="p-4 flex gap-4 items-center">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CommunitySuggestion['status'] | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="implemented">Implementado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'votes' | 'recent')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais Recentes</SelectItem>
              <SelectItem value="votes">Mais Votados</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de Sugestões */}
      {loading ? (
        <div className="text-center py-8">Carregando sugestões...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma sugestão encontrada com os filtros aplicados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Link to={`/ms/contribuir/${suggestion.id}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ms-primary-blue rounded">
                    <CardTitle className="text-xl text-ms-primary-blue hover:text-ms-dark-blue transition-colors duration-200">{suggestion.title}</CardTitle>
                  </Link>
                  <Badge variant="secondary" className="capitalize">{suggestion.status}</Badge>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {getCategoryIcon(suggestion.category)}
                  {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{suggestion.description}</p>
                {suggestion.image_url && (
                  <img src={suggestion.image_url} alt={suggestion.title} className="w-full h-40 object-cover rounded-md mb-4" />
                )}
                {suggestion.location && (
                  <div className="text-sm text-gray-600 flex items-center mb-2">
                    <MapPin size={14} className="mr-1" />
                    {suggestion.location}
                  </div>
                )}
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleVote(suggestion.id)}
                      className={`flex items-center gap-1 ${suggestion.hasVoted ? 'text-ms-primary-blue' : 'text-gray-500'}`}
                      disabled={!user} // Desabilitar se não estiver logado
                    >
                      <ThumbsUp size={18} />
                      {suggestion.votes_count}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <MessageSquare size={18} />
                      {suggestion.comments_count}
                    </Button>
                  </div>
                  {showModerationActions && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" onClick={() => handleModerate(suggestion.id, 'approved')}>
                        Aprovar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleModerate(suggestion.id, 'rejected')}>
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunitySuggestionsList; 