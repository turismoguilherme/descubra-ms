
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GuataHeader from "@/components/guata/GuataHeader";
import GuataChat from "@/components/guata/GuataChat";
import { useGuataConnection } from "@/hooks/useGuataConnection";
import { useGuataConversation } from "@/hooks/useGuataConversation";
import { useGuataInput } from "@/hooks/useGuataInput";
import SuggestionQuestions from "@/components/guata/SuggestionQuestions";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/guataKnowledgeBase";

const Guata = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isConnected, connectionChecking } = useGuataConnection();
  
  // Carrega a base de conhecimento e informações do usuário
  const knowledgeBase = getInitialKnowledgeBase();
  const usuarioInfo = getDefaultUserInfo();
  
  const {
    mensagens,
    isLoading,
    enviarMensagem: enviarMensagemBase,
    handleLimparConversa,
    enviarFeedback
  } = useGuataConversation(knowledgeBase, usuarioInfo);
  
  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone,
    handleKeyDown: handleKeyDownBase
  } = useGuataInput();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Acesso restrito",
        description: "Faça login para conversar com o Guatá.",
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

export default Guata;
