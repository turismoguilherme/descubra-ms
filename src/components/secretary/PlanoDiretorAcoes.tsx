// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Edit, Trash2, Calendar, Building2, MapPin, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Acao, Estrategia } from '@/services/public/planoDiretorService';
import AcaoForm from './AcaoForm';
import { useNavigate } from 'react-router-dom';

interface PlanoDiretorAcoesProps {
  planoId: string;
  onUpdate?: () => void;
}

const PlanoDiretorAcoes: React.FC<PlanoDiretorAcoesProps> = ({ planoId, onUpdate }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const detectIntegrationType = (acao: Acao): 'evento' | 'cat' | 'inventario' | null => {
    // Primeiro verificar se há tipo de integração definido no formulário
    const tipoIntegracao = (acao as any)?.tipoIntegracao;
    if (tipoIntegracao && ['evento', 'cat', 'inventario'].includes(tipoIntegracao)) {
      return tipoIntegracao as 'evento' | 'cat' | 'inventario';
    }

    // Se não houver, tentar detectar automaticamente pelo texto
    const tituloLower = acao.titulo.toLowerCase();
    const descricaoLower = acao.descricao?.toLowerCase() || '';
    const texto = tituloLower + ' ' + descricaoLower;

    if (texto.includes('evento') || texto.includes('festival') || texto.includes('feira') || texto.includes('show')) {
      return 'evento';
    }
    if (texto.includes('cat') || texto.includes('centro de atendimento') || texto.includes('atendimento ao turista')) {
      return 'cat';
    }
    if (texto.includes('atrativo') || texto.includes('atração') || texto.includes('ponto turístico') || texto.includes('inventário')) {
      return 'inventario';
    }
    return null;
  };

  const handleCreateEvent = (acao: Acao) => {
    toast({
      title: 'Integração com Eventos',
      description: `Redirecionando para criar evento baseado na ação: "${acao.titulo}"`,
    });
    // Navegar para gestão de eventos com dados pré-preenchidos
    navigate('/secretary-dashboard?section=events&action=create&fromPlanoDiretor=true&titulo=' + encodeURIComponent(acao.titulo));
  };

  const handleImproveCAT = (acao: Acao) => {
    toast({
      title: 'Integração com CATs',
      description: `Redirecionando para melhorar CAT baseado na ação: "${acao.titulo}"`,
    });
    // Navegar para gestão de CATs
    navigate('/secretary-dashboard?section=cats&action=improve&fromPlanoDiretor=true&titulo=' + encodeURIComponent(acao.titulo));
  };

  const handleAddAttraction = (acao: Acao) => {
    toast({
      title: 'Integração com Inventário',
      description: `Redirecionando para adicionar atrativo baseado na ação: "${acao.titulo}"`,
    });
    // Navegar para inventário turístico
    navigate('/secretary-dashboard?section=inventory&action=create&fromPlanoDiretor=true&titulo=' + encodeURIComponent(acao.titulo));
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
                            {(() => {
                              const integrationType = detectIntegrationType(acao);
                              if (integrationType) {
                                const integrationLabels = {
                                  evento: 'Integrado com Eventos',
                                  cat: 'Integrado com CATs',
                                  inventario: 'Integrado com Inventário'
                                };
                                return (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    {integrationLabels[integrationType]}
                                  </Badge>
                                );
                              }
                              return null;
                            })()}
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
                          {/* Botões de Integração */}
                          {(() => {
                            const integrationType = detectIntegrationType(acao);
                            if (!integrationType) return null;

                            return (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-2 font-medium">Integração com outros módulos:</p>
                                <div className="flex flex-wrap gap-2">
                                  {integrationType === 'evento' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCreateEvent(acao)}
                                      className="text-xs"
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Criar Evento
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                  {integrationType === 'cat' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleImproveCAT(acao)}
                                      className="text-xs"
                                    >
                                      <Building2 className="h-3 w-3 mr-1" />
                                      Melhorar CAT
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                  {integrationType === 'inventario' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAddAttraction(acao)}
                                      className="text-xs"
                                    >
                                      <MapPin className="h-3 w-3 mr-1" />
                                      Adicionar Atrativo
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
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

