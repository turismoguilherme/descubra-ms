
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConversationItem } from "./types";

interface ConversationMessagesProps {
  conversations: ConversationItem[];
  onFeedback: (positive: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  showSources?: boolean; // Novo parâmetro para controlar exibição de fontes
}

const ConversationMessages = ({ conversations, onFeedback, messagesEndRef, showSources = false }: ConversationMessagesProps) => {
  if (conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p className="text-center">
          Digite uma pergunta para consultar a IA de suporte
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {conversations.map((conv) => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex justify-end">
              <div className="bg-ms-primary-blue/10 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm text-gray-800">{conv.query}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {conv.timestamp.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
            
            {conv.isLoading ? (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-ms-primary-blue/40 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-ms-primary-blue/40 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-ms-primary-blue/40 rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm text-gray-500">Consultando...</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="bg-ms-primary-blue/5 border border-ms-primary-blue/10 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-ms-primary-blue h-8 w-8 flex items-center justify-center text-white mt-1">
                      <MessageCircle size={16} />
                    </div>
                    <div>
                      <div className="whitespace-pre-line text-sm text-gray-800">{conv.response}</div>
                      {showSources && conv.source && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          Fonte: {conv.source}
                        </Badge>
                      )}
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="text-xs text-gray-500">Esta resposta foi útil?</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onFeedback(true)}
                        >
                          <ThumbsUp size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onFeedback(false)}
                        >
                          <ThumbsDown size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationMessages;
