import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const getSpeechRecognition = (): SpeechRecognition | null => {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionCtor =
    window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return SpeechRecognitionCtor ? new SpeechRecognitionCtor() : null;
};

export const useGuataInput = () => {
  const [inputMensagem, setInputMensagem] = useState("");
  const [isGravandoAudio, setIsGravandoAudio] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef("");
  const { toast } = useToast();

  const stopRecognition = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsGravandoAudio(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, callback?: () => void) => {
    if (e.key === "Enter" && inputMensagem.trim() !== "" && callback) {
      callback();
    }
  };

  const toggleMicrofone = useCallback(() => {
    if (isGravandoAudio) {
      stopRecognition();
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      toast({
        title: "Microfone indisponível",
        description:
          "Seu navegador não suporta reconhecimento de voz. Use o teclado para conversar com o Guatá.",
        duration: 4000,
      });
      return;
    }

    recognitionRef.current = recognition;
    baseTextRef.current = inputMensagem;

    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const prefix = baseTextRef.current;
      const separator = prefix && !prefix.endsWith(" ") ? " " : "";

      if (final) {
        const newText = `${prefix}${separator}${final}`.trimStart();
        setInputMensagem(newText);
        baseTextRef.current = newText;
      } else if (interim) {
        setInputMensagem(`${prefix}${separator}${interim}`.trimStart());
      }
    };

    recognition.onerror = (event) => {
      setIsGravandoAudio(false);
      recognitionRef.current = null;

      if (event.error === "not-allowed") {
        toast({
          title: "Permissão negada",
          description:
            "Permita o acesso ao microfone nas configurações do navegador.",
          variant: "destructive",
        });
        return;
      }

      if (event.error !== "aborted" && event.error !== "no-speech") {
        toast({
          title: "Erro no microfone",
          description: "Não foi possível reconhecer sua voz. Tente novamente.",
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsGravandoAudio(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setIsGravandoAudio(true);
    } catch {
      setIsGravandoAudio(false);
      recognitionRef.current = null;
      toast({
        title: "Microfone ocupado",
        description: "Não foi possível iniciar o reconhecimento de voz.",
        variant: "destructive",
      });
    }
  }, [isGravandoAudio, inputMensagem, stopRecognition, toast]);

  const handleSugestaoClick = (sugestao: string) => {
    setInputMensagem(sugestao);
  };

  return {
    inputMensagem,
    setInputMensagem,
    isGravandoAudio,
    toggleMicrofone,
    handleKeyDown,
    handleSugestaoClick,
  };
};
