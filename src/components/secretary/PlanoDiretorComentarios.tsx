/**
 * Plano Diretor Comentários Component
 * Componente para exibir e gerenciar comentários em seções do plano
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { planoDiretorService } from '@/services/public/planoDiretorService';

interface PlanoDiretorComentariosProps {
  planoId: string;
  secao: string;
  secaoId?: string;
  onUpdate?: () => void;
}

const PlanoDiretorComentarios: React.FC<PlanoDiretorComentariosProps> = ({
  planoId,
  secao,
  secaoId,
  onUpdate
}) => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadComentarios();
  }, [planoId, secao, secaoId]);

  const loadComentarios = async () => {
    try {
      setLoading(true);
      const data = await planoDiretorService.getComentarios(planoId, secao, secaoId);
      setComentarios(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComentario = async () => {
    if (!novoComentario.trim()) return;

    try {
      setSending(true);
      await planoDiretorService.createComentario(planoId, {
        secao,
        secaoId,
        comentario: novoComentario
      });

      setNovoComentario('');
      await loadComentarios();
      onUpdate?.();
      
      toast({
        title: 'Sucesso',
        description: 'Comentário adicionado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o comentário.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleResolve = async (id: string, resolvido: boolean) => {
    try {
      await planoDiretorService.updateComentario(id, { resolvido });
      await loadComentarios();
      onUpdate?.();
      
      toast({
        title: 'Sucesso',
        description: `Comentário ${resolvido ? 'resolvido' : 'reaberto'}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o comentário.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      await planoDiretorService.deleteComentario(id);
      await loadComentarios();
      onUpdate?.();
      
      toast({
        title: 'Sucesso',
        description: 'Comentário excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comentário.',
        variant: 'destructive'
      });
    }
  };

  const comentariosNaoResolvidos = comentarios.filter(c => !c.resolvido);
  const comentariosResolvidos = comentarios.filter(c => c.resolvido);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Comentários
          {comentariosNaoResolvidos.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {comentariosNaoResolvidos.length} não resolvido(s)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulário de novo comentário */}
        <div className="space-y-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={novoComentario}
            onChange={(e) => setNovoComentario(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleSendComentario}
            disabled={sending || !novoComentario.trim()}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar Comentário'}
          </Button>
        </div>

        {/* Lista de comentários */}
        {loading ? (
          <p className="text-gray-600 text-sm">Carregando comentários...</p>
        ) : comentarios.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Nenhum comentário ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          <div className="space-y-3">
            {/* Comentários não resolvidos */}
            {comentariosNaoResolvidos.map((comentario) => (
              <Card key={comentario.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {comentario.comentario}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(comentario.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {(user?.id === comentario.autorId || userProfile?.role === 'admin') && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolve(comentario.id, true)}
                            title="Marcar como resolvido"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                          {user?.id === comentario.autorId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(comentario.id)}
                              title="Excluir comentário"
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Comentários resolvidos (colapsados) */}
            {comentariosResolvidos.length > 0 && (
              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  {comentariosResolvidos.length} comentário(s) resolvido(s)
                </summary>
                <div className="space-y-2 mt-2">
                  {comentariosResolvidos.map((comentario) => (
                    <Card key={comentario.id} className="border-l-4 border-l-gray-300 opacity-75">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-gray-500">Resolvido</span>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {comentario.comentario}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(comentario.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolve(comentario.id, false)}
                            title="Reabrir comentário"
                          >
                            <XCircle className="h-4 w-4 text-gray-400" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoDiretorComentarios;

