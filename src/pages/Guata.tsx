import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import GuataHeader from "@/components/guata/GuataHeader";
import GuataChat from "@/components/guata/GuataChat";
import { useGuataConnection } from "@/hooks/useGuataConnection";
import { useGuataInput } from "@/hooks/useGuataInput";
import SuggestionQuestions from "@/components/guata/SuggestionQuestions";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/guataKnowledgeBase";
import { guataTrueApiService } from "@/services/ai";
import UniversalLayout from "@/components/layout/UniversalLayout";

const Guata = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isConnected, connectionChecking } = useGuataConnection();

  // Estados para o Guatá Simple
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>({});
  const [learningInsights, setLearningInsights] = useState<any[]>([]);

  // Carrega a base de conhecimento e informações do usuário
  const knowledgeBase = getInitialKnowledgeBase();
  const usuarioInfo = getDefaultUserInfo(user);

  // Forçar carregamento após 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("🚀 GUATA: Forçando carregamento após timeout");
      setForceLoad(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (mensagens.length === 0 && (forceLoad || !authLoading)) {
      const mensagemBoasVindas = {
        id: 1,
        text: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        isUser: false,
        timestamp: new Date()
      };
      setMensagens([mensagemBoasVindas]);
    }
  }, [mensagens.length, forceLoad, authLoading]);

  const enviarMensagem = async (mensagem?: string) => {
    const mensagemParaEnviar = mensagem || inputMensagem;
    if (mensagemParaEnviar.trim() === "") return;
    
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
      // Na versão /guata, já há uma mensagem de boas-vindas, então a primeira mensagem do usuário já tem contexto
      const isFirstUserMessage = conversationHistory.length === 0;
      const response = await guataTrueApiService.processQuestion({
        question: mensagemParaEnviar,
        userId: user?.id || 'convidado',
        sessionId: `session-${Date.now()}`,
        userLocation: 'Mato Grosso do Sul',
        conversationHistory: conversationHistory,
        userPreferences: userPreferences,
        isTotemVersion: false, // Versão do site: não usar "Olá" após primeira mensagem
        isFirstUserMessage: isFirstUserMessage // Flag para indicar se é a primeira mensagem do usuário
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
        memoryUpdates: response.memoryUpdates
      };
      
      setMensagens(prev => [...prev, novaMensagemBot]);
      
    } catch (error) {
      console.error("❌ Erro no Guatá True API:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua pergunta. Mas estou aprendendo com cada erro!",
        variant: "destructive"
      });
      
      // Resposta de fallback que mostra aprendizado
      const novaMensagemBot = {
        id: Date.now() + 1,
        text: "🦦 Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Como posso te ajudar hoje?",
        isUser: false,
        timestamp: new Date(),
        learningInsights: {
          questionType: 'error',
          userIntent: 'unknown',
          knowledgeGaps: ['technical_issue'],
          improvementSuggestions: ['Melhorar sistema simple'],
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
    // Manter preferências do usuário para continuar aprendendo
  };

  const enviarFeedback = (positivo: boolean) => {
    console.log("Feedback:", positivo ? "positivo" : "negativo");
  };

  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone,
    handleKeyDown: handleKeyDownBase
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

  // Se está carregando auth E não forçou o carregamento, mostrar loading
  if (authLoading && !forceLoad) {
    return (
      <UniversalLayout>
        <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 animate-pulse bg-white/20 rounded-full"></div>
            <p className="text-lg">Verificando autenticação...</p>
            <p className="text-sm text-white/70 mt-2">Aguarde um momento</p>
            <div className="mt-4">
              <div className="w-48 h-1 bg-white/20 rounded-full mx-auto">
                <div className="h-1 bg-white/60 rounded-full animate-pulse"></div>
              </div>
            </div>
            <button 
              onClick={() => setForceLoad(true)}
              className="mt-4 text-sm text-white/70 hover:text-white underline"
            >
              Pular verificação
            </button>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  // Se não há usuário E não forçou o carregamento, mostrar login
  if (!user && !forceLoad) {
    return (
      <UniversalLayout>
        <div className="min-h-screen bg-gradient-to-br from-ms-primary-blue via-ms-discovery-teal to-ms-pantanal-green flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-xl mb-6">Faça login para conversar com o Guatá.</p>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/ms/login")}
                className="bg-ms-accent-orange hover:bg-ms-accent-orange/90 text-white px-8 py-3 rounded-lg font-semibold mr-3"
              >
                Fazer Login
              </button>
              <button 
                onClick={() => setForceLoad(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Continuar como Convidado
              </button>
            </div>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  // Interface principal do Guatá
  return (
    <UniversalLayout>
      <div 
        className="min-h-screen bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green"
        data-testid="guata-container"
      >
        {/* Indicador de modo convidado */}
        {forceLoad && !user && (
          <div className="bg-yellow-500/90 text-white text-center py-2 px-4">
            <p className="text-sm">
              🎭 Modo Convidado - 
              <button 
                onClick={() => navigate("/ms/login")}
                className="underline hover:no-underline ml-1"
              >
                Faça login para uma experiência completa
              </button>
            </p>
          </div>
        )}
        
        <main className="flex-grow py-8">
          <div className="ms-container max-w-4xl mx-auto">
            <GuataHeader 
              onClearConversation={handleLimparConversa}
              mensagens={mensagens}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2">
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
              
              <div>
                <SuggestionQuestions 
                  onSuggestionClick={handleSuggestionClick}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </UniversalLayout>
  );
};

export default Guata;