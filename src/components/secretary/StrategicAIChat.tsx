/**
 * Strategic AI Chat Component
 * Chat de IA estratégica especializado para secretarias de turismo
 * Layout padronizado conforme regras definitivas ViaJAR
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Lightbulb, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Brain,
  RefreshCw
} from 'lucide-react';
import { strategicAIService, StrategicRecommendation } from '@/services/public/strategicAIService';
import { format } from 'date-fns';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  recommendations?: StrategicRecommendation[];
  insights?: string[];
}

const StrategicAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    "Como está a performance dos CATs?",
    "Quais atrações precisam de mais divulgação?",
    "Onde devemos abrir um novo CAT?",
    "Quais eventos devemos criar para aumentar o turismo?",
    "Como melhorar a experiência dos turistas?",
    "Quais são as principais oportunidades de crescimento?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      addWelcomeMessage();
    }
  }, []);

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: 'Olá! Sou sua IA Estratégica para o turismo municipal. Analiso os dados do seu município e forneço recomendações estratégicas baseadas em evidências. Como posso ajudar você hoje?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const response = await strategicAIService.answerQuestion(currentQuestion);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.answer,
        timestamp: new Date(),
        recommendations: response.recommendations,
        insights: response.insights
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao processar pergunta:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  return (
    <SectionWrapper 
      variant="default" 
      title="IA Estratégica"
      subtitle="Análise inteligente de dados municipais"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages([]);
            addWelcomeMessage();
          }}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Limpar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Área de Chat */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <CardBox className={message.type === 'user' ? 'bg-blue-50 border-blue-200' : ''}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-slate-800 whitespace-pre-wrap flex-1">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {format(message.timestamp, 'HH:mm')}
                      </p>
                    </CardBox>

                    {/* Recomendações em Grid */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 w-full">
                        <p className="text-xs font-semibold text-gray-700 mb-3">Recomendações Estratégicas:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {message.recommendations.map((rec) => (
                            <CardBox key={rec.id}>
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-sm text-slate-800 flex-1">{rec.title}</h4>
                                <Badge className={`${getPriorityColor(rec.priority)} text-xs`}>
                                  {getPriorityLabel(rec.priority)}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-3">{rec.description}</p>
                              {rec.estimatedImpact && (
                                <div className="flex items-center gap-1 mb-3 text-xs text-gray-600">
                                  <TrendingUp className="h-3 w-3 text-green-600" />
                                  <span>Impacto: {rec.estimatedImpact}</span>
                                </div>
                              )}
                              {rec.actionItems && rec.actionItems.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <p className="text-xs font-semibold text-gray-700 mb-2">Ações:</p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {rec.actionItems.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardBox>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights em CardBox */}
                    {message.insights && message.insights.length > 0 && (
                      <CardBox className="mt-3 bg-yellow-50 border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <p className="text-xs font-semibold text-gray-700">Insights:</p>
                        </div>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {message.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-yellow-600">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardBox>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <CardBox>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <p className="text-sm text-gray-600">Analisando dados e gerando recomendações...</p>
                    </div>
                  </CardBox>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Perguntas Sugeridas */}
        {messages.length <= 1 && (
          <CardBox>
            <p className="text-xs font-semibold text-gray-700 mb-3">Perguntas Sugeridas:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs justify-start"
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardBox>
        )}

        {/* Input Area */}
        <CardBox>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Faça uma pergunta sobre o turismo municipal..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardBox>
      </div>
    </SectionWrapper>
  );
};

export default StrategicAIChat;
