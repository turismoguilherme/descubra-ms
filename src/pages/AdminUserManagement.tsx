import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Shield, Database } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  user_type: string;
  created_at: string;
}

const AdminUserManagement: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { value: 'admin', label: 'Administrador', description: 'Acesso completo ao sistema' },
    { value: 'diretor_estadual', label: 'Diretor Estadual', description: 'Visão de todos os dados do estado' },
    { value: 'gestor_igr', label: 'Gestor IGR', description: 'Gestor de Região Turística' },
    { value: 'gestor_municipal', label: 'Gestor Municipal', description: 'Gestor de município específico' },
    { value: 'atendente', label: 'Atendente CAT', description: 'Operações de Centro de Atendimento' },
    { value: 'user', label: 'Usuário', description: 'Usuário comum da plataforma' }
  ];

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar usuários com perfis e roles
      const { data: usersData, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          full_name,
          user_type,
          created_at
        `);

      if (error) throw error;

      // Buscar roles dos usuários
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Buscar emails dos usuários da tabela auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Combinar dados
      const combinedUsers = usersData?.map(profile => {
        const authUser = authData?.users?.find((u: any) => u.id === profile.user_id);
        const userRole = rolesData?.find(r => r.user_id === profile.user_id);
        
        return {
          id: profile.user_id,
          email: authUser?.email || 'Email não encontrado',
          full_name: profile.full_name || 'Nome não definido',
          role: userRole?.role || 'user',
          user_type: profile.user_type || 'tourist',
          created_at: profile.created_at
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async () => {
    if (!promoteEmail || !selectedRole) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o email e selecione um role.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('promote_user_to_role', {
        p_email: promoteEmail,
        p_role: selectedRole
      });

      if (error) throw error;

      toast({
        title: "Usuário promovido com sucesso",
        description: `O usuário ${promoteEmail} foi promovido para ${selectedRole}.`
      });

      setPromoteEmail('');
      setSelectedRole('');
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro ao promover usuário",
        description: error.message || "Não foi possível promover o usuário.",
        variant: "destructive"
      });
    }
  };

  const createTestAccounts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: {}
      });

      if (error) {
        console.error('Erro ao criar contas de teste:', error);
        toast({
          title: "Erro ao criar contas de teste",
          description: error.message || "Não foi possível criar as contas de teste.",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        const successCount = data.results.filter((r: any) => r.status === 'created').length;
        const existingCount = data.results.filter((r: any) => r.status === 'already_exists').length;
        const errorCount = data.results.filter((r: any) => r.status === 'error').length;

        let message = `${successCount} contas criadas com sucesso.`;
        if (existingCount > 0) {
          message += ` ${existingCount} já existiam.`;
        }
        if (errorCount > 0) {
          message += ` ${errorCount} falharam.`;
        }

        toast({
          title: "Processo concluído",
          description: message
        });

        loadUsers();
      }
    } catch (error) {
      console.error('Erro geral ao criar contas:', error);
      toast({
        title: "Erro ao criar contas de teste",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user && userProfile?.role === 'admin') {
      loadUsers();
    }
  }, [user, userProfile]);

  // Verificar se o usuário é admin
  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="promote">Promover Usuário</TabsTrigger>
          <TabsTrigger value="test">Criar Contas de Teste</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Usuários Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{userData.full_name}</p>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Criado em: {new Date(userData.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{userData.user_type}</Badge>
                        <Badge variant={userData.role === 'admin' ? 'destructive' : 'default'}>
                          {roles.find(r => r.value === userData.role)?.label || userData.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Promover Usuário Existente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email do Usuário</Label>
                <Input
                  id="email"
                  type="email"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Novo Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePromoteUser} className="w-full">
                Promover Usuário
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Contas de Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Criar contas de teste para todos os tipos de usuários do sistema:
              </p>
              
              <div className="grid gap-2">
                {roles.map((role) => (
                  <div key={role.value} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <Badge variant="outline">{role.value}@ms.gov.br</Badge>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Aviso:</strong> Todas as contas de teste terão senhas no formato: [Role]123!
                </p>
              </div>

              <Button onClick={createTestAccounts} className="w-full">
                Criar Todas as Contas de Teste
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserManagement;