
import { Message } from "./types/CATSupportTypes";
import { MessageCircle } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`mb-4 flex ${message.isBot ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.isBot
            ? "bg-white shadow-sm"
            : "bg-ms-primary-blue text-white"
        }`}
      >
        <div className="whitespace-pre-line">{message.text}</div>
        
        {message.source && (
          <div className="mt-2 flex items-center">
            <MessageCircle size={12} className="mr-1 text-gray-500" />
            <span className="text-xs text-gray-500">
              Fonte: {message.source}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
