import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mensagem de boas-vindas
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        text: "Olá! Eu sou o Guatá, seu guia turístico virtual de Mato Grosso do Sul! Como posso ajudá-lo hoje?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    
    // Adiciona mensagem do usuário
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <div className="text-white text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p>Carregando Guatá...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Faça login para conversar com o Guatá.</p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ms-primary to-ms-secondary">
      <Navbar />
      
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
                Conversa com o Guatá
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? "bg-ms-accent-orange text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-start">
                        {!message.isUser && (
                          <Bot className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        )}
                        {message.isUser && (
                          <User className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        )}
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                      <div className="flex items-start">
                        <Bot className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                        <p className="text-sm">Digitando...</p>
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
                    placeholder="Digite sua pergunta para o Guatá..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || inputMessage.trim() === ""}
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
      
      <Footer />
    </div>
  );
};

export default GuataSimple;