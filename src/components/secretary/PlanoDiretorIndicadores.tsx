// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { TrendingUp, Plus, Edit, Trash2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Indicador } from '@/services/public/planoDiretorService';

interface PlanoDiretorIndicadoresProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorIndicadores: React.FC<PlanoDiretorIndicadoresProps> = ({ planoId, onUpdate }) => {
  const { toast } = useToast();
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestingFor, setSuggestingFor] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ modulo: string; valor: number; descricao: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadIndicadores();
  }, [planoId]);

  const loadIndicadores = async () => {
    try {
      setLoading(true);
      const data = await planoDiretorService.getIndicadores(planoId);
      setIndicadores(data);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateValue = async (id: string, novoValor: number) => {
    try {
      const indicador = indicadores.find(i => i.id === id);
      if (!indicador) return;

      await planoDiretorService.updateIndicador(id, {
        ...indicador,
        valorAtual: novoValor
      });
      
      await loadIndicadores();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Valor do indicador atualizado.',
      });
    } catch (error) {
      console.error('Erro ao atualizar indicador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o indicador.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este indicador?')) return;

    try {
      await planoDiretorService.deleteIndicador(id);
      await loadIndicadores();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Indicador excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir indicador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o indicador.',
        variant: 'destructive'
      });
    }
  };

  const calculateProgress = (valorAtual: number, meta: number) => {
    if (meta === 0) return 0;
    return Math.min(100, (valorAtual / meta) * 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSuggestData = async (indicadorId: string) => {
    try {
      setSuggestingFor(indicadorId);
      setLoadingSuggestions(true);
      setSuggestions([]);

      // Buscar sugestões de dados dos módulos
      const sugestoes = await planoDiretorService.suggestIndicatorData(indicadorId);
      setSuggestions(sugestoes);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar sugestões de dados.',
        variant: 'destructive'
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAcceptSuggestion = async (sugestao: { modulo: string; valor: number; descricao: string }) => {
    if (!suggestingFor) return;

    try {
      const indicador = indicadores.find(i => i.id === suggestingFor);
      if (!indicador) return;

      await planoDiretorService.updateIndicador(suggestingFor, {
        ...indicador,
        valorAtual: sugestao.valor
      });

      await loadIndicadores();
      onUpdate?.();
      setSuggestingFor(null);
      setSuggestions([]);

      toast({
        title: 'Sucesso',
        description: `Valor atualizado com dados de ${sugestao.modulo}.`,
      });
    } catch (error) {
      console.error('Erro ao aceitar sugestão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o indicador.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Indicadores e KPIs
            </CardTitle>
            <Button onClick={loadIndicadores} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Carregando indicadores...</p>
          ) : indicadores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum indicador cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicadores.map((indicador) => {
                const progress = calculateProgress(indicador.valorAtual, indicador.meta);
                return (
                  <Card key={indicador.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{indicador.nome}</h3>
                          <p className="text-sm text-gray-600 mb-3">{indicador.descricao}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestData(indicador.id)}
                            title="Sugerir dados dos módulos"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(indicador.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Atual / Meta</span>
                          <span className="text-lg font-bold">
                            {indicador.valorAtual.toLocaleString()} / {indicador.meta.toLocaleString()} {indicador.unidade}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`${getProgressColor(progress)} h-3 rounded-full transition-all`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {progress.toFixed(1)}% da meta
                          </span>
                          <Badge variant={progress >= 100 ? 'default' : progress >= 80 ? 'secondary' : 'outline'}>
                            {progress >= 100 ? 'Meta atingida' : progress >= 80 ? 'No caminho' : 'Abaixo da meta'}
                          </Badge>
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                          <p>Frequência: {indicador.frequencia}</p>
                          {indicador.fonte && <p>Fonte: {indicador.fonte}</p>}
                          {indicador.ultimaAtualizacao && (
                            <p>
                              Última atualização: {new Date(indicador.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Sugestões */}
      <Dialog open={suggestingFor !== null} onOpenChange={(open) => !open && setSuggestingFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugerir Dados do Indicador</DialogTitle>
            <DialogDescription>
              Selecione uma fonte de dados para atualizar o valor atual do indicador.
            </DialogDescription>
          </DialogHeader>
          
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Buscando sugestões...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Nenhuma sugestão de dados disponível no momento.</p>
              <p className="text-sm mt-2">Os dados podem ser coletados dos módulos: Analytics, Inventário, Eventos e CATs.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((sugestao, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleAcceptSuggestion(sugestao)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{sugestao.modulo}</h4>
                        <p className="text-xs text-gray-600 mb-2">{sugestao.descricao}</p>
                        <p className="text-lg font-bold text-blue-600">
                          {sugestao.valor.toLocaleString()} {indicadores.find(i => i.id === suggestingFor)?.unidade || ''}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Usar este valor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSuggestingFor(null)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanoDiretorIndicadores;

