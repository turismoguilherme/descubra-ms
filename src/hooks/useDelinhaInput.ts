
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useDelinhaInput = () => {
  const [inputMensagem, setInputMensagem] = useState("");
  const [isGravandoAudio, setIsGravandoAudio] = useState(false);
  const { toast } = useToast();

  const handleKeyDown = (e: React.KeyboardEvent, callback?: () => void) => {
    if (e.key === 'Enter' && inputMensagem.trim() !== "" && callback) {
      callback();
    }
  };

  const toggleMicrofone = () => {
    if (!isGravandoAudio) {
      toast({
        title: "Gravação de voz",
        description: "Esta funcionalidade será implementada em uma próxima atualização.",
      });
    }
    setIsGravandoAudio(!isGravandoAudio);
  };

  const handleSugestaoClick = (sugestao: string) => {
    setInputMensagem(sugestao);
  };

  return {
    inputMensagem,
    setInputMensagem,
    isGravandoAudio,
    toggleMicrofone,
    handleKeyDown,
    handleSugestaoClick
  };
};
