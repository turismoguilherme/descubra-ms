
import React from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  inputMensagem: string;
  setInputMensagem: (message: string) => void;
  enviarMensagem: () => void;
  toggleMicrofone: () => void;
  isGravandoAudio: boolean;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({
  inputMensagem,
  setInputMensagem,
  enviarMensagem,
  toggleMicrofone,
  isGravandoAudio,
  isLoading,
  handleKeyDown
}: ChatInputProps) => {
  return (
    <div className="border-t p-4 border-white/20">
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
        <motion.div 
          className="flex-grow relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder="Pergunte à Delinha sobre o MS..."
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
            onClick={enviarMensagem}
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
          ) : "Converse com a Delinha sobre destinos, eventos ou atrações"}
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
