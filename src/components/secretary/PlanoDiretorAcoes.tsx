import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Acao, Estrategia } from '@/services/public/planoDiretorService';
import AcaoForm from './AcaoForm';

interface PlanoDiretorAcoesProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorAcoes: React.FC<PlanoDiretorAcoesProps> = ({ planoId, onUpdate }) => {
  const { toast } = useToast();
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [estrategias, setEstrategias] = useState<Estrategia[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedEstrategiaId, setSelectedEstrategiaId] = useState<string>('');
  const [editingAcao, setEditingAcao] = useState<Acao | null>(null);

  useEffect(() => {
    loadData();
  }, [planoId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [acoesData, estrategiasData] = await Promise.all([
        planoDiretorService.getAcoes(planoId),
        planoDiretorService.getEstrategias(planoId)
      ]);
      setAcoes(acoesData);
      setEstrategias(estrategiasData);
      if (estrategiasData.length > 0 && !selectedEstrategiaId) {
        setSelectedEstrategiaId(estrategiasData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedEstrategiaId) {
      toast({
        title: 'Atenção',
        description: 'Selecione uma estratégia primeiro.',
        variant: 'destructive'
      });
      return;
    }
    setEditingAcao(null);
    setShowForm(true);
  };

  const handleEdit = (acao: Acao) => {
    setEditingAcao(acao);
    setSelectedEstrategiaId(acao.estrategiaId);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta ação?')) return;

    try {
      await planoDiretorService.deleteAcao(id);
      await loadData();
      onUpdate?.();
      toast({
        title: 'Sucesso',
        description: 'Ação excluída com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a ação.',
        variant: 'destructive'
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAcao(null);
    loadData();
    onUpdate?.();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planejada: 'bg-gray-500',
      em_execucao: 'bg-blue-500',
      concluida: 'bg-green-500',
      atrasada: 'bg-red-500',
      cancelada: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (showForm) {
    return (
      <AcaoForm
        planoId={planoId}
        estrategiaId={selectedEstrategiaId}
        acao={editingAcao}
        onClose={handleFormClose}
      />
    );
  }

  const acoesFiltradas = selectedEstrategiaId
    ? acoes.filter(a => a.estrategiaId === selectedEstrategiaId)
    : acoes;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Ações
            </CardTitle>
            <div className="flex gap-2">
              {estrategias.length > 0 && (
                <select
                  value={selectedEstrategiaId}
                  onChange={(e) => setSelectedEstrategiaId(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="">Todas as estratégias</option>
                  {estrategias.map(est => (
                    <option key={est.id} value={est.id}>{est.titulo}</option>
                  ))}
                </select>
              )}
              <Button onClick={handleCreate} size="sm" disabled={!selectedEstrategiaId}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Ação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Carregando ações...</p>
          ) : acoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma ação cadastrada.</p>
              <p className="text-sm mt-2">Selecione uma estratégia e clique em "Nova Ação" para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {acoesFiltradas.map((acao) => {
                const estrategia = estrategias.find(e => e.id === acao.estrategiaId);
                return (
                  <Card key={acao.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{acao.titulo}</h3>
                            <Badge className={getStatusColor(acao.status)}>
                              {acao.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {estrategia && (
                            <p className="text-xs text-gray-500 mb-2">
                              Estratégia: {estrategia.titulo}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mb-3">{acao.descricao}</p>
                          <div className="flex items-center gap-4 text-sm mb-2">
                            <span className="text-gray-600">
                              Investimento: <strong>R$ {acao.investimento.toLocaleString()}</strong>
                            </span>
                            <span className="text-gray-600">
                              Prazo: <strong>{new Date(acao.prazo).toLocaleDateString('pt-BR')}</strong>
                            </span>
                            <span className="text-gray-600">
                              Progresso: <strong>{acao.progresso.toFixed(0)}%</strong>
                            </span>
                          </div>
                          {acao.progresso > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${acao.progresso}%` }}
                              />
                            </div>
                          )}
                          {acao.dependencias && acao.dependencias.length > 0 && (
                            <p className="text-xs text-gray-500">
                              Depende de {acao.dependencias.length} ação(ões)
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(acao)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(acao.id)}
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

export default PlanoDiretorAcoes;

