/**
 * Plano Diretor Diagnóstico Component
 * Visualização e edição de diagnóstico com geração automática via IA
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { planoDiretorService, DiagnosticoData } from '@/services/public/planoDiretorService';
import { PlanoDiretorAIService } from '@/services/ai/planoDiretorAIService';

const planoDiretorAIService = new PlanoDiretorAIService();

interface PlanoDiretorDiagnosticoProps {
  planoId: string;
  municipioNome: string;
  municipioUf: string;
  onUpdate?: () => void;
}

const PlanoDiretorDiagnostico: React.FC<PlanoDiretorDiagnosticoProps> = ({
  planoId,
  municipioNome,
  municipioUf,
  onUpdate
}) => {
  const { toast } = useToast();
  const [diagnostico, setDiagnostico] = useState<DiagnosticoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDiagnostico();
  }, [planoId]);

  const loadDiagnostico = async () => {
    try {
      setLoading(true);
      // Por enquanto, vamos gerar um diagnóstico básico
      // Em produção, isso viria do banco de dados
      const dados = await planoDiretorService.collectDataForDiagnostic(municipioNome, municipioUf);
      const diagnosticoData = await planoDiretorService.generateDiagnosticoIA(dados);
      setDiagnostico(diagnosticoData);
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    try {
      setGenerating(true);
      const dados = await planoDiretorService.collectDataForDiagnostic(municipioNome, municipioUf);
      const diagnosticoData = await planoDiretorService.generateDiagnosticoIA(dados);
      setDiagnostico(diagnosticoData);
      
      toast({
        title: 'Sucesso',
        description: 'Diagnóstico gerado com sucesso usando IA!',
      });
    } catch (error) {
      console.error('Erro ao gerar diagnóstico:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!diagnostico) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico Situacional</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateWithAI} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Diagnóstico com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Diagnóstico Situacional</CardTitle>
            <Button onClick={handleGenerateWithAI} disabled={generating} variant="outline" size="sm">
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerar com IA
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Situação Atual */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Situação Atual</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">População</p>
                <p className="text-2xl font-bold text-blue-600">
                  {diagnostico.situacaoAtual.populacao.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Visitantes/Ano</p>
                <p className="text-2xl font-bold text-green-600">
                  {diagnostico.situacaoAtual.visitantes.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Receita Anual</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {(diagnostico.situacaoAtual.receita / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Atrativos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {diagnostico.situacaoAtual.atrativos}
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Infraestrutura</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {diagnostico.situacaoAtual.infraestrutura}
                </p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold text-pink-600">
                  {diagnostico.situacaoAtual.satisfacao.toFixed(1)} ⭐
                </p>
              </div>
            </div>
          </div>

          {/* Análise SWOT */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Análise SWOT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Forças
                </h4>
                <ul className="space-y-2">
                  {diagnostico.analiseSWOT.forcas.map((forca, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      {forca}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Fraquezas
                </h4>
                <ul className="space-y-2">
                  {diagnostico.analiseSWOT.fraquezas.map((fraqueza, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      {fraqueza}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Oportunidades</h4>
                <ul className="space-y-2">
                  {diagnostico.analiseSWOT.oportunidades.map((oportunidade, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      {oportunidade}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">Ameaças</h4>
                <ul className="space-y-2">
                  {diagnostico.analiseSWOT.ameacas.map((ameaca, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      {ameaca}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Gaps */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Identificação de Gaps</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(diagnostico.gaps).map(([key, value]) => (
                <Badge key={key} variant={value ? 'destructive' : 'default'} className="justify-center py-2">
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value ? 'Necessita atenção' : 'OK'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Benchmarks */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Benchmarking</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Visitantes/Habitante</p>
                <p className="text-lg font-bold">{diagnostico.benchmarks.visitantesPorHabitante.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Receita/Visitante</p>
                <p className="text-lg font-bold">R$ {diagnostico.benchmarks.receitaPorVisitante.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Satisfação Média</p>
                <p className="text-lg font-bold">{diagnostico.benchmarks.satisfacaoMedia.toFixed(1)} ⭐</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">Posição Regional</p>
                <p className="text-lg font-bold">#{diagnostico.benchmarks.posicaoRegional || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanoDiretorDiagnostico;

