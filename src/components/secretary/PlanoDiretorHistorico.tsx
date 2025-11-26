/**
 * Plano Diretor Histórico Component
 * Visualização do histórico de alterações do plano
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, FileText, Edit, CheckCircle, Plus } from 'lucide-react';
import { planoDiretorService } from '@/services/public/planoDiretorService';

interface PlanoDiretorHistoricoProps {
  planoId: string;
}

const PlanoDiretorHistorico: React.FC<PlanoDiretorHistoricoProps> = ({ planoId }) => {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistorico();
  }, [planoId]);

  const loadHistorico = async () => {
    try {
      setLoading(true);
      const data = await planoDiretorService.getHistorico(planoId);
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, any> = {
      criacao: Plus,
      edicao: Edit,
      aprovacao: CheckCircle,
      comentario: FileText,
      publicacao: CheckCircle
    };
    return icons[tipo] || FileText;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      criacao: 'bg-green-100 text-green-800',
      edicao: 'bg-blue-100 text-blue-800',
      aprovacao: 'bg-purple-100 text-purple-800',
      comentario: 'bg-gray-100 text-gray-800',
      publicacao: 'bg-indigo-100 text-indigo-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      criacao: 'Criação',
      edicao: 'Edição',
      aprovacao: 'Aprovação',
      comentario: 'Comentário',
      publicacao: 'Publicação'
    };
    return labels[tipo] || tipo;
  };

  const getSecaoLabel = (secao: string) => {
    const labels: Record<string, string> = {
      geral: 'Geral',
      objetivo: 'Objetivo',
      estrategia: 'Estratégia',
      acao: 'Ação',
      indicador: 'Indicador'
    };
    return labels[secao] || secao;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          Histórico de Alterações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-600">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma alteração registrada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {historico.map((item) => {
              const Icon = getTipoIcon(item.tipoAlteracao);
              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${getTipoColor(item.tipoAlteracao)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getTipoColor(item.tipoAlteracao)}>
                        {getTipoLabel(item.tipoAlteracao)}
                      </Badge>
                      {item.secao && (
                        <Badge variant="outline" className="text-xs">
                          {getSecaoLabel(item.secao)}
                        </Badge>
                      )}
                      {item.versao && (
                        <Badge variant="outline" className="text-xs">
                          v{item.versao}
                        </Badge>
                      )}
                    </div>
                    {item.comentarios && (
                      <p className="text-sm text-gray-700 mb-2">{item.comentarios}</p>
                    )}
                    {item.alteracoes && typeof item.alteracoes === 'object' && (
                      <div className="text-xs text-gray-500">
                        {item.alteracoes.campo && (
                          <p>Campo alterado: {item.alteracoes.campo}</p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanoDiretorHistorico;
