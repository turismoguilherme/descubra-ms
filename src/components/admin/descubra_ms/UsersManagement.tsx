import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Ban, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

interface User {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  platform: 'Descubra MS' | 'ViajarTur';
  status: 'active' | 'inactive';
  protectedAccount: boolean;
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adminCanDelete, setAdminCanDelete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id;

      if (currentUserId) {
        const { data: myRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentUserId)
          .in('role', ['admin', 'master_admin'])
          .limit(1);

        setAdminCanDelete(!!myRoles?.length);
      } else {
        setAdminCanDelete(false);
      }

      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, user_id, user_type, created_at')
        .order('created_at', { ascending: false })
        .limit(300);

      if (error) throw error;

      const userIds = profiles?.map(p => p.user_id).filter(Boolean) || [];
      let roles: Array<{ user_id: string; role: string }> = [];
      let viajarRows: Array<{ user_id: string | null; is_active: boolean | null }> = [];
      if (userIds.length > 0) {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
        roles = rolesData || [];

        const { data: viajarData } = await supabase
          .from('viajar_employees')
          .select('user_id, is_active')
          .in('user_id', userIds);
        viajarRows = viajarData || [];
      }

      const rolesMap = new Map<string, string[]>();
      roles.forEach((r) => {
        const list = rolesMap.get(r.user_id) || [];
        list.push(r.role);
        rolesMap.set(r.user_id, list);
      });

      const viajarMap = new Map<string, boolean>();
      viajarRows.forEach((v) => {
        if (v.user_id) viajarMap.set(v.user_id, v.is_active !== false);
      });

      const usersData: User[] = (profiles || []).map(profile => {
        const roleList = rolesMap.get(profile.user_id) || [];
        const isViajar = viajarMap.has(profile.user_id);
        const primaryRole = roleList.includes('banned')
          ? 'banned'
          : (roleList[0] || profile.user_type || 'user');
        const protectedAccount = roleList.includes('admin') || roleList.includes('master_admin');
        const isActive = isViajar ? (viajarMap.get(profile.user_id) ?? true) : !roleList.includes('banned');

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: 'Não disponível',
          role: primaryRole,
          platform: isViajar ? 'ViajarTur' : 'Descubra MS',
          status: isActive ? 'active' : 'inactive',
          protectedAccount,
          created_at: profile.created_at || '',
        };
      });

      setUsers(usersData);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao carregar usuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const metrics = {
    descubraTotal: users.filter((u) => u.platform === 'Descubra MS').length,
    descubraActive: users.filter((u) => u.platform === 'Descubra MS' && u.status === 'active').length,
    viajarTotal: users.filter((u) => u.platform === 'ViajarTur').length,
    viajarActive: users.filter((u) => u.platform === 'ViajarTur' && u.status === 'active').length,
  };

  const handleToggleBlock = async (user: User) => {
    if (user.protectedAccount) {
      toast({
        title: 'Conta protegida',
        description: 'Contas admin/master_admin não podem ser bloqueadas por esta tela.',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja ${user.role === 'banned' ? 'desbloquear' : 'bloquear'} este usuário?`)) return;

    try {
      const newRole = user.role === 'banned' ? 'user' : 'banned';
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: user.user_id, role: newRole },
          { onConflict: 'user_id' }
        );

      if (roleError) throw roleError;

      toast({
        title: 'Sucesso',
        description: `Usuário ${newRole === 'banned' ? 'bloqueado' : 'desbloqueado'} com sucesso`,
      });
      fetchUsers();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao atualizar usuário',
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async (user: User) => {
    if (!adminCanDelete) {
      toast({
        title: 'Sem permissão',
        description: 'Apenas admin/master_admin podem excluir permanentemente.',
        variant: 'destructive',
      });
      return;
    }

    if (user.protectedAccount) {
      toast({
        title: 'Conta protegida',
        description: 'Contas admin/master_admin não podem ser excluídas por esta tela.',
        variant: 'destructive',
      });
      return;
    }

    const sure = confirm(`Excluir permanentemente ${user.full_name || 'este usuário'}? Essa ação é irreversível.`);
    if (!sure) return;
    const confirmation = prompt('Para confirmar, digite EXCLUIR');
    if (confirmation !== 'EXCLUIR') {
      toast({
        title: 'Confirmação inválida',
        description: 'Exclusão cancelada.',
      });
      return;
    }

    const { error } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId: user.user_id },
    });

    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Falha ao excluir usuário.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Usuário excluído',
      description: 'A conta foi removida permanentemente.',
    });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Usuários"
        description="Gerencie usuários do Descubra MS e ViajarTur. Bloqueie ou exclua contas conforme política e solicitações."
        helpText="Exclusão permanente disponível apenas para admin/master_admin. Contas protegidas não podem ser removidas por esta tela."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Descubra MS</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-5 h-5" />
              {metrics.descubraTotal}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {metrics.descubraActive} ativos / {metrics.descubraTotal - metrics.descubraActive} inativos
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ViajarTur</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-5 h-5" />
              {metrics.viajarTotal}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {metrics.viajarActive} ativos / {metrics.viajarTotal - metrics.viajarActive} inativos
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou plataforma..."
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
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.platform}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: 'Detalhes do Usuário',
                                description: `Nome: ${user.full_name || 'N/A'}\nPlataforma: ${user.platform}\nStatus: ${user.status}\nRole: ${user.role}\nCadastro: ${user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}`,
                              });
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleBlock(user)}
                            title={user.role === 'banned' ? 'Desbloquear usuário' : 'Bloquear usuário'}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePermanentDelete(user)}
                            title="Excluir permanentemente"
                            disabled={!adminCanDelete || user.protectedAccount}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
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
