import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { InputValidator, sanitizeInput } from "@/components/security/InputValidator";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const PartnerLoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log("🔐 Tentativa de login de parceiro para:", data.email);
    
    try {
      // Sanitize input data
      const sanitizedData = {
        email: sanitizeInput(data.email),
        password: data.password // Don't sanitize passwords
      };

      // Validate form data
      const validation = enhancedSecurityService.validateFormData(sanitizedData);
      if (!validation.isValid) {
        toast({
          title: "Dados inválidos",
          description: Object.values(validation.errors)[0],
          variant: "destructive",
        });
        return;
      }

      // Enhanced rate limiting for login attempts
      const rateLimitCheck = await enhancedSecurityService.checkRateLimit(
        sanitizedData.email,
        'login',
        { maxAttempts: 5, windowMinutes: 15, blockDurationMinutes: 45 }
      );

      if (!rateLimitCheck.allowed) {
        toast({
          title: "Muitas tentativas",
          description: "Aguarde antes de tentar novamente",
          variant: "destructive",
        });
        return;
      }

      const { error } = await signIn(sanitizedData.email, sanitizedData.password);
      
      if (!error) {
        console.log("✅ Login realizado com sucesso");
        
        // Verificar se é parceiro
        const { data: partner, error: partnerError } = await supabase
          .from('institutional_partners')
          .select('id, is_active, subscription_status')
          .eq('contact_email', sanitizedData.email)
          .maybeSingle();
        
        if (partner) {
          console.log("🤝 LOGIN: Parceiro detectado, redirecionando para dashboard");
          toast({
            title: "Login realizado!",
            description: "Bem-vindo, parceiro!",
            duration: 3000,
          });
          navigate('/partner/dashboard');
          return;
        } else {
          // Se não for parceiro, mostrar erro
          toast({
            title: "Acesso negado",
            description: "Este email não está cadastrado como parceiro. Se você é um parceiro, entre em contato conosco.",
            variant: "destructive",
            duration: 5000,
          });
          return;
        }
      } else {
        toast({
          title: "Erro no login",
          description: error.message || "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("❌ Erro no formulário:", err);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  {...field}
                  disabled={loading}
                  className="w-full"
                />
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    {...field}
                    disabled={loading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between text-sm">
          <Link
            to="/descubramatogrossodosul/forgot-password"
            className="text-ms-primary-blue hover:text-ms-discovery-teal transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-ms-primary-blue hover:bg-ms-discovery-teal text-white"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Entrando...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PartnerLoginForm;

