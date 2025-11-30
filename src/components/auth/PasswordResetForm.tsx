import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput } from "@/components/security/InputValidator";

const resetSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
});

type PasswordResetFormValues = z.infer<typeof resetSchema>;

const PasswordResetForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: PasswordResetFormValues) => {
    setLoading(true);
    
    try {
      // Sanitize email input
      const sanitizedEmail = sanitizeInput(data.email);
      
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          toast({
            title: "Muitas tentativas",
            description: "Aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao enviar email",
            description: "Verifique o email informado e tente novamente.",
            variant: "destructive",
          });
        }
        return;
      }

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex justify-center py-6 bg-white">
          <img 
            src="/lovable-uploads/f9e61cb5-62ef-4f80-8b18-7fef17e3f64b.png" 
            alt="Descubra Mato Grosso do Sul" 
            className="h-[60px] w-auto" 
          />
        </div>

        <div className="flex-grow bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-12 px-4">
          <div className="ms-container max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <Mail size={48} className="mx-auto text-ms-primary-blue mb-4" />
            <h1 className="text-2xl font-semibold text-ms-primary-blue mb-4">
              Email Enviado!
            </h1>
            <p className="text-gray-600 mb-6">
              Enviamos um link para redefinir sua senha para o email informado. 
              Verifique sua caixa de entrada e siga as instruções.
            </p>
            <Link 
              to="/descubramatogrossodosul/login" 
              className="inline-flex items-center text-ms-primary-blue hover:underline"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-center py-6 bg-white">
        <img 
          src="/lovable-uploads/f9e61cb5-62ef-4f80-8b18-7fef17e3f64b.png" 
          alt="Descubra Mato Grosso do Sul" 
          className="h-[60px] w-auto" 
        />
      </div>

      <div className="flex-grow bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green py-12 px-4">
        <div className="ms-container max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-semibold text-ms-primary-blue mb-2 text-center">
            Redefinir Senha
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Digite seu email para receber um link de redefinição de senha
          </p>

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
                        placeholder="Digite seu e-mail" 
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
                className="w-full bg-ms-secondary-yellow text-ms-primary-blue hover:bg-ms-secondary-yellow/90 font-semibold"
              >
                <Mail size={20} className="mr-2" />
                {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link 
              to="/descubramatogrossodosul/login" 
              className="inline-flex items-center text-sm text-ms-primary-blue hover:underline"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;