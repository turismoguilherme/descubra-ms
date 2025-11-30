import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { aiAdminService } from '@/services/admin/aiAdminService';
import { useToast } from '@/hooks/use-toast';
import { AIAdminAction } from '@/types/admin';

export default function AIActionsQueue() {
  const [actions, setActions] = useState<AIAdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const data = await aiAdminService.getActions();
      setActions(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar ações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await aiAdminService.approveAction(id, user.id);
        // Se a ação não requer aprovação, executar imediatamente
        const action = actions.find(a => a.id === id);
        if (action && !action.requires_approval) {
          await aiAdminService.executeAction(id);
        }
        toast({ title: 'Sucesso', description: 'Ação aprovada' });
        fetchActions();
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao aprovar ação',
        variant: 'destructive',
      });
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await aiAdminService.executeAction(id);
      toast({ title: 'Sucesso', description: 'Ação executada' });
      fetchActions();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao executar ação',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await aiAdminService.rejectAction(id);
      toast({ title: 'Sucesso', description: 'Ação rejeitada' });
      fetchActions();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao rejeitar ação',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const pendingActions = actions.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ações Pendentes</h2>
          <p className="text-gray-600 mt-1">Ações da IA aguardando aprovação</p>
        </div>
        <Button variant="outline" onClick={fetchActions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {pendingActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Pendentes ({pendingActions.length})</CardTitle>
            <CardDescription>Ações que requerem sua aprovação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div key={action.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{action.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Tipo: {action.action_type} | Plataforma: {action.platform || 'Ambas'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(action.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(action.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações</CardTitle>
          <CardDescription>Todas as ações da IA</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma ação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  actions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="text-sm">
                        {new Date(action.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{action.action_type}</Badge>
                      </TableCell>
                      <TableCell>{action.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(action.status)}
                          <Badge variant={
                            action.status === 'approved' || action.status === 'executed' 
                              ? 'default' 
                              : action.status === 'rejected' 
                              ? 'destructive' 
                              : 'secondary'
                          }>
                            {action.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{action.platform || '-'}</TableCell>
                      <TableCell className="text-right">
                        {action.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecute(action.id)}
                          >
                            Executar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
