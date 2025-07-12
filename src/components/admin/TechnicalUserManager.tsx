
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Users, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import UserTable from "./users/UserTable";
import UserDialog, { formSchema } from "./users/UserDialog";
import UserStatisticsCard from "./users/UserStatistics";
import UserFilters from "./users/UserFilters";
import { UserData } from "./users/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/hooks/useSecureAuth";
import { msRegions } from "@/data/msRegions";

const TechnicalUserManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_users_with_details');

      if (error) {
        throw error;
      }
        
        const mappedUsers: UserData[] = data?.map((user: any) => ({
          id: user.id,
          name: user.full_name || user.email || 'Sem nome',
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type,
          role: user.role || 'user',
          region: user.region || 'all',
          status: user.status || 'active',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          phone: user.phone,
          city: user.city
        })) || [];
        
        setUsers(mappedUsers);
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

  useEffect(() => {
    fetchUsers();
  }, [toast]);
  
  useEffect(() => {
    const results = users.filter(user => {
      const regionName = user.region && msRegions[user.region as keyof typeof msRegions] || user.region || '';
      
      // Filter by search term
      const matchesSearch = searchTerm === "" || (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regionName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Filter by role
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      
      // Filter by region
      const matchesRegion = selectedRegion === "all" || 
        (selectedRegion === "all_regions" && user.region === "all") ||
        user.region === selectedRegion;
      
      // Filter by status
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
      
      return matchesSearch && matchesRole && matchesRegion && matchesStatus;
    });
    setFilteredUsers(results);
  }, [searchTerm, selectedRole, selectedRegion, selectedStatus, users]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
    setSelectedRegion("all");
    setSelectedStatus("all");
  };

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
                role: values.role,
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
                    role: values.role,
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
        const mappedUsersRefresh: UserData[] = data?.map((user: any) => ({
          id: user.id,
          name: user.full_name || user.email || 'Sem nome',
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type,
          role: user.role || 'user',
          region: user.region || 'all',
          status: user.status || 'active',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          phone: user.phone,
          city: user.city
        })) || [];
        
        setUsers(mappedUsersRefresh);
        
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
    <div className="space-y-6">
      <UserStatisticsCard />
      
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Gerenciamento de Usuários
              </CardTitle>
              <CardDescription className="text-blue-100 text-base mt-1">
                Gerencie usuários, funções e permissões por região turística do MS
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  fetchUsers();
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              <UserDialog 
                isDialogOpen={isDialogOpen}
                setIsDialogOpen={setIsDialogOpen}
                editingUser={editingUser}
                form={form}
                onSubmit={onSubmit}
                openNewUserDialog={openNewUserDialog}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <UserFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              clearFilters={clearFilters}
            />

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">
                    <strong>Sistema de Regiões Turísticas:</strong> Cada usuário tem acesso específico às regiões turísticas 
                    do MS e suas respectivas cidades. Administradores e técnicos têm acesso a todas as regiões.
                  </p>
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  {filteredUsers.length} de {users.length} usuários
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
    </div>
  );
};

export default TechnicalUserManager;
