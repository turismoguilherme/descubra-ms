import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, User, ArrowLeft } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const GuataSimple = () => {
  console.log("🤖 GUATA SIMPLE: Componente sendo renderizado");
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: "Olá! Eu sou o Guatá, seu guia turístico virtual de Mato Grosso do Sul. Como posso te ajudar hoje?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    // Simula resposta do Guatá
    setTimeout(() => {
      const responses = [
        "Que pergunta interessante! Mato Grosso do Sul tem muitas opções incríveis para você explorar.",
        "Excelente pergunta! Posso te ajudar com informações sobre Bonito, Pantanal, Campo Grande e muito mais.",
        "Ótima pergunta! MS é um estado repleto de belezas naturais e cultura rica. O que mais te interessa?",
        "Interessante! Posso te dar dicas sobre roteiros, hospedagem, gastronomia local e muito mais.",
        "Perfeita pergunta! Mato Grosso do Sul tem desde o Pantanal até as águas cristalinas de Bonito."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: randomResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  console.log("🤖 GUATA SIMPLE: Renderizando interface principal do chat");
  
  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/ms")}
                  className="text-white hover:bg-white/20 mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Bot className="w-12 h-12 text-white mr-4" />
                <h1 className="text-4xl font-bold text-white">Guatá</h1>
              </div>
              <p className="text-white/80 text-lg">
                Seu guia turístico virtual de Mato Grosso do Sul
              </p>
            </div>

            {/* Chat */}
            <Card className="h-96 flex flex-col">
              <CardHeader className="bg-ms-accent-orange text-white">
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Chat com Guatá
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isUser
                            ? 'bg-ms-primary-blue text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {!message.isUser && (
                            <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                          )}
                          {message.isUser && (
                            <User className="w-4 h-4 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua pergunta sobre Mato Grosso do Sul..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-ms-accent-orange hover:bg-ms-accent-orange/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UniversalLayout>
  );
};

export default GuataSimple;