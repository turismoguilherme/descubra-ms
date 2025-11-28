import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import GuataChat from "@/components/guata/GuataChat";
import { useGuataConnection } from "@/hooks/useGuataConnection";
import { useGuataInput } from "@/hooks/useGuataInput";
import SuggestionQuestions from "@/components/guata/SuggestionQuestions";
import { guataTrueApiService } from "@/services/ai";
import { guataMLService } from "@/services/ai/ml/guataMLService";

const ChatGuata = () => {
  const { toast } = useToast();
  const { isConnected, connectionChecking } = useGuataConnection();

  // Estados para o Guatá
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>({});
  const [learningInsights, setLearningInsights] = useState<any[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (mensagens.length === 0) {
      const mensagemBoasVindas = {
        id: 1,
        text: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        isUser: false,
        timestamp: new Date()
      };
      setMensagens([mensagemBoasVindas]);
    }
  }, [mensagens.length]);

  const enviarMensagem = async (mensagem?: string) => {
    const mensagemParaEnviar = String(mensagem || inputMensagem || "").trim();
    if (mensagemParaEnviar === "") return;
    
    // Adiciona a mensagem do usuário
    const novaMensagemUsuario = {
      id: Date.now(),
      text: mensagemParaEnviar,
      isUser: true,
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setConversationHistory(prev => [...prev, mensagemParaEnviar]);
    setIsLoading(true);
    
    try {
      console.log("🦦 Guatá True API: Processando pergunta...");
      console.log("🔍 Verificando se guataTrueApiService existe:", !!guataTrueApiService);
      console.log("🔍 Verificando se processQuestion existe:", !!guataTrueApiService?.processQuestion);
      
      // Usar o serviço com APIs reais configuradas (Gemini + Google Search)
      const response = await guataTrueApiService.processQuestion({
        question: mensagemParaEnviar,
        userId: 'publico',
        sessionId: `session-${Date.now()}`,
        userLocation: 'Mato Grosso do Sul',
        conversationHistory: conversationHistory,
        userPreferences: userPreferences,
        isTotemVersion: true // Versão totem: pode usar "Olá" normalmente
      });
      
      console.log("✅ Guatá True API: Resposta gerada em", response.processingTime, "ms");
      console.log("📊 Fontes utilizadas:", response.sources);
      console.log("🌐 Usou web search:", response.usedWebSearch);
      console.log("🧠 Fonte do conhecimento:", response.knowledgeSource);
      console.log("🎓 Insights de aprendizado:", response.learningInsights);
      console.log("💡 Melhorias implementadas:", response.adaptiveImprovements);
      console.log("💾 Atualizações de memória:", response.memoryUpdates.length);
      console.log("😊 Personalidade:", response.personality);
      console.log("🎭 Estado emocional:", response.emotionalState);
      console.log("❓ Perguntas de seguimento:", response.followUpQuestions?.length || 0);
      
      // Atualizar preferências do usuário baseado no aprendizado
      if (response.memoryUpdates.length > 0) {
        const newPreferences = { ...userPreferences };
        response.memoryUpdates.forEach(update => {
          if (update.type === 'preference') {
            newPreferences[update.content] = update.confidence;
          }
        });
        setUserPreferences(newPreferences);
      }
      
      // Salvar insights de aprendizado
      setLearningInsights(prev => [...prev, response.learningInsights]);
      
      const questionId = `question-${Date.now()}`;
      setCurrentQuestionId(questionId);
      setCurrentAnswer(response.answer);

      const novaMensagemBot = {
        id: Date.now() + 1,
        text: response.answer,
        isUser: false,
        timestamp: new Date(),
        sources: response.sources,
        confidence: response.confidence,
        processingTime: response.processingTime,
        learningInsights: response.learningInsights,
        adaptiveImprovements: response.adaptiveImprovements,
        memoryUpdates: response.memoryUpdates,
        questionId: questionId
      };
      
      setMensagens(prev => [...prev, novaMensagemBot]);
      
    } catch (error) {
      console.error("❌ Erro no Guatá True API:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua pergunta. Mas estou aprendendo com cada erro!",
        variant: "destructive"
      });
      
      // Resposta de fallback
      const novaMensagemBot = {
        id: Date.now() + 1,
        text: "🦦 Desculpe, tive um problema ao processar sua pergunta. Mas estou aqui para ajudar! Pode reformular sua pergunta?",
        isUser: false,
        timestamp: new Date(),
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Melhorar sistema'],
          contextRelevance: 0
        }
      };
      
      setMensagens(prev => [...prev, novaMensagemBot]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparConversa = () => {
    setMensagens([]);
    setConversationHistory([]);
    setLearningInsights([]);
    // Reiniciar mensagem de boas-vindas
    const mensagemBoasVindas = {
      id: 1,
      text: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
      isUser: false,
      timestamp: new Date()
    };
    setMensagens([mensagemBoasVindas]);
  };

  const enviarFeedback = async (positivo: boolean) => {
    if (!currentQuestionId || !currentAnswer) {
      console.warn("⚠️ Não há pergunta/resposta atual para dar feedback");
      return;
    }

    try {
      const lastUserMessage = mensagens.filter(m => m.isUser).pop();
      const question = lastUserMessage?.text || '';

      const feedback = {
        userId: 'publico',
        sessionId: `session-${Date.now()}`,
        questionId: currentQuestionId,
        question: question,
        answer: currentAnswer,
        rating: positivo ? 'positive' as const : 'negative' as const
      };

      // Aprender de feedback (assíncrono)
      await guataMLService.learnFromFeedback(feedback);

      toast({
        title: positivo ? "Obrigado pelo feedback positivo! 😊" : "Obrigado pelo feedback! Vou melhorar! 💪",
        description: positivo 
          ? "Seu feedback ajuda o Guatá a continuar oferecendo respostas excelentes!"
          : "Estou aprendendo com seu feedback para melhorar minhas respostas futuras.",
        variant: positivo ? "default" : "default"
      });

      console.log("✅ Feedback registrado e processado:", positivo ? "positivo" : "negativo");
    } catch (error) {
      console.error("❌ Erro ao processar feedback:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar seu feedback. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone
  } = useGuataInput();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputMensagem.trim() !== "") {
      enviarMensagem(inputMensagem);
      setInputMensagem("");
    }
  };

  const handleSuggestionClick = (pergunta: string) => {
    setInputMensagem(pergunta);
    enviarMensagem(pergunta);
  };

  // Interface principal do Guatá - Tela cheia tipo totem
  return (
    <div 
      className="min-h-screen w-screen bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green"
      data-testid="chatguata-container"
    >
      <main className="min-h-screen flex flex-col p-4 md:p-8">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <GuataChat
                mensagens={mensagens}
                inputMensagem={inputMensagem}
                setInputMensagem={setInputMensagem}
                enviarMensagem={enviarMensagem}
                onClearConversation={handleLimparConversa}
                isGravandoAudio={isGravandoAudio}
                toggleMicrofone={toggleMicrofone}
                isLoading={isLoading}
                isConnected={isConnected}
                connectionChecking={connectionChecking}
                handleKeyDown={handleKeyDown}
                enviarFeedback={enviarFeedback}
              />
            </div>
            
            <div className="flex flex-col min-h-0">
              <SuggestionQuestions 
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatGuata;

