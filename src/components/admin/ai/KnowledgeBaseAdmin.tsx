/**
 * 📚 KNOWLEDGE BASE ADMIN
 * Interface de admin para gerenciar base de conhecimento do Guatá e Koda
 * Suporta upload de arquivos e edição manual
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Upload,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Download,
  Filter,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  knowledgeBaseAdminService,
  KnowledgeBaseEntry,
  KnowledgeBaseFilters,
} from '@/services/admin/knowledgeBaseAdminService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function KnowledgeBaseAdmin() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<KnowledgeBaseFilters>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<string | null>(null);
  const [uploadItems, setUploadItems] = useState<KnowledgeBaseEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'files'>('list');

  useEffect(() => {
    loadEntries();
    loadStatistics();
    loadUploadedFiles();
  }, [filters]);

  useEffect(() => {
    if (selectedUpload) {
      loadUploadItems();
    }
  }, [selectedUpload]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const allFilters = { ...filters };
      if (searchTerm) allFilters.search = searchTerm;
      const data = await knowledgeBaseAdminService.getEntries(allFilters);
      setEntries(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar base de conhecimento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await knowledgeBaseAdminService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const files = await knowledgeBaseAdminService.getUploadedFiles();
      setUploadedFiles(files);
    } catch (error) {
      console.error('Erro ao carregar arquivos enviados:', error);
    }
  };

  const loadUploadItems = async () => {
    if (!selectedUpload) return;
    try {
      const items = await knowledgeBaseAdminService.getItemsByUpload(selectedUpload);
      setUploadItems(items);
    } catch (error) {
      console.error('Erro ao carregar itens do upload:', error);
    }
  };

  const handleSave = async () => {
    if (!editingEntry) return;

    try {
      if (isCreating) {
        await knowledgeBaseAdminService.createEntry(editingEntry);
        toast({
          title: 'Sucesso',
          description: 'Item criado com sucesso',
        });
      } else {
        await knowledgeBaseAdminService.updateEntry(editingEntry.id, editingEntry);
        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso',
        });
      }

      setEditingEntry(null);
      setIsCreating(false);
      loadEntries();
      loadStatistics();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao salvar',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;

    try {
      await knowledgeBaseAdminService.deleteEntry(id);
      toast({
        title: 'Sucesso',
        description: 'Item deletado com sucesso',
      });
      loadEntries();
      loadStatistics();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao deletar',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const chatbotTarget = filters.chatbot || 'guata';
      const result = await knowledgeBaseAdminService.processFileUpload(file, chatbotTarget as any);

      if (result.entries.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum item encontrado no arquivo',
          variant: 'destructive',
        });
        return;
      }

      // Importar itens vinculados ao upload
      const importResult = await knowledgeBaseAdminService.importEntries(result.entries, result.uploadId);

      toast({
        title: 'Importação concluída',
        description: `${importResult.success} itens importados${importResult.errors.length > 0 ? `. ${importResult.errors.length} erros.` : ''}`,
      });

      if (importResult.errors.length > 0) {
        console.error('Erros na importação:', importResult.errors);
      }

      setUploadDialogOpen(false);
      loadEntries();
      loadStatistics();
      loadUploadedFiles();
      setActiveTab('files'); // Mudar para aba de arquivos
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao processar arquivo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUpload = async (uploadId: string, deleteItems: boolean) => {
    if (!confirm(`Tem certeza? ${deleteItems ? 'Isso também excluirá todos os itens criados por este arquivo.' : 'Apenas o registro do arquivo será removido.'}`)) {
      return;
    }

    try {
      await knowledgeBaseAdminService.deleteUpload(uploadId, deleteItems);
      toast({
        title: 'Sucesso',
        description: 'Arquivo removido com sucesso',
      });
      loadUploadedFiles();
      if (deleteItems) {
        loadEntries();
        loadStatistics();
      }
      if (selectedUpload === uploadId) {
        setSelectedUpload(null);
        setUploadItems([]);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao remover arquivo',
        variant: 'destructive',
      });
    }
  };

  const categories = ['destinos', 'eventos', 'gastronomia', 'informações', 'atrações', 'hospedagem', 'transporte'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Base de Conhecimento</h2>
          <p className="text-muted-foreground">
            Gerencie informações do Guatá e Koda
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Arquivo
          </Button>
          <Button onClick={() => {
            setEditingEntry({
              id: '',
              chatbot: 'guata',
              pergunta: '',
              pergunta_normalizada: '',
              resposta: '',
              tipo: 'geral',
              categoria: 'informações',
              tags: [],
              fonte: 'manual',
              ativo: true,
              usado_por: 0,
              ultima_atualizacao: new Date().toISOString(),
              criado_em: new Date().toISOString(),
            } as any);
            setIsCreating(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas no topo */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">Total de Itens</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.byChatbot.guata}</div>
              <p className="text-xs text-muted-foreground">Guatá</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statistics.byChatbot.koda}</div>
              <p className="text-xs text-muted-foreground">Koda</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{uploadedFiles.length}</div>
              <p className="text-xs text-muted-foreground">Arquivos Enviados</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="list">📋 Lista de Itens</TabsTrigger>
          <TabsTrigger value="files">📁 Arquivos Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setTimeout(() => loadEntries(), 300);
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <Label>Chatbot</Label>
                  <Select
                    value={filters.chatbot || 'all'}
                    onValueChange={(v) => {
                      setFilters({ ...filters, chatbot: v === 'all' ? undefined : v as any });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="guata">Guatá</SelectItem>
                      <SelectItem value="koda">Koda</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={filters.categoria || 'all'}
                    onValueChange={(v) => {
                      setFilters({ ...filters, categoria: v === 'all' ? undefined : v });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.ativo === undefined ? 'all' : filters.ativo ? 'active' : 'inactive'}
                    onValueChange={(v) => {
                      setFilters({
                        ...filters,
                        ativo: v === 'all' ? undefined : v === 'active',
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista */}
          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum item encontrado
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{entry.titulo || entry.pergunta}</h3>
                          <Badge variant={entry.chatbot === 'guata' ? 'default' : 'secondary'}>
                            {entry.chatbot}
                          </Badge>
                          {entry.ativo ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {entry.resposta}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Categoria: {entry.categoria || 'N/A'}</span>
                          <span>Usado: {entry.usado_por}x</span>
                          {entry.arquivo_original && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {entry.arquivo_original}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEntry(entry);
                            setIsCreating(false);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {uploadedFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum arquivo enviado ainda
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold">{file.filename}</h3>
                          <Badge variant={file.status === 'completed' ? 'default' : file.status === 'failed' ? 'destructive' : 'secondary'}>
                            {file.status === 'completed' ? 'Concluído' : file.status === 'failed' ? 'Falhou' : 'Processando'}
                          </Badge>
                          {file.chatbot_target && (
                            <Badge variant="outline">{file.chatbot_target}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                          <div>
                            <span className="font-medium">Enviado:</span>{' '}
                            {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div>
                            <span className="font-medium">Itens criados:</span> {file.items_created || 0}
                          </div>
                          <div>
                            <span className="font-medium">Falhas:</span> {file.items_failed || 0}
                          </div>
                          <div>
                            <span className="font-medium">Tamanho:</span>{' '}
                            {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : 'N/A'}
                          </div>
                        </div>
                        {file.error_message && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-600 dark:text-red-400">
                            <strong>Erro:</strong> {file.error_message}
                          </div>
                        )}
                        {selectedUpload === file.id && uploadItems.length > 0 && (
                          <div className="mt-4 p-4 bg-muted rounded-md">
                            <h4 className="font-medium mb-2">Itens criados por este arquivo ({uploadItems.length}):</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {uploadItems.map((item) => (
                                <div key={item.id} className="text-sm flex items-center justify-between p-2 bg-background rounded">
                                  <span>{item.titulo || item.pergunta}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingEntry(item);
                                      setIsCreating(false);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (selectedUpload === file.id) {
                              setSelectedUpload(null);
                              setUploadItems([]);
                            } else {
                              setSelectedUpload(file.id);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {selectedUpload === file.id ? 'Ocultar' : 'Ver'} Itens
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUpload(file.id, false)}
                          disabled={file.status === 'deleted'}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Registro
                        </Button>
                        {file.items_created > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUpload(file.id, true)}
                            disabled={file.status === 'deleted'}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Tudo
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isCreating ? 'Criar Item' : 'Editar Item'}</DialogTitle>
              <DialogDescription>
                {isCreating ? 'Adicione um novo item à base de conhecimento' : 'Edite as informações do item'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chatbot</Label>
                  <Select
                    value={editingEntry.chatbot}
                    onValueChange={(v) => setEditingEntry({ ...editingEntry, chatbot: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guata">Guatá</SelectItem>
                      <SelectItem value="koda">Koda</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={editingEntry.titulo || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, titulo: e.target.value })}
                    placeholder="Título do item"
                  />
                </div>
              </div>
              <div>
                <Label>Pergunta</Label>
                <Input
                  value={editingEntry.pergunta}
                  onChange={(e) => setEditingEntry({ ...editingEntry, pergunta: e.target.value })}
                  placeholder="Pergunta ou tópico"
                />
              </div>
              <div>
                <Label>Resposta</Label>
                <Textarea
                  value={editingEntry.resposta}
                  onChange={(e) => setEditingEntry({ ...editingEntry, resposta: e.target.value })}
                  placeholder="Resposta ou conteúdo"
                  className="min-h-[200px]"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={editingEntry.categoria || 'informações'}
                    onValueChange={(v) => setEditingEntry({ ...editingEntry, categoria: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={editingEntry.tipo}
                    onValueChange={(v) => setEditingEntry({ ...editingEntry, tipo: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="conceito">Conceito</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="pessoa">Pessoa</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={editingEntry.prioridade || 5}
                    onChange={(e) => setEditingEntry({ ...editingEntry, prioridade: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingEntry.ativo}
                    onChange={(e) => setEditingEntry({ ...editingEntry, ativo: e.target.checked })}
                  />
                  Ativo
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingEntry(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Upload */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Arquivo</DialogTitle>
            <DialogDescription>
              Faça upload de arquivos TXT, CSV ou JSON para importar múltiplos itens
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Arquivo</Label>
              <Input
                type="file"
                accept=".txt,.csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Formatos aceitos: TXT, CSV, JSON
              </p>
            </div>
            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Processando arquivo...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

