import React from "react";
import { Send, Mic, MicOff, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";
import enTranslations from "@/locales/koda/en.json";
import frTranslations from "@/locales/koda/fr.json";

interface KodaChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  sendMessage: () => void;
  toggleMicrophone: () => void;
  isRecordingAudio: boolean;
  isLoading: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  onClearConversation?: () => void;
  messages: any[];
}

const KodaChatInput = ({
  inputMessage,
  setInputMessage,
  sendMessage,
  toggleMicrophone,
  isRecordingAudio,
  isLoading,
  handleKeyDown,
  onClearConversation = () => {},
  messages
}: KodaChatInputProps) => {
  const { language } = useKodaLanguage();
  const t = language === 'fr' ? frTranslations : enTranslations;

  return (
    <div className="border-t p-4 border-white/20">
      <div className="flex items-center space-x-2">
        <motion.button 
          onClick={toggleMicrophone}
          className={cn(
            "p-2 rounded-full transition-all",
            isRecordingAudio 
              ? "bg-red-500 text-white" 
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          )}
          disabled={isLoading}
          whileTap={{ scale: 0.9 }}
          animate={isRecordingAudio ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] } : {}}
          transition={isRecordingAudio ? { repeat: Infinity, duration: 1.5 } : {}}
        >
          {isRecordingAudio ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.button>
        <motion.div 
          className="flex-grow relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder={t.chat.placeholder}
            className={cn(
              "w-full bg-white/10 text-white placeholder:text-gray-400 rounded-full px-4 py-2 pr-10",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white/20",
              "transition-all duration-300",
              isLoading && "opacity-70"
            )}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              sendMessage();
              setInputMessage("");
            }}
            className={cn(
              "bg-red-600 text-white p-2 rounded-full",
              "hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-300"
            )}
            disabled={isLoading || inputMessage.trim() === ""}
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
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {t.chat.loading}
            </span>
          ) : language === 'fr' 
            ? "Discutez avec Koda sur les destinations, événements ou attractions au Canada"
            : "Chat with Koda about destinations, events or attractions in Canada"}
        </p>
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearConversation()}
              className="flex items-center space-x-2 text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.chat.clear}</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default KodaChatInput;
