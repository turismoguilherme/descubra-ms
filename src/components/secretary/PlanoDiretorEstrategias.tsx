import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Edit, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Estrategia, Objetivo } from '@/services/public/planoDiretorService';
import { PlanoDiretorAIService } from '@/services/ai/planoDiretorAIService';
import EstrategiaForm from './EstrategiaForm';

const planoDiretorAIService = new PlanoDiretorAIService();

interface PlanoDiretorEstrategiasProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorEstrategias: React.FC<PlanoDiretorEstrategiasProps> = ({ planoId, onUpdate }) => {
  const { toast } = useToast();
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedObjetivoId, setSelectedObjetivoId] = useState<string>('');
  const [editingEstrategia, setEditingEstrategia] = useState<Estrategia | null>(null);

  useEffect(() => {
    loadData();
  }, [planoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [estrategiasData, objetivosData] = await Promise.all([
        planoDiretorService.getEstrategias(planoId),
        planoDiretorService.getObjetivos(planoId)
      ]);
      setEstrategias(estrategiasData);
      setObjetivos(objetivosData);
      if (objetivosData.length > 0 && !selectedObjetivoId) {
        setSelectedObjetivoId(objetivosData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedObjetivoId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um objetivo primeiro.',
        variant: 'destructive'
      });
      return;
    }
    setEditingEstrategia(null);
    setShowForm(true);
  };

  const handleEdit = (estrategia: Estrategia) => {
    setEditingEstrategia(estrategia);
    setSelectedObjetivoId(estrategia.objetivoId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta estratégia?')) return;

    try {
      await planoDiretorService.deleteEstrategia(id);
      await loadData();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Estratégia excluída com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir estratégia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a estratégia.',
        variant: 'destructive'
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEstrategia(null);
    loadData();
    onUpdate?.();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planejada: 'bg-gray-500',
      em_execucao: 'bg-blue-500',
      concluida: 'bg-green-500',
      suspensa: 'bg-yellow-500',
      cancelada: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (showForm) {
    return (
      <EstrategiaForm
        planoId={planoId}
        objetivoId={selectedObjetivoId}
        estrategia={editingEstrategia}
        onClose={handleFormClose}
      />
    );
  }

  const estrategiasFiltradas = selectedObjetivoId
    ? estrategias.filter(e => e.objetivoId === selectedObjetivoId)
    : estrategias;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Estratégias
            </CardTitle>
            <div className="flex gap-2">
              {objetivos.length > 0 && (
                <select
                  value={selectedObjetivoId}
                  onChange={(e) => setSelectedObjetivoId(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="">Todos os objetivos</option>
                  {objetivos.map(obj => (
                    <option key={obj.id} value={obj.id}>{obj.titulo}</option>
                  ))}
                </select>
              )}
              <Button onClick={handleCreate} size="sm" disabled={!selectedObjetivoId}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Estratégia
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Carregando estratégias...</p>
          ) : estrategiasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma estratégia cadastrada.</p>
              <p className="text-sm mt-2">Selecione um objetivo e clique em "Nova Estratégia" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {estrategiasFiltradas.map((estrategia) => {
                const objetivo = objetivos.find(o => o.id === estrategia.objetivoId);
                return (
                  <Card key={estrategia.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{estrategia.titulo}</h3>
                            <Badge className={getStatusColor(estrategia.status)}>
                              {estrategia.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {objetivo && (
                            <p className="text-xs text-gray-500 mb-2">
                              Objetivo: {objetivo.titulo}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mb-3">{estrategia.descricao}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Investimento: <strong>R$ {estrategia.investimento.toLocaleString()}</strong>
                            </span>
                            {estrategia.roiEsperado && (
                              <span className="text-gray-600">
                                ROI: <strong>{estrategia.roiEsperado}%</strong>
                              </span>
                            )}
                            <span className="text-gray-600">
                              Prazo: <strong>{new Date(estrategia.prazo).toLocaleDateString('pt-BR')}</strong>
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(estrategia)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(estrategia.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
};

export default PlanoDiretorEstrategias;

