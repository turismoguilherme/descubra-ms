
import React from "react";
import { AIMessage } from "@/types/ai";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Importar Avatar

interface ChatMessageProps {
  message: AIMessage;
  enviarFeedback: (positivo: boolean) => void;
}

const ChatMessage = ({ message, enviarFeedback }: ChatMessageProps) => {
  return (
    <motion.div 
      className={cn(
        "flex items-start gap-3", // Adicionar items-start e gap-3 para alinhar avatar e mensagem
        !message.isUser ? "justify-start" : "justify-end"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!message.isUser && ( // Renderizar avatar apenas para mensagens da IA
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src="/guata-mascote.jpg" 
            alt="Guatá AI"
            className="object-cover"
          />
          <AvatarFallback className="bg-ms-primary-blue text-white font-bold text-sm">
            G
          </AvatarFallback>
        </Avatar>
      )}
      <div 
        className={cn(
          "relative max-w-[80%] rounded-lg p-3 shadow-sm transition-all",
          !message.isUser 
            ? message.error 
              ? "bg-red-900/50 text-red-200 border-l-4 border-red-500" 
              : message.isTyping
                ? "bg-slate-800/60 text-gray-400"
                : "bg-slate-800 text-gray-200" 
            : "bg-blue-700 text-white hover:bg-blue-800"
        )}
      >
        {message.isTyping ? (
          <div className="flex space-x-2 items-center">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-line">{message.text}</p>
            
            {message.timestamp && (
              <div className="text-xs text-gray-400 mt-1 text-right">
                {message.timestamp.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
            
            {!message.isUser && !message.error && (
              <div className="mt-2 flex justify-end gap-1">
                <button 
                  onClick={() => enviarFeedback(true)}
                  className="text-gray-400 hover:text-green-400 transition-colors text-xs p-1 rounded-full hover:bg-white/10 flex items-center"
                  aria-label="Útil"
                >
                  <ThumbsUp size={14} />
                </button>
                <button 
                  onClick={() => enviarFeedback(false)}
                  className="text-gray-400 hover:text-red-400 transition-colors text-xs p-1 rounded-full hover:bg-white/10 flex items-center"
                  aria-label="Não útil"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
