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
        console.log("📧 Email usado para busca:", sanitizedData.email);
        
        // Verificar se é parceiro - tentar com email exato e também lowercase
        let partner = null;
        let partnerError = null;

        // Primeira tentativa: email exato
        const { data: partnerData1, error: error1 } = await supabase
          .from('institutional_partners')
          .select('id, name, contact_email, is_active, status, subscription_status, voluntary_cancel_access_until')
          .eq('contact_email', sanitizedData.email)
          .maybeSingle();

        if (error1) {
          console.error('❌ Erro ao buscar parceiro (tentativa 1 - email exato):', error1);
          partnerError = error1;
        } else if (partnerData1) {
          partner = partnerData1;
          console.log("✅ Parceiro encontrado (email exato):", partner);
        } else {
          // Segunda tentativa: lowercase
          console.log("🔍 Tentando busca com email em lowercase...");
          const { data: partnerData2, error: error2 } = await supabase
            .from('institutional_partners')
            .select('id, name, contact_email, is_active, status, subscription_status, voluntary_cancel_access_until')
            .ilike('contact_email', sanitizedData.email)
            .maybeSingle();
          
          if (error2) {
            console.error('❌ Erro ao buscar parceiro (tentativa 2 - lowercase):', error2);
            partnerError = error2;
          } else if (partnerData2) {
            partner = partnerData2;
            console.log("✅ Parceiro encontrado (lowercase):", partner);
          } else {
            // Terceira tentativa: buscar todos e filtrar no cliente
            console.log("🔍 Tentando busca ampla...");
            const { data: allPartners, error: error3 } = await supabase
              .from('institutional_partners')
              .select('id, name, contact_email, is_active, status, subscription_status, voluntary_cancel_access_until');
            
            if (error3) {
              console.error('❌ Erro ao buscar todos os parceiros:', error3);
              partnerError = error3;
            } else {
              console.log("📋 Total de parceiros encontrados:", allPartners?.length || 0);
              const foundPartner = allPartners?.find(p => 
                p.contact_email?.toLowerCase().trim() === sanitizedData.email.toLowerCase().trim()
              );
              if (foundPartner) {
                partner = foundPartner;
                console.log("✅ Parceiro encontrado (busca ampla):", partner);
              } else {
                console.log("❌ Parceiro não encontrado em nenhuma tentativa");
                console.log("📋 Emails disponíveis:", allPartners?.map(p => p.contact_email));
              }
            }
          }
        }

        if (partnerError) {
          console.error('❌ Erro final ao buscar parceiro:', partnerError);
          
          // Se for erro 403, é problema de RLS
          if (partnerError.code === 'PGRST301' || partnerError.message?.includes('403') || partnerError.message?.includes('permission denied') || partnerError.code === '42501') {
            toast({
              title: "Erro de permissão (RLS)",
              description: "Você não tem permissão para acessar seus dados. Execute o script CORRIGIR_RLS_SELECT_PARCEIROS.sql no Supabase SQL Editor.",
              variant: "destructive",
              duration: 10000,
            });
          } else {
            toast({
              title: "Erro ao verificar parceiro",
              description: "Ocorreu um erro ao verificar seu cadastro. Tente novamente ou entre em contato.",
              variant: "destructive",
              duration: 5000,
            });
          }
          return;
        }
        
        if (partner) {
          if (partner.status === 'rejected') {
            toast({
              title: "Cadastro não aprovado",
              description: "Sua solicitação de parceria foi encerrada. Em caso de dúvida, entre em contato com o suporte.",
              variant: "destructive",
              duration: 8000,
            });
            return;
          }

          if (partner.status === 'cancelled') {
            const until = partner.voluntary_cancel_access_until
              ? new Date(partner.voluntary_cancel_access_until).getTime()
              : 0;
            const inGrace = until > Date.now();
            const subOk =
              partner.subscription_status === 'active' ||
              partner.subscription_status === 'trialing';
            if (!inGrace && !subOk) {
              toast({
                title: "Parceria encerrada",
                description: "Seu cancelamento já foi concluído e o prazo de acesso expirou. Entre em contato se precisar de algo.",
                variant: "destructive",
                duration: 8000,
              });
              return;
            }
          }

          const subOk =
            partner.subscription_status === 'active' ||
            partner.subscription_status === 'trialing';
          if (!partner.is_active && !subOk) {
            console.log("⚠️ Parceiro encontrado mas inativo");
            toast({
              title: "Acesso negado",
              description: "Sua conta de parceiro está inativa ou aguardando pagamento da assinatura. Entre em contato conosco se precisar de ajuda.",
              variant: "destructive",
              duration: 5000,
            });
            return;
          }
          
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
          console.log("❌ Parceiro não encontrado para email:", sanitizedData.email);
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
    } catch (err: unknown) {
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
            to="/descubrams/forgot-password"
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

