import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Eye, RefreshCw, Database, User, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('master_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      
      // Enriquecer logs com informações do usuário
      const enrichedLogs = await Promise.all(
        (data || []).map(async (log) => {
          let userInfo = { name: 'Sistema', email: 'system' };
          
          if (log.user_id && log.user_id !== 'system') {
            try {
              // Tentar buscar do user_profiles primeiro
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name, email')
                .eq('user_id', log.user_id)
                .single();
              
              if (profile) {
                userInfo = { name: profile.full_name || 'Usuário', email: profile.email || log.user_id };
              } else {
                // Se não encontrar, tentar do auth.users via RPC ou usar user_id
                userInfo = { name: log.details?.user_name || 'Usuário', email: log.details?.user_email || log.user_id };
              }
            } catch (e) {
              // Usar dados do details se disponível
              userInfo = { 
                name: log.details?.user_name || log.user_id?.substring(0, 8) || 'Desconhecido', 
                email: log.details?.user_email || log.user_id || 'N/A' 
              };
            }
          }
          
          return {
            ...log,
            user_name: userInfo.name,
            user_email: userInfo.email,
          };
        })
      );
      
      setLogs(enrichedLogs);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge className="bg-green-100 text-green-700">Criar</Badge>;
    if (action.includes('UPDATE')) return <Badge className="bg-blue-100 text-blue-700">Atualizar</Badge>;
    if (action.includes('DELETE')) return <Badge className="bg-red-100 text-red-700">Excluir</Badge>;
    if (action.includes('EXPORT')) return <Badge className="bg-purple-100 text-purple-700">Exportar</Badge>;
    if (action.includes('VIEW')) return <Badge className="bg-gray-100 text-gray-700">Visualizar</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h2>
          <p className="text-gray-600 mt-1">Histórico completo de ações administrativas no sistema</p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ação, tabela, usuário ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Carregando logs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Usuário</TableHead>
                    <TableHead>ID do Registro</TableHead>
                    <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Nenhum log encontrado para a busca' : 'Nenhum log encontrado. As ações serão registradas aqui.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{log.entity_type || '-'}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">{log.user_name || 'Sistema'}</div>
                              <div className="text-xs text-gray-500">{log.user_email || log.user_id?.substring(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">
                          {log.entity_id ? log.entity_id.substring(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Ação de Auditoria
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre esta ação registrada no sistema
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ação</label>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data/Hora</label>
                  <div className="mt-1 text-sm">
                    {format(new Date(selectedLog.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tabela</label>
                  <div className="mt-1 font-medium">{selectedLog.entity_type || '-'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID do Registro</label>
                  <div className="mt-1 font-mono text-xs">{selectedLog.entity_id || '-'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Usuário</label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedLog.user_name || 'Sistema'}</div>
                    <div className="text-xs text-gray-500">{selectedLog.user_email || selectedLog.user_id}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID do Usuário</label>
                  <div className="mt-1 font-mono text-xs">{selectedLog.user_id || '-'}</div>
                </div>
              </div>
              
              {selectedLog.details && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Detalhes Completos</label>
                  <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
