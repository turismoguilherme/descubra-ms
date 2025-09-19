import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { communityService } from '@/services/community/communityService';
import { CommunitySuggestion, CommunityComment } from '@/types/community-contributions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, MapPin, ImageIcon, CalendarDays, Sparkles, Map } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const CommunitySuggestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<CommunitySuggestion | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSuggestionAndComments();
    }
  }, [id]);

  const fetchSuggestionAndComments = async () => {
    setLoading(true);
    try {
      const fetchedSuggestion = await communityService.getSuggestionById(id!);
      setSuggestion(fetchedSuggestion);

      if (fetchedSuggestion) {
        const fetchedComments = await communityService.getCommentsBySuggestionId(fetchedSuggestion.id);
        setComments(fetchedComments);

        // Verificar status do voto para o usuário logado
        if (user?.id && fetchedSuggestion) {
          const hasVoted = await communityService.hasUserVoted(fetchedSuggestion.id, user.id);
          setSuggestion(prev => prev ? { ...prev, hasVoted } : null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da sugestão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da sugestão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user || !suggestion) return;
    try {
      const isVoting = await communityService.toggleVote(suggestion.id);
      setSuggestion(prev => prev ? { ...prev, votes_count: prev.votes_count + (isVoting ? 1 : -1), hasVoted: isVoting } : null);
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !suggestion || !newComment.trim()) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado e digitar um comentário.",
        variant: "destructive",
      });
      return;
    }

    setCommentLoading(true);
    try {
      const addedComment = await communityService.addComment(suggestion.id, newComment.trim());
      setComments(prevComments => [...prevComments, addedComment]);
      setNewComment('');
      // Atualizar a contagem de comentários na sugestão exibida
      setSuggestion(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
      toast({
        title: "Comentário Adicionado!",
        description: "Seu comentário foi publicado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar seu comentário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const getCategoryIcon = (category: CommunitySuggestion['category']) => {
    switch (category) {
      case 'atrativo': return <MapPin size={18} className="text-ms-primary-blue" />;
      case 'evento': return <CalendarDays size={18} className="text-ms-primary-blue" />;
      case 'melhoria': return <Sparkles size={18} className="text-ms-primary-blue" />;
      case 'roteiro': return <Map size={18} className="text-ms-primary-blue" />;
      default: return null; // Ou um ícone padrão
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ms-primary-blue"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center text-center">
          <p className="text-gray-600 text-lg">Sugestão não encontrada.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="ms-container max-w-4xl mx-auto space-y-8">
          {/* Detalhes da Sugestão */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl font-bold text-ms-primary-blue">{suggestion.title}</CardTitle>
                <Badge variant="secondary" className="capitalize">{suggestion.status}</Badge>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                {getCategoryIcon(suggestion.category)}
                {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                {suggestion.location && (
                  <span className="flex items-center ml-4">
                    <MapPin size={16} className="mr-1" />
                    {suggestion.location}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-4">Por <span className="font-medium">{suggestion.user_id}</span> em {new Date(suggestion.created_at).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              {suggestion.image_url && (
                <img 
                  src={suggestion.image_url} 
                  alt={suggestion.title} 
                  className="w-full h-64 object-cover rounded-md mb-6 shadow-md"
                />
              )}
              <p className="text-gray-700 leading-relaxed mb-6">{suggestion.description}</p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleVote}
                  className={`flex items-center gap-1 ${suggestion.hasVoted ? 'text-ms-primary-blue' : 'text-gray-500'}`}
                  disabled={!user} // Desabilitar se não estiver logado
                >
                  <ThumbsUp size={20} />
                  {suggestion.votes_count}
                </Button>
                <div className="flex items-center gap-1 text-gray-500">
                  <MessageSquare size={20} />
                  {suggestion.comments_count}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de Comentários */}
          <Card>
            <CardHeader>
              <CardTitle>Comentários ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <p className="font-semibold text-sm mb-1">{comment.user_id}</p> {/* Substituir por nome real do usuário futuramente */}
                      <p className="text-gray-700 text-sm">{comment.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
              
              {user ? (
                <form onSubmit={handleAddComment} className="space-y-4">
                  <Textarea
                    placeholder="Adicione seu comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    required
                    disabled={commentLoading}
                  />
                  <Button type="submit" disabled={commentLoading}>
                    {commentLoading ? 'Enviando...' : 'Enviar Comentário'}
                  </Button>
                </form>
              ) : (
                <p className="text-center text-gray-600">Faça login para adicionar um comentário.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunitySuggestionDetail; 