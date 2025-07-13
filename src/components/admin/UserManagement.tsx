import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Shield, Eye, Trash2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}

interface TestUser {
  email: string;
  password: string;
  role: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingTests, setIsCreatingTests] = useState(false);
  const [newUserRole, setNewUserRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const roles = [
    { value: "admin", label: "Administrador", color: "bg-red-500" },
    { value: "diretor_estadual", label: "Diretor Estadual", color: "bg-purple-500" },
    { value: "gestor_igr", label: "Gestor IGR", color: "bg-blue-500" },
    { value: "gestor_municipal", label: "Gestor Municipal", color: "bg-green-500" },
    { value: "atendente", label: "Atendente", color: "bg-yellow-500" },
    { value: "user", label: "Usuário", color: "bg-gray-500" }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_users_with_details');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestUsers = async () => {
    setIsCreatingTests(true);
    try {
      const { data, error } = await supabase.rpc('create_test_user_profiles');
      
      if (error) throw error;
      
      // A nova função retorna dados com formato diferente
      const testUserData = data as Array<{user_id_created: string, email_ref: string, role_assigned: string}>;
      
      toast({
        title: "Sucesso",
        description: `${testUserData?.length || 0} perfis de usuários de teste criados! Lembre-se de criar os usuários no Supabase Auth primeiro.`,
        variant: "default"
      });
      
      // Atualizar lista de usuários
      await fetchUsers();
    } catch (error) {
      console.error("Erro ao criar perfis de usuários de teste:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar usuários de teste",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTests(false);
    }
  };

  const updateUserRole = async () => {
    if (!selectedUserId || !newUserRole) {
      toast({
        title: "Erro",
        description: "Selecione um usuário e um papel",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('secure_update_user_role', {
        target_user_id: selectedUserId,
        new_role: newUserRole
      });
      
      if (error) throw error;
      
      if (data) {
        toast({
          title: "Sucesso",
          description: "Papel do usuário atualizado com sucesso!",
          variant: "default"
        });
        await fetchUsers();
        setSelectedUserId("");
        setNewUserRole("");
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar papel do usuário. Verifique suas permissões.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar papel:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar papel do usuário",
        variant: "destructive"
      });
    }
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getRoleColor = (role: string) => {
    return roles.find(r => r.value === role)?.color || "bg-gray-500";
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie usuários e suas permissões no sistema</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Criar Usuários de Teste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Usuários de Teste</DialogTitle>
              <DialogDescription>
                Isso criará usuários de teste para todos os papéis disponíveis no sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Os usuários de teste serão criados apenas no banco de dados. 
                  Para fazer login, você precisará usar o painel do Supabase Auth.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={createTestUsers} 
                disabled={isCreatingTests}
                className="w-full"
              >
                {isCreatingTests ? "Criando..." : "Criar Usuários de Teste"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seção de usuários de teste criados */}
      {testUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Usuários de Teste Criados
            </CardTitle>
            <CardDescription>
              Use essas credenciais para testar diferentes níveis de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testUsers.map((testUser, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Badge className={getRoleColor(testUser.role)}>
                      {getRoleLabel(testUser.role)}
                    </Badge>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {testUser.email}</div>
                      <div><strong>Senha:</strong> {testUser.password}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de atualização de papéis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Atualizar Papel do Usuário
          </CardTitle>
          <CardDescription>
            Modifique o papel de usuários existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Novo Papel</Label>
              <Select value={newUserRole} onValueChange={setNewUserRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={updateUserRole} className="w-full">
                Atualizar Papel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários do Sistema ({users.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{user.full_name || user.email}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;