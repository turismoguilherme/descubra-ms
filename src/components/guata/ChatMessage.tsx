
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AIMessage } from "@/types/ai";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { platformContentService } from "@/services/admin/platformContentService";
import { stripChatMarkdown } from "@/utils/stripChatMarkdown";

const REQUIRE_LOGIN_RE = /\[\[REQUIRE_LOGIN:([a-z_]+)\]\]/i;

const ACTION_LABEL: Record<string, string> = {
  cadastrar_evento: "cadastrar o evento",
  reservar: "fazer a reserva",
  pagar: "concluir o pagamento",
};

interface ChatMessageProps {
  message: AIMessage;
  enviarFeedback: (positivo: boolean) => void;
}

const ChatMessage = ({ message, enviarFeedback }: ChatMessageProps) => {
  const isGuata = !message.isUser;
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string>("/guata-mascote.jpg");

  const { plain, requiredAction } = useMemo(() => {
    const raw = message.text ?? "";
    const match = raw.match(REQUIRE_LOGIN_RE);
    const cleaned = raw.replace(REQUIRE_LOGIN_RE, "").trim();
    return {
      plain: stripChatMarkdown(cleaned),
      requiredAction: match ? match[1] : null,
    };
  }, [message.text]);

  const handleLoginClick = () => {
    try {
      sessionStorage.setItem(
        "guata_pending_action",
        JSON.stringify({ action: requiredAction, at: Date.now() }),
      );
      sessionStorage.setItem("guata_login_return", window.location.pathname);
    } catch (_err) { /* ignore */ }
    navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  };

  useEffect(() => {
    if (!isGuata) return;

    const loadAvatar = async () => {
      try {
        const data = await platformContentService.getContent(['guata_avatar_url']);
        if (data.length > 0 && data[0].content_value) {
          setAvatarUrl(data[0].content_value);
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar avatar do Guatá:', error);
      }
      setAvatarUrl('/guata-mascote.jpg');
    };
    loadAvatar();

    const interval = setInterval(loadAvatar, 30000);

    const handleLogoUpdate = (event: CustomEvent) => {
      if (event.detail?.key === 'guata_avatar_url') {
        loadAvatar();
      }
    };
    window.addEventListener('logo-updated', handleLogoUpdate as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('logo-updated', handleLogoUpdate as EventListener);
    };
  }, [isGuata]);

  return (
    <motion.div
      className={cn("flex items-start gap-3 mb-4", isGuata ? "justify-start" : "justify-end")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isGuata && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt="Guatá AI" className="object-cover" />
          <AvatarFallback className="bg-ms-primary-blue text-white font-bold text-sm">G</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "relative max-w-[80%] transition-all duration-300",
          isGuata
            ? message.error
              ? "rounded-lg px-4 py-3 shadow-sm bg-red-900 text-red-100 border-l-4 border-red-500"
              : message.isTyping
                ? "rounded-lg px-4 py-3 shadow-sm bg-slate-700 text-gray-300"
                : "rounded-lg px-4 py-3 shadow-sm bg-slate-800 text-gray-100"
            : "rounded-lg px-4 py-3 shadow-sm bg-ms-rivers-blue/80 text-white border border-white/20 hover:bg-ms-rivers-blue/90 hover:shadow-md"
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
            <p className="whitespace-pre-line break-words [overflow-wrap:anywhere]">
              {plain}
            </p>
            {isGuata && requiredAction && (
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={handleLoginClick}
                  className="bg-ms-primary-blue hover:bg-ms-primary-blue/90 text-white gap-2"
                >
                  <LogIn size={14} />
                  Entrar para {ACTION_LABEL[requiredAction] ?? "continuar"}
                </Button>
              </div>
            )}
            {message.timestamp && (
              <div className={cn("text-xs mt-1", isGuata ? "text-gray-400" : "text-gray-400")}>
                {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {isGuata && !message.error && (
              <div className="mt-2 flex justify-end gap-1">
                <motion.button
                  onClick={() => enviarFeedback(true)}
                  className="text-gray-400 hover:text-green-400 transition-all text-xs p-1 rounded-full hover:bg-green-500/20 flex items-center group"
                  aria-label="Útil"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ThumbsUp size={14} className="group-hover:animate-pulse" />
                </motion.button>
                <motion.button
                  onClick={() => enviarFeedback(false)}
                  className="text-gray-400 hover:text-red-400 transition-all text-xs p-1 rounded-full hover:bg-red-500/20 flex items-center group"
                  aria-label="Não útil"
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

export default ChatMessage;
