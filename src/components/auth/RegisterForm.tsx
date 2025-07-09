
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

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
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
    await onRegister(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com logo */}
      <div className="flex justify-center py-6 bg-white">
        <img 
          src="/lovable-uploads/f9e61cb5-62ef-4f80-8b18-7fef17e3f64b.png" 
          alt="Descubra Mato Grosso do Sul" 
          className="h-[60px] w-auto" 
        />
      </div>

      {/* Formulário de registro */}
      <div className="flex-grow bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green py-12 px-4">
        <div className="ms-container max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-ms-primary-blue mb-2 text-center">
            Criar sua conta
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Registre-se para começar sua jornada
          </p>

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
                          placeholder="Crie uma senha (mín. 6 caracteres)" 
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
                className="w-full bg-[#FFC107] text-black hover:bg-[#FFC107]/90"
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
