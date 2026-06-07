import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const getSpeechRecognition = (): SpeechRecognition | null => {
  if (typeof window === "undefined") return null;
  const SpeechRecognitionCtor =
    window.SpeechRecognition ?? window.webkitSpeechRecognition;
  return SpeechRecognitionCtor ? new SpeechRecognitionCtor() : null;
};

const getSpeechErrorToast = (
  code: string
): { title: string; description: string } | null => {
  switch (code) {
    case "aborted":
    case "no-speech":
      return null;
    case "not-allowed":
      return {
        title: "Permissão negada",
        description:
          "Permita o acesso ao microfone nas configurações do navegador.",
      };
    case "network":
      return {
        title: "Serviço de voz indisponível",
        description:
          "O reconhecimento de voz do navegador precisa de internet (Chrome usa servidores do Google). Verifique a conexão e tente de novo.",
      };
    case "audio-capture":
      return {
        title: "Microfone não encontrado",
        description:
          "Nenhum microfone detectado. Conecte um microfone ou verifique as permissões do dispositivo.",
      };
    case "service-not-allowed":
      return {
        title: "Reconhecimento de voz bloqueado",
        description:
          "Use Chrome ou Edge em um site seguro (HTTPS) e permita o microfone.",
      };
    default:
      return {
        title: "Erro no microfone",
        description: `Não foi possível reconhecer sua voz (${code}). Tente novamente ou use o teclado.`,
      };
  }
};

export const useGuataInput = () => {
  const [inputMensagem, setInputMensagem] = useState("");
  const [isGravandoAudio, setIsGravandoAudio] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef("");
  const gotSpeechRef = useRef(false);
  const userStoppedRef = useRef(false);
  const errorHandledRef = useRef(false);
  const { toast } = useToast();

  const releaseRecognition = useCallback((abort: boolean) => {
    const instance = recognitionRef.current;
    if (!instance) return;
    recognitionRef.current = null;
    try {
      if (abort) {
        instance.abort();
      } else {
        instance.stop();
      }
    } catch {
      /* instância já encerrada */
    }
  }, []);

  const stopRecognition = useCallback(() => {
    userStoppedRef.current = true;
    releaseRecognition(false);
    setIsGravandoAudio(false);
  }, [releaseRecognition]);

  useEffect(() => {
    return () => {
      userStoppedRef.current = true;
      releaseRecognition(true);
    };
  }, [releaseRecognition]);

  const ensureMicrophoneAccess = async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getUserMedia) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      const name = (err as DOMException)?.name ?? "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        toast({
          title: "Permissão negada",
          description:
            "Permita o acesso ao microfone nas configurações do navegador.",
          variant: "destructive",
        });
        return false;
      }
      if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        toast({
          title: "Microfone não encontrado",
          description: "Conecte um microfone e tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, callback?: () => void) => {
    if (e.key === "Enter" && inputMensagem.trim() !== "" && callback) {
      callback();
    }
  };

  const toggleMicrofone = useCallback(async () => {
    if (isGravandoAudio) {
      stopRecognition();
      return;
    }

    const recognition = getSpeechRecognition();
    if (!recognition) {
      toast({
        title: "Microfone indisponível",
        description:
          "Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.",
        duration: 4000,
      });
      return;
    }

    const micOk = await ensureMicrophoneAccess();
    if (!micOk) return;

    releaseRecognition(true);

    gotSpeechRef.current = false;
    userStoppedRef.current = false;
    errorHandledRef.current = false;
    recognitionRef.current = recognition;
    baseTextRef.current = inputMensagem;

    recognition.lang = "pt-BR";
    recognition.continuous = true;
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

      if (!final && !interim) return;
      gotSpeechRef.current = true;

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
      if (import.meta.env.DEV) {
        console.warn("[Guatá mic] SpeechRecognition error:", event.error, event.message);
      }

      setIsGravandoAudio(false);
      recognitionRef.current = null;
      errorHandledRef.current = true;

      const errorToast = getSpeechErrorToast(event.error);
      if (errorToast) {
        toast({ ...errorToast, variant: "destructive" });
      }
    };

    recognition.onend = () => {
      setIsGravandoAudio(false);
      recognitionRef.current = null;

      if (!gotSpeechRef.current && !userStoppedRef.current && !errorHandledRef.current) {
        toast({
          title: "Não ouvi nada",
          description:
            "Fale mais perto do microfone e toque no ícone novamente para tentar.",
          duration: 3500,
        });
      }
    };

    try {
      recognition.start();
      setIsGravandoAudio(true);
    } catch (err) {
      setIsGravandoAudio(false);
      recognitionRef.current = null;
      if (import.meta.env.DEV) {
        console.warn("[Guatá mic] recognition.start() failed:", err);
      }
      toast({
        title: "Microfone ocupado",
        description: "Aguarde um instante e toque no microfone novamente.",
        variant: "destructive",
      });
    }
  }, [
    isGravandoAudio,
    inputMensagem,
    stopRecognition,
    releaseRecognition,
    toast,
  ]);

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
