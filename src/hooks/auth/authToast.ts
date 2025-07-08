
import { toast } from "sonner";

// Sistema de toast melhorado com botão de fechar
export const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  if (variant === 'destructive') {
    toast.error(title, {
      description,
      duration: 5000, // 5 segundos ao invés de quase 1 minuto
      dismissible: true, // Permite fechar manualmente
      closeButton: true, // Adiciona botão X para fechar
    });
  } else {
    toast.success(title, {
      description,
      duration: 4000, // 4 segundos para mensagens de sucesso
      dismissible: true,
      closeButton: true,
    });
  }
};
