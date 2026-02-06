/**
 * Ação Form Component
 * Formulário para criar/editar ações com gerenciamento de dependências
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Sparkles, Calendar, Building2, MapPin, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Acao, Estrategia } from '@/services/public/planoDiretorService';
import { PlanoDiretorAIService } from '@/services/ai/planoDiretorAIService';

const planoDiretorAIService = new PlanoDiretorAIService();

interface AcaoFormProps {
  planoId: string;
  estrategiaId: string;
  acao?: Acao | null;
  onClose: () => void;
}

const AcaoForm: React.FC<AcaoFormProps> = ({ 
  planoId, 
  estrategiaId, 
  acao, 
  onClose 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [estrategia, setEstrategia] = useState<Estrategia | null>(null);
  const [acoesDisponiveis, setAcoesDisponiveis] = useState<Acao[]>([]);
  
  const [formData, setFormData] = useState({
    titulo: acao?.titulo || '',
    descricao: acao?.descricao || '',
    investimento: acao?.investimento || 0,
    prazo: acao?.prazo || '',
    responsavel: acao?.responsavel || '',
    status: acao?.status || 'planejada',
    progresso: acao?.progresso || 0,
    dependencias: acao?.dependencias || [],
    tipoIntegracao: (acao as any)?.tipoIntegracao || ''
  });

  useEffect(() => {
    loadEstrategia();
    loadAcoesDisponiveis();
  }, [estrategiaId, planoId]);

  const loadEstrategia = async () => {
    try {
      const estrategias = await planoDiretorService.getEstrategias(planoId);
      const est = estrategias.find(e => e.id === estrategiaId);
      setEstrategia(est || null);
    } catch (error) {
      console.error('Erro ao carregar estratégia:', error);
    }
  };

  const loadAcoesDisponiveis = async () => {
    try {
      const acoes = await planoDiretorService.getAcoes(planoId);
      // Filtrar ações da mesma estratégia e excluir a ação atual se estiver editando
      const filtradas = acoes.filter(a => 
        a.estrategiaId === estrategiaId && 
        (!acao || a.id !== acao.id)
      );
      setAcoesDisponiveis(filtradas);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const acaoData: Partial<Acao> = {
        ...formData
      };

      if (acao?.id) {
        await planoDiretorService.updateAcao(acao.id, acaoData);
        toast({
          title: 'Sucesso',
          description: 'Ação atualizada com sucesso.',
        });
      } else {
        await planoDiretorService.createAcao(estrategiaId, acaoData);
        toast({
          title: 'Sucesso',
          description: 'Ação criada com sucesso.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a ação.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillDescription = async () => {
    try {
      const descricao = await planoDiretorAIService.fillDescription('acao', {
        ...formData,
        estrategia: estrategia?.titulo
      });
      setFormData(prev => ({ ...prev, descricao }));
    } catch (error) {
      console.error('Erro ao preencher descrição:', error);
    }
  };

  const toggleDependencia = (acaoId: string) => {
    setFormData(prev => {
      const deps = prev.dependencias || [];
      if (deps.includes(acaoId)) {
        return { ...prev, dependencias: deps.filter(id => id !== acaoId) };
      } else {
        return { ...prev, dependencias: [...deps, acaoId] };
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{acao ? 'Editar Ação' : 'Nova Ação'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {estrategia && (
          <p className="text-sm text-gray-600 mt-2">
            Para a estratégia: <strong>{estrategia.titulo}</strong>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              required
              placeholder="Ex: Criar campanha no Instagram"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFillDescription}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Preencher com IA
              </Button>
            </div>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={4}
              placeholder="Descreva a ação em detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investimento">Investimento (R$)</Label>
              <Input
                id="investimento"
                type="number"
                value={formData.investimento}
                onChange={(e) => setFormData(prev => ({ ...prev, investimento: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="prazo">Prazo *</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="progresso">Progresso (%)</Label>
              <Input
                id="progresso"
                type="number"
                value={formData.progresso}
                onChange={(e) => setFormData(prev => ({ ...prev, progresso: parseFloat(e.target.value) || 0 }))}
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <Label htmlFor="tipoIntegracao">Tipo de Integração (Opcional)</Label>
            <Select
              value={formData.tipoIntegracao}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipoIntegracao: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma integração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma integração</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="cat">CAT (Centro de Atendimento ao Turista)</SelectItem>
                <SelectItem value="inventario">Inventário (Atrativo Turístico)</SelectItem>
              </SelectContent>
            </Select>
            {formData.tipoIntegracao && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    {formData.tipoIntegracao === 'evento' && (
                      <p>Esta ação pode ser integrada com o módulo de Gestão de Eventos. Um botão "Criar Evento" aparecerá na visualização da ação.</p>
                    )}
                    {formData.tipoIntegracao === 'cat' && (
                      <p>Esta ação pode ser integrada com o módulo de CATs. Um botão "Melhorar CAT" aparecerá na visualização da ação.</p>
                    )}
                    {formData.tipoIntegracao === 'inventario' && (
                      <p>Esta ação pode ser integrada com o módulo de Inventário Turístico. Um botão "Adicionar Atrativo" aparecerá na visualização da ação.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {acoesDisponiveis.length > 0 && (
            <div>
              <Label>Dependências</Label>
              <p className="text-sm text-gray-600 mb-2">
                Selecione as ações que devem ser concluídas antes desta ação:
              </p>
              <div className="space-y-2 border rounded-lg p-4">
                {acoesDisponiveis.map((acaoDep) => (
                  <div key={acaoDep.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dep-${acaoDep.id}`}
                      checked={formData.dependencias?.includes(acaoDep.id)}
                      onCheckedChange={() => toggleDependencia(acaoDep.id)}
                    />
                    <label
                      htmlFor={`dep-${acaoDep.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {acaoDep.titulo}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : acao ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AcaoForm;

