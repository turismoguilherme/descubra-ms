
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DelinhaHeader from "@/components/delinha/DelinhaHeader";
import DelinhaChat from "@/components/delinha/DelinhaChat";
import { useDelinhaConnection } from "@/hooks/useDelinhaConnection";
import { useDelinhaConversation } from "@/hooks/useDelinhaConversation";
import { useDelinhaInput } from "@/hooks/useDelinhaInput";
import SuggestionQuestions from "@/components/delinha/SuggestionQuestions";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/delinhaKnowledgeBase";

const Delinha = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isConnected, connectionChecking } = useDelinhaConnection();
  
  // Carrega a base de conhecimento e informações do usuário
  const knowledgeBase = getInitialKnowledgeBase();
  const usuarioInfo = getDefaultUserInfo();
  
  const {
    mensagens,
    isLoading,
    enviarMensagem: enviarMensagemBase,
    handleLimparConversa,
    enviarFeedback
  } = useDelinhaConversation(knowledgeBase, usuarioInfo);
  
  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone,
    handleKeyDown: handleKeyDownBase
  } = useDelinhaInput();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Acesso restrito",
        description: "Faça login para conversar com a Delinha.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
  }, [user, loading, navigate, toast]);

  const enviarMensagem = () => {
    if (!inputMensagem.trim()) return;
    enviarMensagemBase(inputMensagem);
    setInputMensagem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDownBase(e, enviarMensagem);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="ms-container max-w-4xl mx-auto">
          <DelinhaHeader 
            onClearConversation={handleLimparConversa}
            mensagens={mensagens}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              <DelinhaChat
                mensagens={mensagens}
                inputMensagem={inputMensagem}
                setInputMensagem={setInputMensagem}
                enviarMensagem={enviarMensagem}
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
                onSuggestionClick={(pergunta) => {
                  setInputMensagem(pergunta);
                  enviarMensagemBase(pergunta);
                }}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Delinha;
