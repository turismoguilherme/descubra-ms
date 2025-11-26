/**
 * Objetivo Form Component
 * Formulário para criar/editar objetivos com validação SMART
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, Objetivo } from '@/services/public/planoDiretorService';
import { PlanoDiretorAIService } from '@/services/ai/planoDiretorAIService';

const planoDiretorAIService = new PlanoDiretorAIService();

interface ObjetivoFormProps {
  planoId: string;
  objetivo?: Objetivo | null;
  onClose: () => void;
}

const ObjetivoForm: React.FC<ObjetivoFormProps> = ({ planoId, objetivo, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    titulo: objetivo?.titulo || '',
    descricao: objetivo?.descricao || '',
    categoria: objetivo?.categoria || 'crescimento',
    meta: objetivo?.meta || 0,
    unidade: objetivo?.unidade || '',
    prazo: objetivo?.prazo || '',
    responsavel: objetivo?.responsavel || '',
    status: objetivo?.status || 'planejado'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const objetivoData: Partial<Objetivo> = {
        ...formData,
        progresso: objetivo?.progresso || 0,
        indicadores: objetivo?.indicadores || []
      };

      if (objetivo?.id) {
        await planoDiretorService.updateObjetivo(objetivo.id, objetivoData);
        toast({
          title: 'Sucesso',
          description: 'Objetivo atualizado com sucesso.',
        });
      } else {
        await planoDiretorService.createObjetivo(planoId, objetivoData);
        toast({
          title: 'Sucesso',
          description: 'Objetivo criado com sucesso.',
        });
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar objetivo:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o objetivo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateSMART = async () => {
    try {
      setValidating(true);
      const objetivoTemp: Objetivo = {
        id: objetivo?.id || '',
        ...formData,
        progresso: 0,
        indicadores: []
      };
      
      const result = await planoDiretorAIService.validateObjetivoSMART(objetivoTemp);
      setValidationResult(result);
    } catch (error) {
      console.error('Erro ao validar objetivo:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleFillDescription = async () => {
    try {
      const descricao = await planoDiretorAIService.fillDescription('objetivo', formData);
      setFormData(prev => ({ ...prev, descricao }));
    } catch (error) {
      console.error('Erro ao preencher descrição:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{objetivo ? 'Editar Objetivo' : 'Novo Objetivo'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
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
              placeholder="Ex: Aumentar número de visitantes em 25%"
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
              placeholder="Descreva o objetivo em detalhes..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crescimento">Crescimento</SelectItem>
                  <SelectItem value="diversificacao">Diversificação</SelectItem>
                  <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="sustentabilidade">Sustentabilidade</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="meta">Meta *</Label>
              <Input
                id="meta"
                type="number"
                value={formData.meta}
                onChange={(e) => setFormData(prev => ({ ...prev, meta: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="unidade">Unidade *</Label>
              <Input
                id="unidade"
                value={formData.unidade}
                onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
                required
                placeholder="Ex: visitantes, R$, %"
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

          <div>
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável"
            />
          </div>

          {validationResult && (
            <div className={`p-4 rounded-lg ${validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {validationResult.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-semibold">
                  {validationResult.isValid ? 'Objetivo SMART válido!' : 'Atenção: Objetivo precisa de ajustes'}
                </span>
              </div>
              {validationResult.issues.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-700 mb-2">
                  {validationResult.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
              {validationResult.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-1">Sugestões:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {validationResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleValidateSMART} disabled={validating}>
              {validating ? 'Validando...' : 'Validar SMART'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : objetivo ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ObjetivoForm;

