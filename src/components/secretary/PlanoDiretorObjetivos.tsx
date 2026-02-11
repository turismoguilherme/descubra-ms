// @ts-nocheck
/**
 * Plano Diretor Objetivos Component
 * Gerenciamento de objetivos estratégicos
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, Edit, Trash2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Objetivo } from '@/services/public/planoDiretorService';
import { PlanoDiretorAIService } from '@/services/ai/planoDiretorAIService';
import ObjetivoForm from './ObjetivoForm';
import PlanoDiretorComentarios from './PlanoDiretorComentarios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const planoDiretorAIService = new PlanoDiretorAIService();

interface PlanoDiretorObjetivosProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorObjetivos: React.FC<PlanoDiretorObjetivosProps> = ({
  planoId,
  onUpdate
}) => {
  const { toast } = useToast();
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingObjetivo, setEditingObjetivo] = useState<Objetivo | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [suggestedObjetivosList, setSuggestedObjetivosList] = useState<any[]>([]);

  useEffect(() => {
    loadObjetivos();
  }, [planoId]);

  const loadObjetivos = async () => {
    try {
      setLoading(true);
      const data = await planoDiretorService.getObjetivos(planoId);
      setObjetivos(data);
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os objetivos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestWithAI = async () => {
    try {
      setSuggesting(true);
      // Buscar diagnóstico para contexto
      const plano = await planoDiretorService.getPlanoDiretorById(planoId);
      if (!plano) return;

      // Gerar diagnóstico temporário para sugestões
      const dados = await planoDiretorService.collectDataForDiagnostic(plano.municipio, plano.municipioUf);
      const diagnostico = await planoDiretorService.generateDiagnosticoIA(dados);
      
      const sugestoes = await planoDiretorAIService.suggestObjetivos(diagnostico, plano.municipio);
      
      if (sugestoes.length > 0) {
        // Mostrar dialog com sugestões
        setSuggestedObjetivosList(sugestoes);
        setShowSuggestionsDialog(true);
      } else {
        toast({
          title: 'Atenção',
          description: 'Nenhuma sugestão foi gerada. Tente novamente ou crie manualmente.',
        });
      }
    } catch (error) {
      console.error('Erro ao sugerir objetivos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar sugestões.',
        variant: 'destructive'
      });
    } finally {
      setSuggesting(false);
    }
  };

  const handleCreate = () => {
    setEditingObjetivo(null);
    setShowForm(true);
  };

  const handleEdit = (objetivo: Objetivo) => {
    setEditingObjetivo(objetivo);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este objetivo?')) return;

    try {
      await planoDiretorService.deleteObjetivo(id);
      await loadObjetivos();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Objetivo excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir objetivo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o objetivo.',
        variant: 'destructive'
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingObjetivo(null);
    loadObjetivos();
    onUpdate?.();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planejado: 'bg-gray-500',
      em_andamento: 'bg-blue-500',
      concluido: 'bg-green-500',
      atrasado: 'bg-red-500',
      cancelado: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      crescimento: 'bg-blue-100 text-blue-800',
      diversificacao: 'bg-purple-100 text-purple-800',
      infraestrutura: 'bg-orange-100 text-orange-800',
      sustentabilidade: 'bg-green-100 text-green-800',
      outro: 'bg-gray-100 text-gray-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (showForm) {
    return (
      <ObjetivoForm
        planoId={planoId}
        objetivo={editingObjetivo}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Objetivos Estratégicos
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleSuggestWithAI} disabled={suggesting} variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                {suggesting ? 'Gerando...' : 'Sugerir com IA'}
              </Button>
              <Button onClick={handleCreate} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Objetivo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Carregando objetivos...</p>
          ) : objetivos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum objetivo cadastrado ainda.</p>
              <p className="text-sm mt-2">Clique em "Novo Objetivo" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {objetivos.map((objetivo) => (
                <Card key={objetivo.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{objetivo.titulo}</h3>
                          <Badge className={getCategoriaColor(objetivo.categoria)}>
                            {objetivo.categoria}
                          </Badge>
                          <Badge className={getStatusColor(objetivo.status)}>
                            {objetivo.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{objetivo.descricao}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            Meta: <strong>{objetivo.meta.toLocaleString()} {objetivo.unidade}</strong>
                          </span>
                          <span className="text-gray-600">
                            Prazo: <strong>{new Date(objetivo.prazo).toLocaleDateString('pt-BR')}</strong>
                          </span>
                          <span className="text-gray-600">
                            Progresso: <strong>{objetivo.progresso.toFixed(0)}%</strong>
                          </span>
                        </div>
                        {objetivo.progresso > 0 && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${objetivo.progresso}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(objetivo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(objetivo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comentários gerais da seção */}
      <PlanoDiretorComentarios
        planoId={planoId}
        secao="objetivos"
        onUpdate={onUpdate}
      />

      {/* AlertDialog para sugestões de objetivos */}
      <AlertDialog open={showSuggestionsDialog} onOpenChange={setShowSuggestionsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sugestões de metas geradas:</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 mt-4">
                <ul className="list-disc list-inside space-y-1 text-sm text-left">
                  {suggestedObjetivosList.map((sugestao, index) => (
                    <li key={index}>
                      {sugestao.titulo} ({sugestao.meta}{sugestao.unidade}) - Prazo: {format(new Date(sugestao.prazo), 'dd/MM/yyyy', { locale: ptBR })}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-medium">Deseja criar essas metas?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  // Criar os objetivos sugeridos
                  for (const sugestao of suggestedObjetivosList) {
                    await planoDiretorService.createObjetivo(planoId, sugestao);
                  }
                  
                  await loadObjetivos();
                  onUpdate?.();
                  
                  toast({
                    title: 'Sugestões aplicadas',
                    description: `${suggestedObjetivosList.length} objetivo(s) criado(s) com sugestões de IA. Você pode editar cada um.`,
                  });

                  setShowSuggestionsDialog(false);
                  setSuggestedObjetivosList([]);
                } catch (error) {
                  console.error('Erro ao criar objetivos:', error);
                  toast({
                    title: 'Erro',
                    description: 'Não foi possível criar os objetivos.',
                    variant: 'destructive'
                  });
                }
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlanoDiretorObjetivos;

