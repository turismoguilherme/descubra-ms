import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, user_id, created_at')
        .limit(100);

      if (error) throw error;

      // Buscar roles
      const userIds = profiles?.map(p => p.user_id).filter(Boolean) || [];
      let roles: Array<{ user_id: string; role: string }> = [];
      if (userIds.length > 0) {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
        roles = rolesData || [];
      }

      const usersData: User[] = (profiles || []).map(profile => {
        const role = roles.find(r => r.user_id === profile.user_id);
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: '', // Email não disponível sem admin API
          role: role?.role || 'user',
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
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Usuários"
        description="Gerencie os usuários finais que acessam a plataforma Descubra MS. Você pode bloquear ou desbloquear usuários."
        helpText="Gerencie os usuários finais que acessam a plataforma Descubra MS. Você pode bloquear ou desbloquear usuários."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuário..."
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
                  <TableHead>Role</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
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
                                description: `Nome: ${user.full_name || 'N/A'}\nRole: ${user.role}\nCadastro: ${user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}`,
                              });
                            }}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              if (!confirm(`Tem certeza que deseja ${user.role === 'banned' ? 'desbloquear' : 'bloquear'} este usuário?`)) return;
                              
                              try {
                                // Atualizar role para 'banned' ou reverter
                                const newRole = user.role === 'banned' ? 'user' : 'banned';
                                
                                // Buscar user_id do profile
                                const { data: profile } = await supabase
                                  .from('user_profiles')
                                  .select('user_id')
                                  .eq('id', user.id)
                                  .single();
                                
                                if (profile?.user_id) {
                                  // Atualizar role
                                  const { error: roleError } = await supabase
                                    .from('user_roles')
                                    .upsert({
                                      user_id: profile.user_id,
                                      role: newRole,
                                    }, {
                                      onConflict: 'user_id'
                                    });
                                  
                                  if (roleError) throw roleError;
                                  
                                  toast({
                                    title: 'Sucesso',
                                    description: `Usuário ${newRole === 'banned' ? 'bloqueado' : 'desbloqueado'} com sucesso`,
                                  });
                                  
                                  fetchUsers();
                                }
                              } catch (error: unknown) {
                                const err = error instanceof Error ? error : new Error(String(error));
                                toast({
                                  title: 'Erro',
                                  description: err.message || 'Erro ao atualizar usuário',
                                  variant: 'destructive',
                                });
                              }
                            }}
                            title={user.role === 'banned' ? 'Desbloquear usuário' : 'Bloquear usuário'}
                          >
                            <Ban className="h-4 w-4" />
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
