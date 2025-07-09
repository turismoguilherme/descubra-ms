
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSecureAuth } from "@/hooks/useSecureAuth";

const adminLoginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, loading: authLoading } = useAuth();
  const { isManager, userRole, getDashboardRoute, loading: secureAuthLoading } = useSecureAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    console.log("🔐 Tentativa de login administrativo:", data.email);
    
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      console.log("✅ Login realizado, verificando permissões...");
      
      // Wait a moment for permissions to load
      setTimeout(() => {
        if (isManager) {
          const dashboardRoute = getDashboardRoute();
          toast({
            title: "Acesso autorizado!",
            description: `Bem-vindo(a) ao sistema. Role: ${userRole}`,
            duration: 3000,
          });
          console.log("🔄 Redirecionando para:", dashboardRoute);
          navigate(dashboardRoute);
        } else {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissões administrativas. Entre em contato com o suporte.",
            variant: "destructive",
            duration: 5000,
          });
          console.log("❌ Usuário sem permissões administrativas:", { userRole, isManager });
        }
      }, 1000);
    } else {
      console.error("❌ Erro no login:", error);
    }
  };

  const isLoading = authLoading || form.formState.isSubmitting || secureAuthLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="flex justify-center py-6 bg-white">
          <img 
            src="/lovable-uploads/1e2f844e-0cd3-4b3b-84b6-85904f67ebc7.png" 
            alt="Descubra Mato Grosso do Sul" 
            className="h-[60px] w-auto" 
          />
        </div>

        <div className="bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green py-12 px-4">
          <div className="ms-container max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-semibold text-ms-primary-blue mb-2 text-center">
              Acesso Administrativo
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Painel de Gestão e Sistema de CATs
            </p>

            {/* Debug info - mostrar apenas em desenvolvimento */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                <p><strong>Debug:</strong></p>
                <p>Role atual: {userRole || 'nenhuma'}</p>
                <p>É manager: {isManager ? 'sim' : 'não'}</p>
                <p>Carregando: {isLoading ? 'sim' : 'não'}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Digite seu e-mail de gestor" {...field} />
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
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Digite sua senha" 
                            {...field} 
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#FFC107] text-black hover:bg-[#FFC107]/90"
                >
                  <LogIn size={20} className="mr-2" />
                  {isLoading ? 'Verificando...' : 'Entrar'}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Roles administrativas aceitas:</p>
              <p className="text-xs">admin, tech, municipal, municipal_manager, gestor, atendente</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLogin;
