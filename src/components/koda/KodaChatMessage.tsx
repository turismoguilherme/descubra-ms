import React, { useState, useEffect } from "react";
import { AIMessage } from "@/types/ai";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { platformContentService } from "@/services/admin/platformContentService";
import kodaMascote from "@/assets/koda-mascote.jpg";

interface KodaChatMessageProps {
  message: AIMessage;
  sendFeedback: (positive: boolean) => void;
}

const KodaChatMessage = ({ message, sendFeedback }: KodaChatMessageProps) => {
  const isKoda = !message.isUser;
  const [avatarUrl, setAvatarUrl] = useState<string>(kodaMascote);

  useEffect(() => {
    if (!isKoda) return;
    
    const loadAvatar = async () => {
      try {
        const data = await platformContentService.getContent(['koda_avatar_url']);
        if (data.length > 0 && data[0].content_value) {
          setAvatarUrl(data[0].content_value);
          return;
        }
      } catch (error) {
        console.error('Error loading Koda avatar:', error);
      }
    };
    loadAvatar();
    
    const interval = setInterval(loadAvatar, 30000);
    
    const handleLogoUpdate = (event: CustomEvent) => {
      if (event.detail?.key === 'koda_avatar_url') {
        loadAvatar();
      }
    };
    window.addEventListener('logo-updated', handleLogoUpdate as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('logo-updated', handleLogoUpdate as EventListener);
    };
  }, [isKoda]);

  return (
    <motion.div 
      className={cn("flex items-start gap-3 mb-4", isKoda ? "justify-start" : "justify-end")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isKoda && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt="Koda AI" className="object-cover" />
          <AvatarFallback className="bg-red-600 text-white font-bold text-sm">K</AvatarFallback>
        </Avatar>
      )}
      <div 
        className={cn(
          "relative max-w-[80%] transition-all duration-300",
          isKoda 
            ? message.error
              ? "rounded-lg px-4 py-3 shadow-sm bg-red-900 text-red-100 border-l-4 border-red-500" 
              : message.isTyping
                ? "rounded-lg px-4 py-3 shadow-sm bg-slate-700 text-gray-300"
                : "rounded-lg px-4 py-3 shadow-sm bg-slate-800 text-gray-100"
            : "rounded-lg px-4 py-3 shadow-sm bg-red-700/80 text-white border border-white/20 hover:bg-red-700/90 hover:shadow-md"
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
              <div className="text-xs mt-1 text-gray-400">
                {message.timestamp.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
            {isKoda && !message.error && (
              <div className="mt-2 flex justify-end gap-1">
                <motion.button 
                  onClick={() => sendFeedback(true)}
                  className="text-gray-400 hover:text-green-400 transition-all text-xs p-1 rounded-full hover:bg-green-500/20 flex items-center group"
                  aria-label="Helpful"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp size={14} className="group-hover:animate-pulse" />
                </motion.button>
                <motion.button 
                  onClick={() => sendFeedback(false)}
                  className="text-gray-400 hover:text-red-400 transition-all text-xs p-1 rounded-full hover:bg-red-500/20 flex items-center group"
                  aria-label="Not helpful"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsDown size={14} className="group-hover:animate-pulse" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default KodaChatMessage;
