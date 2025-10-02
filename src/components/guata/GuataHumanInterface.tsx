// Interface do Guatá Human - Sistema Integrado e Humano
// Versão simplificada para debug

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  BarChart3
} from 'lucide-react';

interface GuataMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const GuataHumanInterface: React.FC = () => {
  const [messages, setMessages] = useState<GuataMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: GuataMessage = {
      id: `msg-${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simular resposta do sistema
    setTimeout(() => {
      const assistantMessage: GuataMessage = {
        id: `msg-${Date.now()}`,
        text: `Olá! Sou o Guatá, seu guia turístico digital para Mato Grosso do Sul. Você perguntou: "${inputText}". Em breve teremos respostas completas e inteligentes!`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold text-gray-800">
                🚀 Guatá Human - Sistema de Teste
              </span>
            </CardTitle>
            <p className="text-gray-600">
              Versão simplificada para debug - Sistema funcionando!
            </p>
          </CardHeader>
        </Card>

        {/* Chat Area */}
        <Card className="mb-4 h-96 overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Digite sua pergunta sobre turismo em MS...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Guatá está pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta sobre turismo em MS..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ Sistema Funcionando
                </Badge>
                <span className="text-sm text-gray-600">
                  {messages.length} mensagens
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessages([])}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuataHumanInterface;
