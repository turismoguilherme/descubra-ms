
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SocialLoginButtons from "./SocialLoginButtons";
import { InputValidator, sanitizeInput } from "@/components/security/InputValidator";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { securityLogger } from "@/utils/secureLogger";



const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
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
    securityLogger.log("Login attempt", true, "Form submitted");
    
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

      const { data: loginData, error } = await signIn(sanitizedData.email, sanitizedData.password);
      
      if (!error && loginData?.user) {
        securityLogger.log("Login successful", true);
        // Não precisa navegar aqui, o ProfileCompletionChecker vai gerenciar
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
    <div className="min-h-screen flex flex-col">
      {/* Header branco com logo */}
      <div className="bg-white py-6 shadow-sm">
        <div className="flex justify-center">
          <img 
            src="/lovable-uploads/63490622-9b5f-483c-857e-2427e85a58a3.png" 
            alt="Descubra Mato Grosso do Sul" 
            className="h-[60px] w-auto" 
          />
        </div>
      </div>

      {/* Corpo com gradiente e card centralizado */}
      <div className="flex-1 bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-2xl font-bold text-ms-primary-blue">
                Fazer Login
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Acesse sua conta para explorar o turismo de MS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                 <FormItem>
                   <FormLabel>E-mail</FormLabel>
                   <FormControl>
                     <InputValidator 
                       maxLength={254}
                       pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
                       onValidationError={(error) => form.setError('email', { message: error })}
                     >
                       <Input type="email" placeholder="Digite seu e-mail" {...field} />
                     </InputValidator>
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
                disabled={loading}
                className="w-full bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold"
              >
                <LogIn size={20} className="mr-2" />
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou continue com</span>
                </div>
              </div>

              <SocialLoginButtons />
            </div>

            <div className="mt-4 text-center space-y-2">
              <p className="text-sm text-gray-600">
                <Link to="/password-reset" className="text-ms-primary-blue hover:underline">
                  Esqueceu sua senha?
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link to="/register" className="text-ms-primary-blue hover:underline font-medium">
                  Criar conta
                </Link>
              </p>
              <p className="text-sm">
                <Link to="/admin-login" className="text-ms-primary-blue hover:underline">
                  Acesso Administrativo
                </Link>
              </p>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
