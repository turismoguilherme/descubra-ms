
import React, { useRef, useState } from "react";
import { Send, Mic, MicOff, Loader2, Trash2, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadEventLogo } from "@/utils/uploadEventImage";
import { securityService } from "@/services/securityService";

const UPLOAD_MAX_PER_WINDOW = 8;
const UPLOAD_WINDOW_MINUTES = 30;
interface ChatInputProps {
  inputMensagem: string;
  setInputMensagem: (message: string) => void;
  enviarMensagem: (message?: string) => void;
  toggleMicrofone: () => void;
  isGravandoAudio: boolean;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onClearConversation?: () => void; // Tornar opcional para fallback
  mensagens: unknown[];
}

const ChatInput = ({
  inputMensagem,
  setInputMensagem,
  enviarMensagem,
  toggleMicrofone,
  isGravandoAudio,
  isLoading,
  handleKeyDown,
  onClearConversation = () => {}, // Definir valor padrão
  mensagens
}: ChatInputProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAttachClick = () => {
    if (isLoading || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Permite reenviar o mesmo arquivo depois
    e.target.value = "";
    if (!file) return;

    const allowed = await securityService.checkRateLimit(
      "guata_chat",
      "image_upload",
      UPLOAD_MAX_PER_WINDOW,
      UPLOAD_WINDOW_MINUTES,
    );
    if (!allowed) {
      toast({
        title: "Muitos envios de imagem",
        description: `Aguarde alguns minutos antes de enviar outra imagem.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { url, error } = await uploadEventLogo(file);
      if (error || !url) {
        toast({
          title: "Não foi possível anexar a imagem",
          description: error ?? "Tente novamente.",
          variant: "destructive",
        });
        return;
      }
      const typed = inputMensagem.trim();
      const imageTag = `[imagem enviada pelo usuário: ${url}]`;
      enviarMensagem(typed ? `${typed}\n\n${imageTag}` : imageTag);
      setInputMensagem("");
    } catch (err) {
      toast({
        title: "Erro ao enviar imagem",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t p-4 border-white/20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelected}
      />
      <div className="flex items-center space-x-2">
        <motion.button 
          onClick={toggleMicrofone}
          className={cn(
            "p-2 rounded-full transition-all",
            isGravandoAudio 
              ? "bg-red-500 text-white" 
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          )}
          disabled={isLoading}
          whileTap={{ scale: 0.9 }}
          animate={isGravandoAudio ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}}
          transition={isGravandoAudio ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          {isGravandoAudio ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>
        <motion.button
          onClick={handleAttachClick}
          className={cn(
            "p-2 rounded-full transition-all bg-white/10 text-gray-300 hover:bg-white/20",
            (isLoading || isUploading) && "opacity-50 cursor-not-allowed"
          )}
          disabled={isLoading || isUploading}
          whileTap={{ scale: 0.9 }}
          title="Anexar imagem (ex.: logo do evento)"
          aria-label="Anexar imagem"
        >
          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
        </motion.button>
        <motion.div 
          className="flex-grow relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder={
              isGravandoAudio
                ? "Ouvindo... fale agora"
                : "Pergunte ao Guatá sobre o MS..."
            }
            className={cn(
              "w-full bg-white/10 text-white placeholder:text-gray-400 rounded-full px-4 py-2 pr-10",
              "focus:outline-none focus:ring-2 focus:ring-ms-guavira-purple focus:bg-white/20",
              "transition-all duration-300",
              isLoading && "opacity-70"
            )}
            value={inputMensagem}
            onChange={(e) => setInputMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              enviarMensagem();
              setInputMensagem(""); // Limpar o campo após enviar
            }}
            className={cn(
              "bg-ms-guavira-purple text-white p-2 rounded-full",
              "hover:bg-ms-guavira-purple/90 disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300"
            )}
            disabled={isLoading || inputMensagem.trim() === ""}
            size="icon"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </Button>
        </motion.div>
      </div>
      <div className="flex items-center justify-between mt-2 px-2">
        <p className={cn(
          "text-xs text-gray-400 transition-opacity duration-300",
          isLoading ? "opacity-100" : "opacity-70"
        )}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-ms-guavira-purple rounded-full animate-pulse"></span>
              Processando sua pergunta...
            </span>
          ) : isGravandoAudio ? (
            "Falando... toque no microfone para parar"
          ) : (
            "Converse com o Guatá sobre destinos, eventos ou atrações"
          )}
        </p>
        {mensagens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClearConversation();
              }}
              className="flex items-center space-x-2 text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Conversa</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
