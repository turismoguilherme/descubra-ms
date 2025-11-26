/**
 * Estratégia Form Component
 * Formulário para criar/editar estratégias com cálculo de ROI
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Sparkles, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Estrategia, Objetivo } from '@/services/public/planoDiretorService';
import { PlanoDiretorAIService } from '@/services/ai/planoDiretorAIService';

const planoDiretorAIService = new PlanoDiretorAIService();

interface EstrategiaFormProps {
  planoId: string;
  objetivoId: string;
  estrategia?: Estrategia | null;
  onClose: () => void;
}

const EstrategiaForm: React.FC<EstrategiaFormProps> = ({ 
  planoId, 
  objetivoId, 
  estrategia, 
  onClose 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  
  const [formData, setFormData] = useState({
    titulo: estrategia?.titulo || '',
    descricao: estrategia?.descricao || '',
    investimento: estrategia?.investimento || 0,
    prazo: estrategia?.prazo || '',
    responsavel: estrategia?.responsavel || '',
    status: estrategia?.status || 'planejada',
    roiEsperado: estrategia?.roiEsperado || 0
  });

  useEffect(() => {
    loadObjetivo();
  }, [objetivoId]);

  const loadObjetivo = async () => {
    try {
      const objetivos = await planoDiretorService.getObjetivos(planoId);
      const obj = objetivos.find(o => o.id === objetivoId);
      setObjetivo(obj || null);
    } catch (error) {
      console.error('Erro ao carregar objetivo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const estrategiaData: Partial<Estrategia> = {
        ...formData,
        objetivoId,
        acoes: estrategia?.acoes || []
      };

      if (estrategia?.id) {
        await planoDiretorService.updateEstrategia(estrategia.id, estrategiaData);
        toast({
          title: 'Sucesso',
          description: 'Estratégia atualizada com sucesso.',
        });
      } else {
        await planoDiretorService.createEstrategia(objetivoId, estrategiaData);
        toast({
          title: 'Sucesso',
          description: 'Estratégia criada com sucesso.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar estratégia:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a estratégia.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateROI = () => {
    if (formData.investimento > 0 && objetivo) {
      // Cálculo simples de ROI baseado na meta do objetivo
      const expectedReturn = objetivo.meta * 0.1; // 10% da meta como retorno esperado
      const roi = ((expectedReturn - formData.investimento) / formData.investimento) * 100;
      setFormData(prev => ({ ...prev, roiEsperado: Math.round(roi) }));
    }
  };

  const handleFillDescription = async () => {
    try {
      const descricao = await planoDiretorAIService.fillDescription('estrategia', {
        ...formData,
        objetivo: objetivo?.titulo
      });
      setFormData(prev => ({ ...prev, descricao }));
    } catch (error) {
      console.error('Erro ao preencher descrição:', error);
    }
  };

  const handleSuggestEstrategias = async () => {
    if (!objetivo) return;

    try {
      // Buscar diagnóstico para contexto
      const plano = await planoDiretorService.getPlanoDiretorById(planoId);
      if (!plano) return;

      const dados = await planoDiretorService.collectDataForDiagnostic(plano.municipio, plano.municipioUf);
      const diagnostico = await planoDiretorService.generateDiagnosticoIA(dados);
      
      const sugestoes = await planoDiretorAIService.suggestEstrategias(objetivo, diagnostico);
      
      if (sugestoes.length > 0) {
        const primeira = sugestoes[0];
        setFormData(prev => ({
          ...prev,
          titulo: primeira.titulo,
          descricao: primeira.descricao,
          investimento: primeira.investimento,
          prazo: primeira.prazo,
          responsavel: primeira.responsavel,
          roiEsperado: primeira.roiEsperado || 0
        }));
        
        toast({
          title: 'Sugestão aplicada',
          description: 'Sugestão de estratégia aplicada. Você pode editar antes de salvar.',
        });
      }
    } catch (error) {
      console.error('Erro ao sugerir estratégias:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar sugestões.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{estrategia ? 'Editar Estratégia' : 'Nova Estratégia'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {objetivo && (
          <p className="text-sm text-gray-600 mt-2">
            Para o objetivo: <strong>{objetivo.titulo}</strong>
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestEstrategias}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Sugerir com IA
            </Button>
          </div>

          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              required
              placeholder="Ex: Marketing digital e promoção"
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
              placeholder="Descreva a estratégia em detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investimento">Investimento (R$) *</Label>
              <Input
                id="investimento"
                type="number"
                value={formData.investimento}
                onChange={(e) => setFormData(prev => ({ ...prev, investimento: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="roiEsperado">ROI Esperado (%)</Label>
              <div className="flex gap-2">
                <Input
                  id="roiEsperado"
                  type="number"
                  value={formData.roiEsperado}
                  onChange={(e) => setFormData(prev => ({ ...prev, roiEsperado: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCalculateROI}
                  title="Calcular ROI automaticamente"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="suspensa">Suspensa</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : estrategia ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EstrategiaForm;


