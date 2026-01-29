import React, { useRef, useEffect } from "react";
import KodaChatMessage from "./KodaChatMessage";
import { AnimatePresence } from "framer-motion";

interface KodaChatMessagesProps {
  messages: unknown[];
  sendFeedback: (positive: boolean) => void;
}

const KodaChatMessages = ({ messages, sendFeedback }: KodaChatMessagesProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const scrollToBottom = () => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth"
        });
      };

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
          <KodaChatMessage 
            key={message.id}
            message={message}
            sendFeedback={sendFeedback} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default KodaChatMessages;
