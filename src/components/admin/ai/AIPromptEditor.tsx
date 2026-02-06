/**
 * 📝 AI PROMPT EDITOR
 * Interface de admin para editar prompts do Guatá e Koda
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Save,
  Eye,
  History,
  Copy,
  CheckCircle,
  AlertCircle,
  Code,
  Sparkles,
} from 'lucide-react';
import {
  aiPromptAdminService,
  AIPromptConfig,
} from '@/services/admin/aiPromptAdminService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PROMPT_TYPES = {
  system: { label: 'Sistema', description: 'Definições básicas sobre quem é o chatbot' },
  personality: { label: 'Personalidade', description: 'Como o chatbot se comporta e se comunica' },
  instructions: { label: 'Instruções', description: 'Regras de resposta e comportamento' },
  rules: { label: 'Regras', description: 'Limitações e diretrizes que o chatbot deve seguir' },
  disclaimer: { label: 'Avisos', description: 'Disclaimers e informações legais' },
};

const VARIABLE_DESCRIPTIONS: Record<string, string> = {
  user_location: 'Localização do usuário',
  conversation_history: 'Histórico da conversa',
  question: 'Pergunta do usuário',
  web_search_results: 'Resultados da busca web',
  knowledge_base: 'Informações da base de conhecimento',
};

export default function AIPromptEditor() {
  const { toast } = useToast();
  const [selectedChatbot, setSelectedChatbot] = useState<'guata' | 'koda'>('guata');
  const [prompts, setPrompts] = useState<AIPromptConfig[]>([]);
  const [editingPrompt, setEditingPrompt] = useState<AIPromptConfig | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState<string>('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<AIPromptConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, [selectedChatbot]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const data = await aiPromptAdminService.getPrompts(selectedChatbot);
      setPrompts(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar prompts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportDefaults = async () => {
    try {
      const result = await aiPromptAdminService.importDefaultPrompts(selectedChatbot);
      
      if (result.success > 0) {
        toast({
          title: 'Sucesso',
          description: `${result.success} prompts importados com sucesso`,
        });
        loadPrompts();
      } else if (result.errors.length > 0) {
        toast({
          title: 'Aviso',
          description: result.errors[0],
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao importar prompts',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!editingPrompt) return;

    try {
      if (editingPrompt.id) {
        await aiPromptAdminService.updatePrompt(editingPrompt.id, editingPrompt);
        toast({
          title: 'Sucesso',
          description: 'Prompt atualizado com sucesso',
        });
      } else {
        await aiPromptAdminService.createPrompt(editingPrompt);
        toast({
          title: 'Sucesso',
          description: 'Prompt criado com sucesso',
        });
      }

      setEditingPrompt(null);
      loadPrompts();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao salvar',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNewVersion = async () => {
    if (!editingPrompt?.id) return;

    try {
      await aiPromptAdminService.createNewVersion(editingPrompt.id, editingPrompt);
      toast({
        title: 'Sucesso',
        description: 'Nova versão criada com sucesso',
      });
      setEditingPrompt(null);
      loadPrompts();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao criar versão',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = () => {
    if (!editingPrompt) return;

    // Substituir variáveis com exemplos
    const exampleVariables: Record<string, string> = {
      user_location: 'Mato Grosso do Sul',
      conversation_history: '1. Usuário: O que fazer em Bonito?\n2. Guatá: Bonito é um destino incrível...',
      question: 'Que horas abre o Bioparque?',
      web_search_results: 'Resultado 1: Bioparque Pantanal funciona de terça a domingo...',
      knowledge_base: 'Bioparque Pantanal: maior aquário de água doce do mundo...',
    };

    const preview = aiPromptAdminService.replaceVariables(
      editingPrompt.content,
      exampleVariables
    );

    setPreviewPrompt(preview);
    setPreviewDialogOpen(true);
  };

  const handleViewHistory = async (type: string) => {
    try {
      const history = await aiPromptAdminService.getVersionHistory(selectedChatbot, type);
      setVersionHistory(history);
      setHistoryDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar histórico',
        variant: 'destructive',
      });
    }
  };

  const getActivePrompt = (type: string): AIPromptConfig | undefined => {
    return prompts.find(p => p.prompt_type === type && p.is_active);
  };

  const getPromptVariables = (content: string): string[] => {
    return aiPromptAdminService.extractVariables(content);
  };

  const activePrompts = Object.keys(PROMPT_TYPES).map(type => ({
    type,
    prompt: getActivePrompt(type),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Editor de Prompts</h2>
          <p className="text-muted-foreground">
            Edite os prompts do Guatá e Koda
          </p>
        </div>
        <div className="flex gap-2">
          {prompts.length === 0 && (
            <Button
              variant="outline"
              onClick={handleImportDefaults}
              disabled={loading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Importar do Sistema
            </Button>
          )}
          <Select
            value={selectedChatbot}
            onValueChange={(v) => setSelectedChatbot(v as 'guata' | 'koda')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guata">🦦 Guatá</SelectItem>
              <SelectItem value="koda">🦌 Koda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(PROMPT_TYPES).map(([type, config]) => (
            <TabsTrigger key={type} value={type} className="text-xs">
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(PROMPT_TYPES).map(([type, config]) => {
          const activePrompt = getActivePrompt(type);
          const variables = activePrompt ? getPromptVariables(activePrompt.content) : [];

          return (
            <TabsContent key={type} value={type} className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.label}</CardTitle>
                      <CardDescription>
                        {config.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {activePrompt && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistory(type)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            Histórico
                          </Button>
                          <Badge variant={activePrompt.is_active ? 'default' : 'secondary'}>
                            {activePrompt.is_active ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Ativo v{activePrompt.version}
                              </>
                            ) : (
                              <>
                                <AlertCircle className="mr-1 h-3 w-3" />
                                Inativo
                              </>
                            )}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activePrompt ? (
                    <>
                      <div>
                        <Label>Conteúdo do Prompt</Label>
                        <Textarea
                          value={editingPrompt?.id === activePrompt.id ? editingPrompt.content : activePrompt.content}
                          onChange={(e) => {
                            if (!editingPrompt || editingPrompt.id !== activePrompt.id) {
                              setEditingPrompt({ ...activePrompt, content: e.target.value });
                            } else {
                              setEditingPrompt({ ...editingPrompt, content: e.target.value });
                            }
                          }}
                          className="min-h-[300px] font-mono text-sm"
                          placeholder="Digite o prompt aqui..."
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Use variáveis como {'{user_location}'}, {'{question}'}, {'{conversation_history}'}, etc.
                        </p>
                      </div>

                      {variables.length > 0 && (
                        <div>
                          <Label className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Variáveis Detectadas
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {variables.map(variable => (
                              <Badge key={variable} variant="outline">
                                {'{'}{variable}{'}'}
                                {VARIABLE_DESCRIPTIONS[variable] && (
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    - {VARIABLE_DESCRIPTIONS[variable]}
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            if (!editingPrompt || editingPrompt.id !== activePrompt.id) {
                              setEditingPrompt(activePrompt);
                            }
                            handleSave();
                          }}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!editingPrompt || editingPrompt.id !== activePrompt.id) {
                              setEditingPrompt(activePrompt);
                            }
                            handleCreateNewVersion();
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Criar Nova Versão
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!editingPrompt || editingPrompt.id !== activePrompt.id) {
                              setEditingPrompt(activePrompt);
                            }
                            handlePreview();
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>

                      {activePrompt.description && (
                        <div className="p-4 bg-muted rounded-md">
                          <Label className="text-sm font-semibold">Descrição</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activePrompt.description}
                          </p>
                        </div>
                      )}

                      {activePrompt.notes && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                          <Label className="text-sm font-semibold">Notas</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activePrompt.notes}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        Nenhum prompt ativo para este tipo
                      </p>
                      <Button
                        onClick={() => {
                          setEditingPrompt({
                            id: '',
                            chatbot_name: selectedChatbot,
                            prompt_type: type as any,
                            content: '',
                            variables: {},
                            is_active: true,
                            version: 1,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          } as any);
                        }}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Criar Novo Prompt
                      </Button>
                    </div>
                  )}

                  {editingPrompt && editingPrompt.prompt_type === type && editingPrompt.id !== activePrompt?.id && (
                    <div className="p-4 border-2 border-primary rounded-md">
                      <Label className="text-sm font-semibold">Editando...</Label>
                      <Textarea
                        value={editingPrompt.content}
                        onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                        className="min-h-[300px] font-mono text-sm mt-2"
                      />
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleSave}>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingPrompt(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Dialog de Preview */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Prompt</DialogTitle>
            <DialogDescription>
              Visualização do prompt com variáveis substituídas por exemplos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {previewPrompt}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Versões</DialogTitle>
            <DialogDescription>
              Todas as versões deste prompt
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {versionHistory.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      Versão {prompt.version}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {prompt.is_active && (
                        <Badge>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Ativo
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(prompt.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-muted p-4 rounded-md max-h-[200px] overflow-y-auto">
                    {prompt.content}
                  </pre>
                  {prompt.notes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Notas: {prompt.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

