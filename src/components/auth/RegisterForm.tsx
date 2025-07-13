
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import SocialLoginButtons from "./SocialLoginButtons";
import { sanitizeInput } from "@/components/security/InputValidator";
import { enhancedSecurityService } from "@/services/enhancedSecurityService";
import { useToast } from "@/components/ui/use-toast";
import PasswordStrengthMeter from "@/components/security/PasswordStrengthMeter";

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número" 
    }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onRegister: (values: RegisterFormValues) => Promise<void>;
  onSocialLogin: (provider: 'google' | 'facebook') => Promise<void>;
  loading: boolean;
}

const RegisterForm = ({ onRegister, onSocialLogin, loading }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: RegisterFormValues) => {
    console.log("📝 REGISTER FORM: Tentativa de registro para:", data.email);
    
    try {
      // Sanitize input data
      const sanitizedData = {
        fullName: sanitizeInput(data.fullName),
        email: sanitizeInput(data.email),
        password: data.password, // Don't sanitize passwords
        confirmPassword: data.confirmPassword
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

      // Enhanced rate limiting for registration
      const rateLimitCheck = await enhancedSecurityService.checkRateLimit(
        sanitizedData.email,
        'registration',
        { maxAttempts: 3, windowMinutes: 60, blockDurationMinutes: 60 }
      );

      if (!rateLimitCheck.allowed) {
        toast({
          title: "Muitas tentativas",
          description: "Aguarde antes de tentar novamente",
          variant: "destructive",
        });
        return;
      }

      await onRegister(sanitizedData);
    } catch (error) {
      console.error("❌ Erro na validação de segurança:", error);
      toast({
        title: "Erro de segurança",
        description: "Ocorreu um erro durante a validação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo dentro do card */}
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/f9e61cb5-62ef-4f80-8b18-7fef17e3f64b.png" 
              alt="Descubra Mato Grosso do Sul" 
              className="h-[60px] w-auto" 
            />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel>Nome Completo</FormLabel>
                     <FormControl>
                        <Input placeholder="Digite seu nome completo" {...field} />
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
                        <Input type="email" placeholder="Digite seu e-mail" {...field} />
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
                          placeholder="Crie uma senha (mín. 8 caracteres)" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setCurrentPassword(e.target.value);
                          }}
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
                    <PasswordStrengthMeter password={currentPassword} className="mt-2" />
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
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirme sua senha" 
                          {...field} 
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <UserPlus size={20} className="mr-2" />
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou registre-se com</span>
              </div>
            </div>

            <SocialLoginButtons onSocialLogin={onSocialLogin} />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-ms-primary-blue hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
