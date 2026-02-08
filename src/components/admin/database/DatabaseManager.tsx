import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Database, Table, Plus, Edit, Trash2, Search, RefreshCw, Download,
  Upload, Eye, Filter, ChevronLeft, ChevronRight, MoreHorizontal,
  AlertTriangle, CheckCircle, Copy, FileJson, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Tabelas disponíveis para gerenciamento
const AVAILABLE_TABLES = [
  { name: 'destinations', label: 'Destinos', description: 'Destinos turísticos do Descubra MS', category: 'Descubra MS', sensitive: false },
  { name: 'events', label: 'Eventos', description: 'Eventos cadastrados na plataforma', category: 'Descubra MS', sensitive: false },
  { name: 'institutional_partners', label: 'Parceiros', description: 'Parceiros institucionais', category: 'Descubra MS', sensitive: false },
  { name: 'passport_routes', label: 'Rotas do Passaporte', description: 'Rotas do passaporte digital', category: 'Passaporte', sensitive: false },
  { name: 'passport_checkpoints', label: 'Checkpoints', description: 'Pontos de check-in', category: 'Passaporte', sensitive: false },
  { name: 'rewards', label: 'Recompensas', description: 'Recompensas do passaporte', category: 'Passaporte', sensitive: false },
  { name: 'user_profiles', label: 'Usuários', description: 'Perfis de usuários', category: 'Sistema', sensitive: true },
  { name: 'viajar_employees', label: 'Funcionários', description: 'Funcionários da ViajARTur', category: 'ViajARTur', sensitive: true },
  { name: 'expenses', label: 'Despesas', description: 'Despesas financeiras', category: 'Financeiro', sensitive: true },
  { name: 'master_financial_records', label: 'Receitas', description: 'Registros de receitas', category: 'Financeiro', sensitive: true },
  { name: 'guata_knowledge_base', label: 'Base de Conhecimento IA', description: 'Conhecimento do Guatá', category: 'IA', sensitive: false },
];

// Função helper para registrar ações de auditoria
const logAuditAction = async (
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'VIEW',
  tableName: string,
  recordId?: string,
  oldData?: unknown,
  newData?: unknown
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userProfile = user ? await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('user_id', user.id)
      .single() : null;

    await supabase.from('master_activity_logs').insert({
      user_id: user?.id || 'system',
      action: `DATABASE_${action}`,
      entity_type: tableName,
      entity_id: recordId,
      details: {
        table: tableName,
        action,
        record_id: recordId,
        user_email: userProfile?.data?.email || user?.email,
        user_name: userProfile?.data?.full_name || 'Sistema',
        old_data: oldData ? JSON.stringify(oldData) : null,
        new_data: newData ? JSON.stringify(newData) : null,
        ip_address: null, // Pode ser obtido do servidor se necessário
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao registrar ação de auditoria:', error);
    // Não falhar a operação principal se o log falhar
  }
};

interface TableData {
  columns: string[];
  rows: unknown[];
  total: number;
}

export default function DatabaseManager() {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
    }
  }, [selectedTable, page]);

  const loadTableData = async () => {
    if (!selectedTable) return;
    
    setLoading(true);
    try {
      // Buscar dados da tabela
      const { data, error, count } = await supabase
        .from(selectedTable as any)
        .select('*', { count: 'exact' })
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extrair colunas dos dados
      const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
      
      setTableData({
        columns,
        rows: data || [],
        total: count || 0,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao carregar tabela:', err);
      toast({
        title: 'Erro ao carregar dados',
        description: err.message || 'Não foi possível carregar a tabela',
        variant: 'destructive',
      });
      setTableData({ columns: [], rows: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingRecord(null);
    setFormData({});
    setEditDialogOpen(true);
  };

  const handleEdit = (record: unknown) => {
    setIsCreating(false);
    setEditingRecord(record);
    setFormData({ ...record });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Remover campos que não devem ser enviados
      const dataToSave = { ...formData };
      delete dataToSave.id;
      delete dataToSave.created_at;
      delete dataToSave.updated_at;

      if (isCreating) {
        const { data, error } = await supabase
          .from(selectedTable as any)
          .insert(dataToSave)
          .select()
          .single();
        
        if (error) throw error;
        
        // Registrar ação de auditoria
        await logAuditAction('CREATE', selectedTable, data?.id, null, dataToSave);
        
        toast({ title: 'Registro criado com sucesso!' });
      } else {
        // Salvar dados antigos para auditoria
        const oldData = { ...editingRecord };
        
        const { error } = await supabase
          .from(selectedTable as any)
          .update(dataToSave)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
        
        // Registrar ação de auditoria
        await logAuditAction('UPDATE', selectedTable, editingRecord.id, oldData, dataToSave);
        
        toast({ title: 'Registro atualizado com sucesso!' });
      }

      setEditDialogOpen(false);
      loadTableData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Não foi possível salvar o registro',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    // Buscar dados do registro antes de excluir para auditoria
    const recordToDelete = tableData?.rows.find(r => r.id === id);
    
    // Confirmação mais robusta
    const confirmed = window.confirm(
      `⚠️ ATENÇÃO: Você está prestes a EXCLUIR permanentemente um registro da tabela "${selectedTable}".\n\n` +
      `ID: ${id}\n\n` +
      `Esta ação NÃO pode ser desfeita. Deseja continuar?`
    );
    
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from(selectedTable as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Registrar ação de auditoria
      await logAuditAction('DELETE', selectedTable, id, recordToDelete, null);
      
      toast({ title: 'Registro excluído com sucesso!' });
      loadTableData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro ao excluir',
        description: err.message || 'Não foi possível excluir o registro',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    if (!tableData || tableData.rows.length === 0) {
      toast({ title: 'Nenhum dado para exportar', variant: 'destructive' });
      return;
    }

    const jsonData = JSON.stringify(tableData.rows, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Registrar ação de auditoria
    await logAuditAction('EXPORT', selectedTable, undefined, undefined, { record_count: tableData.rows.length });
    
    toast({ title: 'Dados exportados com sucesso!' });
  };

  const formatValue = (value: unknown, column: string) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
    if (column.includes('date') || column.includes('_at')) {
      try {
        return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      } catch {
        return value;
      }
    }
    if (typeof value === 'string' && value.length > 50) {
      return value.slice(0, 50) + '...';
    }
    return String(value);
  };

  const getFieldType = (column: string, value: unknown) => {
    if (column === 'id') return 'readonly';
    if (column.includes('_at') || column.includes('date')) return 'datetime';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'json';
    if (column.includes('description') || column.includes('content') || column.includes('notes')) return 'textarea';
    return 'text';
  };

  // Obter categorias únicas
  const categories = Array.from(new Set(AVAILABLE_TABLES.map(t => t.category)));
  
  // Filtrar tabelas por categoria selecionada
  const filteredTables = selectedCategory === 'all' 
    ? AVAILABLE_TABLES 
    : AVAILABLE_TABLES.filter(t => t.category === selectedCategory);

  const groupedTables = filteredTables.reduce((acc, table) => {
    if (!acc[table.category]) acc[table.category] = [];
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_TABLES>);

  const totalPages = tableData ? Math.ceil(tableData.total / pageSize) : 0;

  const filteredRows = tableData?.rows.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gerenciador de Banco de Dados</h2>
          <p className="text-slate-500 mt-1">Visualize e gerencie todas as tabelas do sistema</p>
        </div>
      </div>

      {/* Filtros por Categoria */}
      <Card className="bg-white border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar por categoria:
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTable('');
                }}
                className={selectedCategory === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                Todas ({AVAILABLE_TABLES.length})
              </Button>
              {categories.map((category) => {
                const count = AVAILABLE_TABLES.filter(t => t.category === category).length;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedTable('');
                    }}
                    className={selectedCategory === category ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {category} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de Tabelas */}
        <Card className="lg:col-span-1 bg-white border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Tabelas Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            {Object.keys(groupedTables).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tabela encontrada para esta categoria</p>
              </div>
            ) : (
              Object.entries(groupedTables).map(([category, tables]) => (
                <div key={category} className="border-b border-slate-100 last:border-0">
                  <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase flex items-center justify-between">
                    <span>{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {tables.length}
                    </Badge>
                  </div>
                {tables.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => {
                      setSelectedTable(table.name);
                      setPage(0);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left",
                      selectedTable === table.name
                        ? "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Table className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{table.label}</div>
                      <div className="text-xs text-slate-400 truncate">{table.description}</div>
                    </div>
                  </button>
                ))}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Visualização da Tabela */}
        <Card className="lg:col-span-3 bg-white border-slate-200">
          {!selectedTable ? (
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Database className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Selecione uma tabela</h3>
              <p className="text-sm text-slate-400">Escolha uma tabela no menu lateral para visualizar e gerenciar os dados</p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                    <CardTitle className="text-slate-800">
                      {AVAILABLE_TABLES.find(t => t.name === selectedTable)?.label || selectedTable}
                    </CardTitle>
                      {AVAILABLE_TABLES.find(t => t.name === selectedTable)?.sensitive && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Sensível
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {tableData?.total || 0} registros encontrados
                    </CardDescription>
                    {AVAILABLE_TABLES.find(t => t.name === selectedTable)?.sensitive && (
                      <Alert className="mt-3 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                          ⚠️ Esta tabela contém dados sensíveis. Todas as ações serão registradas para auditoria.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={loadTableData}>
                      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleExport}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : tableData && tableData.rows.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {tableData.columns.slice(0, 6).map((col) => (
                              <th key={col} className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">
                                {col.replace(/_/g, ' ')}
                              </th>
                            ))}
                            <th className="text-right p-3 text-xs font-semibold text-slate-500 uppercase">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((row, idx) => (
                            <tr key={row.id || idx} className="border-b border-slate-50 hover:bg-slate-50">
                              {tableData.columns.slice(0, 6).map((col) => (
                                <td key={col} className="p-3 text-sm text-slate-700">
                                  {formatValue(row[col], col)}
                                </td>
                              ))}
                              <td className="p-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(row)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4 text-slate-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(row.id)}
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <div className="text-sm text-slate-500">
                          Página {page + 1} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                          >
                            Próximo
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Table className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">Nenhum registro encontrado</p>
                    <Button onClick={handleCreate} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar primeiro registro
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Novo Registro' : 'Editar Registro'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {tableData?.columns.map((col) => {
              const value = formData[col];
              const fieldType = getFieldType(col, editingRecord?.[col]);
              
              if (fieldType === 'readonly' && !isCreating) {
                return (
                  <div key={col}>
                    <Label className="text-slate-500">{col.replace(/_/g, ' ')}</Label>
                    <div className="text-sm text-slate-400 mt-1 p-2 bg-slate-50 rounded">
                      {value || '-'}
                    </div>
                  </div>
                );
              }

              if (col === 'id' || col === 'created_at' || col === 'updated_at') {
                return null;
              }

              return (
                <div key={col}>
                  <Label className="capitalize">{col.replace(/_/g, ' ')}</Label>
                  {fieldType === 'textarea' ? (
                    <Textarea
                      value={formData[col] || ''}
                      onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  ) : fieldType === 'boolean' ? (
                    <Select
                      value={formData[col]?.toString() || 'false'}
                      onValueChange={(v) => setFormData({ ...formData, [col]: v === 'true' })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : fieldType === 'json' ? (
                    <Textarea
                      value={typeof formData[col] === 'object' ? JSON.stringify(formData[col], null, 2) : formData[col] || ''}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, [col]: JSON.parse(e.target.value) });
                        } catch {
                          setFormData({ ...formData, [col]: e.target.value });
                        }
                      }}
                      className="mt-1 font-mono text-sm"
                      rows={4}
                    />
                  ) : fieldType === 'number' ? (
                    <Input
                      type="number"
                      value={formData[col] || ''}
                      onChange={(e) => setFormData({ ...formData, [col]: Number(e.target.value) })}
                      className="mt-1"
                    />
                  ) : fieldType === 'datetime' ? (
                    <Input
                      type="datetime-local"
                      value={formData[col] ? new Date(formData[col]).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, [col]: new Date(e.target.value).toISOString() })}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      value={formData[col] || ''}
                      onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                      className="mt-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              {isCreating ? 'Criar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

