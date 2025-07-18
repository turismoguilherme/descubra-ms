import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, MapPin, Calendar, Star, Zap } from 'lucide-react';
import { useFlowTrip } from '@/context/FlowTripContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actionType?: 'destination' | 'event' | 'points' | 'level';
}

const AIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Eu sou o assistente FlowTrip! 🤖 Posso ajudá-lo a descobrir destinos incríveis, eventos próximos e dicas para ganhar mais pontos. O que você gostaria de saber?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { userLevel, currentState, passportStamps, addPoints } = useFlowTrip();

  const suggestedQuestions = [
    { text: 'Quais destinos posso visitar?', icon: MapPin, type: 'destination' },
    { text: 'Eventos próximos?', icon: Calendar, type: 'event' },
    { text: 'Como ganhar mais pontos?', icon: Zap, type: 'points' },
    { text: 'Próximo nível?', icon: Star, type: 'level' }
  ];

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('destino') || message.includes('lugar') || message.includes('visitar')) {
      return `🗺️ Que ótima pergunta! Em ${currentState?.name || 'sua região'}, você pode visitar diversos destinos incríveis. Alguns populares são:\n\n• Pantanal - Natureza exuberante (+15 pontos)\n• Bonito - Águas cristalinas (+10 pontos)\n• Campo Grande - Centro urbano (+10 pontos)\n\nFaça check-in nos destinos para ganhar pontos e evoluir no FlowTrip!`;
    }
    
    if (message.includes('evento') || message.includes('programação')) {
      return `📅 Existem vários eventos interessantes acontecendo! Participar de eventos é uma ótima forma de ganhar pontos extras:\n\n• Festivals gastronômicos (+20 pontos)\n• Shows culturais (+15 pontos)\n• Feiras de turismo (+10 pontos)\n\nDemonstrar interesse em um evento já vale +5 pontos!`;
    }
    
    if (message.includes('ponto') || message.includes('gamificação')) {
      const currentPoints = userLevel?.total_points || 0;
      return `⚡ Você já tem ${currentPoints} pontos! Aqui estão as melhores formas de ganhar mais:\n\n• Check-in em destinos: +10 pontos\n• Participar de eventos: +20 pontos\n• Avaliar destinos: +5 pontos\n• Compartilhar experiências: +3 pontos\n\nSeu nível atual: ${userLevel?.current_level || 'Iniciante'}`;
    }
    
    if (message.includes('nível') || message.includes('level')) {
      const currentLevel = userLevel?.current_level || 'Iniciante';
      const currentPoints = userLevel?.total_points || 0;
      let nextLevelPoints = 101;
      
      if (currentPoints >= 101) nextLevelPoints = 501;
      if (currentPoints >= 501) nextLevelPoints = 1001;
      if (currentPoints >= 1001) nextLevelPoints = 2000;
      
      return `🏆 Você está no nível ${currentLevel} com ${currentPoints} pontos!\n\n${currentPoints >= 2000 ? 'Parabéns! Você já é um Mestre FlowTrip! 🎉' : `Faltam ${nextLevelPoints - currentPoints} pontos para o próximo nível.`}\n\nOs níveis são:\n• Iniciante (0-100)\n• Explorador (101-500)\n• Viajante (501-1000)\n• Aventureiro (1001-2000)\n• Mestre (2000+)`;
    }
    
    if (message.includes('ajuda') || message.includes('como usar')) {
      return `🤝 Claro! O FlowTrip funciona assim:\n\n1. 📍 Visite destinos e faça check-in\n2. 🎫 Participe de eventos locais\n3. ⭐ Avalie lugares que visitou\n4. 🏆 Ganhe pontos e suba de nível\n5. 🎒 Colecione selos no passaporte digital\n\nCada ação rende pontos e te ajuda a evoluir!`;
    }
    
    // Resposta padrão
    return `🤖 Interessante! Estou aqui para ajudá-lo com informações sobre destinos, eventos e dicas para ganhar pontos no FlowTrip. \n\nVocê pode me perguntar sobre:\n• Destinos para visitar\n• Eventos próximos\n• Como ganhar mais pontos\n• Seu progresso no FlowTrip\n\nO que mais posso ajudá-lo?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simular delay da IA
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputMessage),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-secondary text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Assistente FlowTrip IA
          </CardTitle>
          <p className="text-white/80">
            Seu guia inteligente para descobrir destinos e ganhar pontos!
          </p>
        </CardHeader>
      </Card>

      {/* Suggested Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perguntas Sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleSuggestedQuestion(question.text)}
              >
                <question.icon className="h-4 w-4" />
                {question.text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-secondary text-white'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg p-3 bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            💡 Dica: Pergunte sobre destinos, eventos, pontos ou como usar o FlowTrip!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;