/**
 * Strategic AI Chat Component
 * Chat do GUILHERME IA - Assistente IA especializado para secretarias de turismo
 * Layout padronizado conforme regras definitivas ViaJAR
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  Clock
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
      content: 'Olá! Sou o GUILHERME IA, sua IA estratégica para o turismo municipal. Analiso os dados do seu município e forneço recomendações estratégicas baseadas em evidências. Como posso ajudar você hoje?',
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
      title="GUILHERME IA"
      subtitle="Assistente inteligente para estratégias e análises municipais"
      actions={
        <Badge variant="secondary" className="rounded-full text-xs px-2 py-0.5 gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Online
        </Badge>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <CardBox>
            {/* Área de Mensagens */}
            <div className="p-3 min-h-[300px] max-h-[400px] overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-4">
                    <p className="text-slate-800 font-medium mb-1">
                      Olá! Sou o GUILHERME IA, sua IA estratégica da ViaJAR.
                    </p>
                    <p className="text-sm text-slate-600">
                      Analiso os dados do seu município e forneço recomendações estratégicas baseadas em evidências. Como posso ajudar você hoje?
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{new Date().toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-blue-600" />
                      ) : (
                      <Bot className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-purple-50 text-slate-800'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                      <div className={`flex items-center gap-2 mt-1 text-xs text-slate-500 ${message.type === 'user' ? 'justify-end' : ''}`}>
                        <Clock className="h-3 w-3" />
                        <span>{format(message.timestamp, 'HH:mm')}</span>
                      </div>

                      {/* Recomendações */}
                    {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.recommendations.map((rec) => (
                            <div key={rec.id} className="bg-white rounded-lg p-3 border border-slate-200">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-xs text-slate-800 flex-1">{rec.title}</h4>
                                <Badge className={`${getPriorityColor(rec.priority)} text-xs`}>
                                  {getPriorityLabel(rec.priority)}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">{rec.description}</p>
                                </div>
                          ))}
                      </div>
                    )}

                      {/* Insights */}
                    {message.insights && message.insights.length > 0 && (
                        <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-3 w-3 text-yellow-600" />
                          <p className="text-xs font-semibold text-gray-700">Insights:</p>
                        </div>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {message.insights.map((insight, idx) => (
                              <li key={idx}>• {insight}</li>
                          ))}
                        </ul>
                    </div>
                  )}
                </div>
                  </div>
                ))
                  )}

              {loading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <span className="text-sm text-slate-600">Analisando...</span>
                    </div>
                </div>
              )}

              <div ref={messagesEndRef} />
        </div>

            {/* Ações Rápidas */}
            <div className="p-3 border-t border-slate-200">
              <div className="flex flex-wrap gap-2 mb-2">
                {suggestedQuestions.slice(0, 6).map((question, idx) => (
                <Button
                  key={idx}
                    type="button"
                  variant="outline"
                  size="sm"
                    className="rounded-full text-xs px-3 py-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Pergunta sugerida clicada', question);
                      handleSuggestedQuestion(question);
                    }}
                    disabled={loading}
                >
                  {question}
                </Button>
              ))}
            </div>

              {/* Campo de Input */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
                  placeholder="Pergunte sobre estratégias, métricas, turismo municipal..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
              className="flex-1"
            />
            <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão Enviar mensagem IA clicado', { inputValue, loading });
                    handleSendMessage();
                  }}
                  disabled={!inputValue.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
              </div>
            </div>
          </CardBox>
        </div>

        {/* Funcionalidades da IA */}
        <div className="space-y-3">
          <CardBox>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-600" />
              <h3 className="text-base font-semibold text-slate-800">Funcionalidades</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Análise de performance dos CATs</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Recomendações estratégicas baseadas em dados</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Análise de atrações e eventos</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Insights sobre tendências de turismo</span>
              </div>
            </div>
          </CardBox>

          <CardBox>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-800">Dicas Rápidas</h3>
            </div>
            <div className="space-y-1.5 text-sm text-slate-600">
              <p>• Use os dados de Analytics para entender tendências</p>
              <p>• Consulte Dados Regionais para contexto</p>
              <p>• Analise performance dos CATs regularmente</p>
          </div>
        </CardBox>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default StrategicAIChat;
