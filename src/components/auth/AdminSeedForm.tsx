import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus } from "lucide-react";
import { createInitialAdminUser, needsInitialAdmin, AdminSeedData } from "@/utils/adminSeeding";
import { AdminElevateUser } from "@/components/admin/AdminElevateUser";

const adminSeedSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "Senha deve ter pelo menos 8 caracteres" }),
  confirmPassword: z.string(),
  fullName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type AdminSeedFormValues = z.infer<typeof adminSeedSchema>;

const AdminSeedForm = () => {
  const [loading, setLoading] = useState(false);
  const [needsAdmin, setNeedsAdmin] = useState<boolean | null>(null);
  const [created, setCreated] = useState(false);

  const form = useForm<AdminSeedFormValues>({
    resolver: zodResolver(adminSeedSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  useEffect(() => {
    checkAdminNeeded();
  }, []);

  const checkAdminNeeded = async () => {
    const needed = await needsInitialAdmin();
    setNeedsAdmin(needed);
  };

  const onSubmit = async (data: AdminSeedFormValues) => {
    setLoading(true);
    
    try {
      const adminData: AdminSeedData = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      };

      const success = await createInitialAdminUser(adminData);
      if (success) {
        setCreated(true);
        setNeedsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (needsAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  if (!needsAdmin || created) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-4xl space-y-6">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-600">
                {created ? "Admin Criado!" : "Sistema Configurado"}
              </CardTitle>
              <CardDescription>
                {created 
                  ? "O usuário administrador foi criado com sucesso." 
                  : "O sistema já possui usuários administradores."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = "/login"} 
                className="w-full"
              >
                Ir para Login
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <AdminElevateUser />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 text-ms-primary-blue mx-auto mb-4" />
          <CardTitle className="text-ms-primary-blue">
            Configuração Inicial do Sistema
          </CardTitle>
          <CardDescription>
            Crie o primeiro usuário administrador para começar a usar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do administrador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Mínimo 8 caracteres" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirme a senha" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-ms-primary-blue hover:bg-ms-primary-blue/90"
              >
                <UserPlus size={20} className="mr-2" />
                {loading ? 'Criando...' : 'Criar Administrador'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeedForm;