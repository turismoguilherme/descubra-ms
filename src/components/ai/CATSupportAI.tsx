
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, Database } from "lucide-react";

import { useCATSupport } from "./hooks/useCATSupport";
import { dataSources } from "./data/tourismSources";
import { CATSupportAIProps } from "./types/CATSupportTypes";
import ChatMessage from "./ChatMessage";
import LoadingIndicator from "./LoadingIndicator";
import SuggestionQueries from "./SuggestionQueries";

const CATSupportAI: React.FC<CATSupportAIProps> = ({ onRecordQuestion }) => {
  const {
    messages,
    inputMessage,
    isLoading,
    messagesEndRef,
    setInputMessage,
    handleSendMessage,
    handleKeyDown
  } = useCATSupport(onRecordQuestion);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <CardHeader className="bg-ms-primary-blue text-white pb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-white/30">
            <AvatarImage src="/icons/cat-ai-logo.png" />
            <AvatarFallback className="bg-blue-700 text-white">
              <Bot size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg flex items-center">
              IA de Apoio ao Atendimento
              <Badge variant="outline" className="ml-2 text-xs border-white/30 text-white/90">
                Exclusivo CATs
              </Badge>
            </CardTitle>
            <p className="text-sm text-white/80 flex items-center">
              <Database size={12} className="mr-1" /> Conectada às fontes oficiais
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[350px] overflow-y-auto p-4 bg-gray-50">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Digite sua pergunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
            >
              <Send size={16} className={isLoading ? "animate-pulse" : ""} />
              <span className="sr-only">Enviar</span>
            </Button>
          </div>
          
          <SuggestionQueries onSuggestionClick={setInputMessage} />
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center">
              <Badge variant="secondary" className="text-xs">
                <MessageCircle size={12} className="mr-1" />
                Modo Assistente
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Dados de fontes oficiais
            </p>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

// Export data sources for use in other components
export { dataSources };
export default CATSupportAI;
