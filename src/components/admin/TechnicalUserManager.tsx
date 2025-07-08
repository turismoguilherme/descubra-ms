
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import UserTable from "./users/UserTable";
import UserDialog, { formSchema } from "./users/UserDialog";
import { UserData } from "./users/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/hooks/useSecureAuth";
import { msRegions } from "@/data/msRegions";

const TechnicalUserManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      region: "",
      password: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_users_with_details');

        if (error) {
          throw error;
        }
        
        setUsers(data as UserData[] || []);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erro ao carregar usuários",
          description: "Você precisa ser um gestor para ver os usuários. " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);
  
  useEffect(() => {
    const results = users.filter(user => {
      const regionName = user.region && msRegions[user.region as keyof typeof msRegions] || user.region || '';
      return (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regionName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const openNewUserDialog = () => {
    setEditingUser(null);
    form.reset({
      name: "",
      email: "",
      role: "",
      region: "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const openEditUserDialog = (user: UserData) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
      password: "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingUser && (!values.password || values.password.length < 8)) {
        form.setError("password", { type: "manual", message: "Senha é obrigatória e deve ter no mínimo 8 caracteres." });
        return;
    }

    setIsDialogOpen(false);
    setLoading(true);
    
    try {
        if (editingUser) {
            // Atualizar usuário existente
            const { error } = await supabase
                .from('user_roles')
                .update({
                    role: values.role as UserRole,
                    region: values.region
                })
                .eq('user_id', editingUser.id);

            if (error) throw error;

            toast({
                title: "✅ Usuário atualizado com sucesso!",
                description: `As informações de ${values.name} foram atualizadas.`,
            });
        } else {
            // Criar novo usuário
            const { error } = await supabase.functions.invoke('create-user', {
                body: {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    role: values.role as UserRole,
                    region: values.region,
                }
            });

            if (error) {
                console.error("Create user error:", error);
                throw new Error(error.message || "Erro ao criar usuário");
            }

            toast({
                title: "✅ Usuário criado com sucesso!",
                description: `${values.name} foi adicionado ao sistema como ${values.role}.`,
            });
        }

        // Recarregar lista de usuários
        const { data, error: fetchError } = await supabase.rpc('get_users_with_details');
        if (fetchError) {
            console.error("Fetch users error:", fetchError);
            throw fetchError;
        }
        setUsers(data as UserData[] || []);
        
    } catch (error: any) {
        console.error("Submit error:", error);
        toast({
            title: "❌ Erro ao processar usuário",
            description: error.message || "Não foi possível processar a solicitação.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        
        toast({
            title: `🔄 Status alterado`,
            description: `${user.name} foi ${newStatus === 'active' ? 'ativado' : 'desativado'}.`,
        });

        // Atualizar lista localmente para feedback imediato
        setUsers(users.map(u => 
            u.id === userId ? { ...u, status: newStatus } : u
        ));
    } catch (error: any) {
        toast({
            title: "❌ Erro ao alterar status",
            description: "Não foi possível alterar o status do usuário.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">👥 Gerenciamento de Usuários</CardTitle>
        <CardDescription className="text-blue-100 text-base">
          Gerencie usuários, funções e permissões por região turística do MS
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, função ou região..."
                className="pl-10 h-12 border-2 border-gray-300 focus:border-blue-500 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <UserDialog 
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
              editingUser={editingUser}
              form={form}
              onSubmit={onSubmit}
              openNewUserDialog={openNewUserDialog}
            />
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Sistema de Regiões Turísticas:</strong> Cada usuário tem acesso específico às regiões turísticas 
                  do MS e suas respectivas cidades. Administradores e técnicos têm acesso a todas as regiões.
                </p>
              </div>
            </div>
          </div>

          <UserTable 
            loading={loading}
            users={filteredUsers}
            openEditUserDialog={openEditUserDialog}
            toggleUserStatus={toggleUserStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalUserManager;
