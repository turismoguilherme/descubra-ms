
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
import {
  saveGuataLoginReturn,
  saveGuataPendingContext,
} from "@/utils/guataPendingAction";
import type { GuataTransactionalAction } from "@/utils/guataTransactionalIntent";

const REQUIRE_LOGIN_RE = /\[\[REQUIRE_LOGIN:([a-z_]+)\]\]/i;

const ACTION_LABEL: Record<string, string> = {
  cadastrar_evento: "cadastrar o evento",
  reservar: "fazer a reserva",
  pagar: "concluir o pagamento",
};

function renderTextWithLinks(text: string): React.ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={`link-${i}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-sky-300 hover:text-sky-200 break-all"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={`txt-${i}`}>{part}</React.Fragment>
    ),
  );
}

interface ChatMessageProps {
  message: AIMessage;
  enviarFeedback: (positivo: boolean) => void;
  conversationHistory?: string[];
  visibleMessages?: unknown[];
}

const ChatMessage = ({
  message,
  enviarFeedback,
  conversationHistory = [],
  visibleMessages = [],
}: ChatMessageProps) => {
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
    const returnPath = window.location.pathname + window.location.search;
    if (requiredAction) {
      saveGuataPendingContext(
        requiredAction as GuataTransactionalAction,
        conversationHistory,
        visibleMessages,
      );
    }
    saveGuataLoginReturn(returnPath);
    // AuthPage usa ?redirect= e a rota real do Descubra MS é /descubrams/login
    // (/login não existe e caía no catch-all da Guatá Labs)
    navigate(`/descubrams/login?redirect=${encodeURIComponent(returnPath)}`);
  };

  useEffect(() => {
    if (!isGuata) return;

    const loadAvatar = async () => {
      try {
        const data = await platformContentService.getContent(['guata_avatar_url']);
        const nextUrl =
          data.length > 0 && data[0].content_value
            ? data[0].content_value
            : '/guata-mascote.jpg';
        setAvatarUrl((current) => (current === nextUrl ? current : nextUrl));
      } catch (error) {
        console.error('Erro ao carregar avatar do Guatá:', error);
        setAvatarUrl((current) => (current === '/guata-mascote.jpg' ? current : '/guata-mascote.jpg'));
      }
    };
    loadAvatar();

    const handleLogoUpdate = (event: CustomEvent) => {
      if (event.detail?.key === 'guata_avatar_url') {
        loadAvatar();
      }
    };
    window.addEventListener('logo-updated', handleLogoUpdate as EventListener);

    return () => {
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
              {renderTextWithLinks(plain)}
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
