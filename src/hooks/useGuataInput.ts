
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useGuataInput = () => {
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
        title: "🎤 Gravação de voz",
        description: "Esta funcionalidade será implementada em uma próxima atualização. Por enquanto, use o teclado para conversar com o Guatá!",
        duration: 4000,
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
