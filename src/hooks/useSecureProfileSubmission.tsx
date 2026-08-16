// @ts-nocheck
import { useState, useCallback } from 'react';
import { useAutoRetry } from './useAutoRetry';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfileSubmissionOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export const useSecureProfileSubmission = (options: ProfileSubmissionOptions = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeWithRetry, isRetrying, retryCount } = useAutoRetry({
    maxRetries: options.maxRetries || 3,
    initialDelay: options.retryDelay || 2000,
  });
  const { toast } = useToast();

  const submitProfile = useCallback(async (profileData: Record<string, unknown>, user: { id: string; email?: string }) => {
    setIsSubmitting(true);
    
    try {
      const result = await executeWithRetry(
        async () => {
          console.log("💾 PERFIL: Tentando salvar perfil no Supabase");
          
          const { data, error } = await supabase
            .from('user_profiles')
            .upsert(profileData, { onConflict: 'user_id' });

          if (error) {
            console.error("❌ PERFIL: Erro do Supabase:", error);
            throw error;
          }

          console.log("✅ PERFIL: Perfil salvo com sucesso:", data);
          return data;
        },
        (result) => {
          console.log("🎉 PERFIL: Processo concluído com sucesso");
          toast({
            title: "Perfil criado!",
            description: "Seu perfil foi salvo com segurança no sistema.",
          });
        },
        (error) => {
          console.error("❌ PERFIL: Erro final na submissão:", error);
          
          let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
          
          if (error.code) {
            switch (error.code) {
              case '23505':
                errorMessage = "Este perfil já existe. Tente fazer login.";
                break;
              case '23502':
                errorMessage = "Campo obrigatório não preenchido.";
                break;
              case 'PGRST116':
                errorMessage = "Erro de permissão. Entre em contato com o suporte.";
                break;
              default:
                errorMessage = `Erro do banco de dados: ${error.message}`;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          toast({
            title: `Erro ao salvar perfil ${retryCount > 0 ? `(tentativa ${retryCount})` : ''}`,
            description: errorMessage,
            variant: "destructive",
          });
        }
      );

      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [executeWithRetry, toast, retryCount]);

  return {
    submitProfile,
    isSubmitting: isSubmitting || isRetrying,
    isRetrying,
    retryCount
  };
};