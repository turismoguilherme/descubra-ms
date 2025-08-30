import React, { useEffect, useState } from 'react';
import { communityService } from '@/services/community/communityService';
import { CommunitySuggestion } from '@/types/community-contributions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const CommunityModerationPanel: React.FC = () => {
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<CommunitySuggestion['status'] | 'all'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, [filterStatus]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const fetched = await communityService.getSuggestions({ status: filterStatus === 'all' ? undefined : filterStatus, sortBy: 'recent' });
      setSuggestions(fetched);
    } catch (error) {
      console.error('Erro ao carregar sugestões para moderação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sugestões para moderação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (suggestionId: string, status: CommunitySuggestion['status']) => {
    setLoading(true);
    try {
      await communityService.updateSuggestionStatus(suggestionId, status as any, `Sugestão ${status} pelo painel de moderação.`);
      toast({
        title: "Sucesso",
        description: `Sugestão ${status} com sucesso.`,
      });
      fetchSuggestions(); // Recarrega a lista
    } catch (error) {
      console.error('Erro ao moderar sugestão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível moderar a sugestão. Verifique as permissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: CommunitySuggestion['status']) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'implemented': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel de Moderação da Comunidade</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('pending')}
          >
            Pendentes
          </Button>
          <Button
            variant={filterStatus === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('approved')}
          >
            Aprovadas
          </Button>
          <Button
            variant={filterStatus === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejeitadas
          </Button>
          <Button
            variant={filterStatus === 'implemented' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('implemented')}
          >
            Implementadas
          </Button>
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            Todas
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Carregando sugestões para moderação...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma sugestão encontrada com o filtro atual.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(suggestion.status)} className="capitalize">{suggestion.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{new Date(suggestion.created_at).toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{suggestion.description}</p>
                {suggestion.image_url && (
                  <img src={suggestion.image_url} alt={suggestion.title} className="w-full h-48 object-cover rounded-md mb-4" />
                )}
                {suggestion.location && (
                  <p className="text-sm text-gray-600"><span className="font-semibold">Localização:</span> {suggestion.location}</p>
                )}
                <p className="text-sm text-gray-600"><span className="font-semibold">Categoria:</span> {suggestion.category}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Votos:</span> {suggestion.votes_count}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Comentários:</span> {suggestion.comments_count}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestion.status === 'pending' && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default">Aprovar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza que deseja aprovar?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação tornará a sugestão visível para a comunidade.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleModerate(suggestion.id, 'approved')}>Aprovar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Rejeitar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza que deseja rejeitar?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação removerá a sugestão da visualização pública.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleModerate(suggestion.id, 'rejected')}>Rejeitar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  {(suggestion.status === 'approved' || suggestion.status === 'rejected') && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="secondary">Marcar como Implementada</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Marcar como Implementada?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação indica que a sugestão foi realizada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleModerate(suggestion.id, 'implemented')}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default CommunityModerationPanel; 