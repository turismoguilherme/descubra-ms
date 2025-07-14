import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Shield, Trash2, AlertTriangle, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
}

const AdminUserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [elevateEmail, setElevateEmail] = useState("");
  const [isElevating, setIsElevating] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const roles = [
    { value: "admin", label: "Administrador", color: "bg-red-500" },
    { value: "tech", label: "Técnico", color: "bg-indigo-500" },
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

  const elevateUserToAdmin = async () => {
    if (!elevateEmail.trim()) {
      toast({
        title: "Erro",
        description: "Digite o email do usuário",
        variant: "destructive"
      });
      return;
    }

    setIsElevating(true);
    try {
      const { error } = await supabase.rpc('elevate_to_admin', {
        user_email: elevateEmail.trim()
      });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Usuário ${elevateEmail} elevado a administrador!`,
        variant: "default"
      });
      
      setElevateEmail("");
      await fetchUsers();
    } catch (error: any) {
      console.error("Erro ao elevar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao elevar usuário a admin",
        variant: "destructive"
      });
    } finally {
      setIsElevating(false);
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

  const deleteUserFromAuth = async () => {
    if (!userToDelete || deleteConfirmEmail !== userToDelete.email) {
      toast({
        title: "Erro",
        description: "Digite exatamente o email do usuário para confirmar",
        variant: "destructive"
      });
      return;
    }

    try {
      // Usar Admin API do Supabase para deletar usuário
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Usuário deletado",
        description: `Usuário ${userToDelete.email} foi removido do sistema`,
        variant: "default"
      });
      
      setUserToDelete(null);
      setDeleteConfirmEmail("");
      await fetchUsers();
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar usuário",
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
          <h1 className="text-3xl font-bold">Gerenciamento Avançado de Usuários</h1>
          <p className="text-muted-foreground">Controle completo de usuários e permissões administrativas</p>
        </div>
      </div>

      {/* Elevar usuário para admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Elevar Usuário a Administrador
          </CardTitle>
          <CardDescription>
            Promover um usuário existente para administrador do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Email do usuário</Label>
              <Input
                type="email"
                placeholder="usuario@exemplo.com"
                value={elevateEmail}
                onChange={(e) => setElevateEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={elevateUserToAdmin} 
                disabled={isElevating || !elevateEmail.trim()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isElevating ? "Elevando..." : "Elevar a Admin"}
              </Button>
            </div>
          </div>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta operação é irreversível e será registrada no log de auditoria. 
              Apenas administradores podem elevar outros usuários.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Atualizar papel de usuário */}
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

      {/* Lista de usuários com opção de deletar */}
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
                    Criado: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    {user.last_sign_in_at && (
                      <> • Último login: {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  {/* Botão de deletar usuário */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                        disabled={user.role === 'admin' && user.id === user.id} // Não permitir auto-delete de admin
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-red-600">⚠️ Deletar Usuário</DialogTitle>
                        <DialogDescription>
                          Esta ação é <strong>IRREVERSÍVEL</strong> e removerá o usuário completamente do sistema.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Para confirmar, digite exatamente o email: <strong>{userToDelete?.email}</strong>
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          <Label>Confirme o email para deletar</Label>
                          <Input
                            type="email"
                            placeholder="Digite o email para confirmar"
                            value={deleteConfirmEmail}
                            onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            onClick={deleteUserFromAuth}
                            disabled={deleteConfirmEmail !== userToDelete?.email}
                            className="flex-1"
                          >
                            Confirmar Deleção
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setUserToDelete(null);
                              setDeleteConfirmEmail("");
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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

export default AdminUserManagement;