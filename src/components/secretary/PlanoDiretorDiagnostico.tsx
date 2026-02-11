// @ts-nocheck
/**
 * Plano Diretor Diagnóstico Component
 * Visualização e edição de diagnóstico com geração automática via IA
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, BarChart3, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [showSWOT, setShowSWOT] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDiagnostico, setEditingDiagnostico] = useState<DiagnosticoData | null>(null);
  const [saving, setSaving] = useState(false);
  const [newItemText, setNewItemText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadDiagnostico();
  }, [planoId]);

  const loadDiagnostico = async () => {
    try {
      setLoading(true);
      // Tentar carregar diagnóstico salvo primeiro
      const diagnosticoSalvo = await planoDiretorService.getDiagnostico(planoId);
      
      if (diagnosticoSalvo) {
        setDiagnostico(diagnosticoSalvo);
        setEditingDiagnostico(diagnosticoSalvo);
      } else {
        // Se não houver diagnóstico salvo, gerar novo com IA
        const dados = await planoDiretorService.collectDataForDiagnostic(municipioNome, municipioUf);
        const diagnosticoData = await planoDiretorService.generateDiagnosticoIA(dados);
        setDiagnostico(diagnosticoData);
        setEditingDiagnostico(diagnosticoData);
      }
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
      setEditingDiagnostico(diagnosticoData);
      
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

  const handleStartEdit = () => {
    setEditingDiagnostico(diagnostico ? { ...diagnostico } : null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingDiagnostico(null);
    setIsEditing(false);
    setNewItemText({});
  };

  const handleSave = async () => {
    if (!editingDiagnostico) return;

    try {
      setSaving(true);
      await planoDiretorService.saveDiagnostico(planoId, editingDiagnostico);
      setDiagnostico(editingDiagnostico);
      setIsEditing(false);
      setNewItemText({});
      
      toast({
        title: 'Sucesso',
        description: 'Diagnóstico salvo com sucesso!',
      });
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao salvar diagnóstico:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSituacaoAtual = (field: string, value: number) => {
    if (!editingDiagnostico) return;
    setEditingDiagnostico({
      ...editingDiagnostico,
      situacaoAtual: {
        ...editingDiagnostico.situacaoAtual,
        [field]: value
      }
    });
  };

  const updateBenchmark = (field: string, value: number) => {
    if (!editingDiagnostico) return;
    setEditingDiagnostico({
      ...editingDiagnostico,
      benchmarks: {
        ...editingDiagnostico.benchmarks,
        [field]: value
      }
    });
  };

  const updateGap = (field: string, value: boolean) => {
    if (!editingDiagnostico) return;
    setEditingDiagnostico({
      ...editingDiagnostico,
      gaps: {
        ...editingDiagnostico.gaps,
        [field]: value
      }
    });
  };

  const addItemToList = (listName: 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas' | 'desafios' | 'oportunidadesDesafios') => {
    if (!editingDiagnostico) return;
    const text = newItemText[listName]?.trim();
    if (!text) return;

    const updated = { ...editingDiagnostico };
    
    if (listName === 'desafios' || listName === 'oportunidadesDesafios') {
      if (!updated.desafiosEOportunidades) {
        updated.desafiosEOportunidades = { desafios: [], oportunidades: [] };
      }
      if (listName === 'desafios') {
        updated.desafiosEOportunidades.desafios = [...(updated.desafiosEOportunidades.desafios || []), text];
      } else {
        updated.desafiosEOportunidades.oportunidades = [...(updated.desafiosEOportunidades.oportunidades || []), text];
      }
    } else {
      updated.analiseSWOT[listName] = [...updated.analiseSWOT[listName], text];
    }
    
    setEditingDiagnostico(updated);
    setNewItemText({ ...newItemText, [listName]: '' });
  };

  const removeItemFromList = (listName: 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas' | 'desafios' | 'oportunidadesDesafios', index: number) => {
    if (!editingDiagnostico) return;

    const updated = { ...editingDiagnostico };
    
    if (listName === 'desafios' || listName === 'oportunidadesDesafios') {
      if (updated.desafiosEOportunidades) {
        if (listName === 'desafios') {
          updated.desafiosEOportunidades.desafios = updated.desafiosEOportunidades.desafios.filter((_, i) => i !== index);
        } else {
          updated.desafiosEOportunidades.oportunidades = updated.desafiosEOportunidades.oportunidades.filter((_, i) => i !== index);
        }
      }
    } else {
      updated.analiseSWOT[listName] = updated.analiseSWOT[listName].filter((_, i) => i !== index);
    }
    
    setEditingDiagnostico(updated);
  };

  const updateListItem = (listName: 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas' | 'desafios' | 'oportunidadesDesafios', index: number, value: string) => {
    if (!editingDiagnostico) return;

    const updated = { ...editingDiagnostico };
    
    if (listName === 'desafios' || listName === 'oportunidadesDesafios') {
      if (updated.desafiosEOportunidades) {
        if (listName === 'desafios') {
          updated.desafiosEOportunidades.desafios[index] = value;
        } else {
          updated.desafiosEOportunidades.oportunidades[index] = value;
        }
      }
    } else {
      updated.analiseSWOT[listName][index] = value;
    }
    
    setEditingDiagnostico(updated);
  };

  const renderEditableList = (
    items: string[],
    listName: 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas' | 'desafios' | 'oportunidadesDesafios',
    color: string,
    icon?: React.ReactNode
  ) => {
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {isEditing ? (
              <>
                <Textarea
                  value={item}
                  onChange={(e) => updateListItem(listName, index, e.target.value)}
                  className="flex-1 text-sm min-h-[60px]"
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItemFromList(listName, index)}
                  className="mt-1"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            ) : (
              <li className="text-sm text-gray-700 flex items-start gap-2 flex-1">
                <span className={`${color} mt-1`}>•</span>
                {item}
              </li>
            )}
          </div>
        ))}
        {isEditing && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newItemText[listName] || ''}
              onChange={(e) => setNewItemText({ ...newItemText, [listName]: e.target.value })}
              placeholder="Adicionar novo item..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addItemToList(listName);
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => addItemToList(listName)}
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const currentDiagnostico = isEditing ? editingDiagnostico : diagnostico;

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

  if (!currentDiagnostico) {
    return <p className="text-gray-600">Carregando diagnóstico...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Diagnóstico Situacional</CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={handleStartEdit} variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
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
                </>
              ) : (
                <>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Situação Atual */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Situação Atual</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'populacao', label: 'População', bg: 'bg-blue-50', text: 'text-blue-600' },
                { key: 'visitantes', label: 'Visitantes/Ano', bg: 'bg-green-50', text: 'text-green-600' },
                { key: 'receita', label: 'Receita Anual', bg: 'bg-purple-50', text: 'text-purple-600', format: (v: number) => `R$ ${(v / 1000000).toFixed(1)}M` },
                { key: 'atrativos', label: 'Atrativos', bg: 'bg-orange-50', text: 'text-orange-600' },
                { key: 'infraestrutura', label: 'Infraestrutura', bg: 'bg-indigo-50', text: 'text-indigo-600' },
                { key: 'satisfacao', label: 'Satisfação', bg: 'bg-pink-50', text: 'text-pink-600', format: (v: number) => `${v.toFixed(1)} ⭐` }
              ].map(({ key, label, bg, text, format }) => (
                <div key={key} className={`p-4 ${bg} rounded-lg`}>
                  <p className="text-sm text-gray-600">{label}</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentDiagnostico.situacaoAtual[key as keyof typeof currentDiagnostico.situacaoAtual]}
                      onChange={(e) => updateSituacaoAtual(key, parseFloat(e.target.value) || 0)}
                      className={`mt-1 text-2xl font-bold ${text}`}
                      step={key === 'satisfacao' ? '0.1' : '1'}
                    />
                  ) : (
                    <p className={`text-2xl font-bold ${text}`}>
                      {format 
                        ? format(currentDiagnostico.situacaoAtual[key as keyof typeof currentDiagnostico.situacaoAtual] as number)
                        : currentDiagnostico.situacaoAtual[key as keyof typeof currentDiagnostico.situacaoAtual].toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Análise SWOT - Opcional */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Análise SWOT</h3>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-swot"
                  checked={showSWOT}
                  onCheckedChange={setShowSWOT}
                />
                <Label htmlFor="show-swot" className="text-sm text-gray-600 cursor-pointer">
                  {showSWOT ? 'Ocultar' : 'Mostrar'} SWOT
                </Label>
              </div>
            </div>
            {showSWOT && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Forças
                </h4>
                {renderEditableList(currentDiagnostico.analiseSWOT.forcas, 'forcas', 'text-green-600')}
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Fraquezas
                </h4>
                {renderEditableList(currentDiagnostico.analiseSWOT.fraquezas, 'fraquezas', 'text-red-600')}
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Oportunidades</h4>
                {renderEditableList(currentDiagnostico.analiseSWOT.oportunidades, 'oportunidades', 'text-blue-600')}
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">Ameaças</h4>
                {renderEditableList(currentDiagnostico.analiseSWOT.ameacas, 'ameacas', 'text-yellow-600')}
              </div>
            </div>
            )}
          </div>

          {/* Desafios e Oportunidades */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Desafios e Oportunidades</h3>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">Principais Desafios</h4>
                {currentDiagnostico.desafiosEOportunidades?.desafios && currentDiagnostico.desafiosEOportunidades.desafios.length > 0 ? (
                  renderEditableList(currentDiagnostico.desafiosEOportunidades.desafios, 'desafios', 'text-yellow-600')
                ) : (
                  <p className="text-sm text-gray-500">Nenhum desafio identificado.</p>
                )}
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Principais Oportunidades</h4>
                {currentDiagnostico.desafiosEOportunidades?.oportunidades && currentDiagnostico.desafiosEOportunidades.oportunidades.length > 0 ? (
                  renderEditableList(currentDiagnostico.desafiosEOportunidades.oportunidades, 'oportunidadesDesafios', 'text-green-600')
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma oportunidade identificada.</p>
                )}
              </div>
            </div>
          </div>

          {/* Gaps */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Identificação de Gaps</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(currentDiagnostico.gaps).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  {isEditing ? (
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) => updateGap(key, checked as boolean)}
                    />
                  ) : null}
                  <Badge variant={value ? 'destructive' : 'default'} className="justify-center py-2 flex-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value ? 'Necessita atenção' : 'OK'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmarks */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Benchmarking</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'visitantesPorHabitante', label: 'Visitantes/Habitante', format: (v: number) => v.toFixed(2) },
                { key: 'receitaPorVisitante', label: 'Receita/Visitante', format: (v: number) => `R$ ${v.toFixed(2)}` },
                { key: 'satisfacaoMedia', label: 'Satisfação Média', format: (v: number) => `${v.toFixed(1)} ⭐` },
                { key: 'posicaoRegional', label: 'Posição Regional', format: (v: number) => `#${v || 'N/A'}` }
              ].map(({ key, label, format }) => (
                <div key={key} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{label}</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentDiagnostico.benchmarks[key as keyof typeof currentDiagnostico.benchmarks]}
                      onChange={(e) => updateBenchmark(key, parseFloat(e.target.value) || 0)}
                      className="mt-1 text-lg font-bold"
                      step="0.01"
                    />
                  ) : (
                    <p className="text-lg font-bold">
                      {format(currentDiagnostico.benchmarks[key as keyof typeof currentDiagnostico.benchmarks] as number)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanoDiretorDiagnostico;
