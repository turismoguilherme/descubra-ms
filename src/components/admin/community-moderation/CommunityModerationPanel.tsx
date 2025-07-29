import React, { useEffect, useState } from 'react';
import { communityService } from '@/services/community/communityService';
import { CommunitySuggestion } from '@/types/community-contributions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, MapPin, CalendarDays, Map, MessageSquare, ThumbsUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

interface CommunityModerationPanelProps {
  onClose?: () => void; // Callback para quando o modal for fechado ou ação concluída
}

const CommunityModerationPanel: React.FC<CommunityModerationPanelProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CommunitySuggestion['status'] | 'all'>('pending');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('recent');

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
      setSuggestions(fetchedSuggestions);
    } catch (error) {
      console.error('Erro ao carregar sugestões para moderação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sugestões de comunidade para moderação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (suggestionId: string, newStatus: 'approved' | 'rejected' | 'implemented', reason?: string) => {
    try {
      await communityService.updateSuggestionStatus(suggestionId, newStatus, reason);
      toast({
        title: "Sucesso",
        description: `Sugestão ${newStatus === 'approved' ? 'aprovada' : newStatus === 'rejected' ? 'rejeitada' : 'marcada como implementada'} com sucesso.`, 
      });
      fetchSuggestions(); // Recarregar a lista
      if (onClose) onClose(); // Chamar callback se fornecido
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
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-ms-primary-blue">Moderação de Sugestões da Comunidade</h2>

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

      {loading ? (
        <div className="text-center py-8">Carregando sugestões para moderação...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma sugestão encontrada para moderação com os filtros aplicados.
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
                    <div className="flex items-center gap-1 text-gray-500">
                      <ThumbsUp size={18} />
                      {suggestion.votes_count}
                    </div>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
                      <Link to={`/ms/contribuir/${suggestion.id}#comments`}>
                        <MessageSquare size={18} />
                        {suggestion.comments_count}
                      </Link>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {suggestion.status === 'pending' && (
                      <>
                        <Button size="sm" variant="default" onClick={() => handleModerate(suggestion.id, 'approved')}>Aprovar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleModerate(suggestion.id, 'rejected')}>Rejeitar</Button>
                      </>
                    )}
                    {suggestion.status === 'approved' && (
                        <Button size="sm" variant="secondary" onClick={() => handleModerate(suggestion.id, 'implemented')}>Marcar como Implementado</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityModerationPanel; 