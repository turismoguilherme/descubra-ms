// @ts-nocheck
import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { AnimatePresence } from "framer-motion";

interface ChatMessagesProps {
  messages: unknown[];
  enviarFeedback: (positivo: boolean) => void;
}

const ChatMessages = ({ messages, enviarFeedback }: ChatMessagesProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Rolar para a última mensagem quando houver uma nova com animação suave
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollToBottom = () => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      };

      // Pequeno delay para garantir que a animação da nova mensagem começou
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div 
      ref={messagesContainerRef}
      className="h-96 overflow-y-auto p-4 space-y-4 scroll-smooth"
    >
      <AnimatePresence initial={false} mode="sync">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id}
            message={message}
            enviarFeedback={enviarFeedback} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ChatMessages;
