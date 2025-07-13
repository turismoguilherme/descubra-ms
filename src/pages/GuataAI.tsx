
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GuataChat from "@/components/guata/GuataChat";
import SuggestionQuestions from "@/components/guata/SuggestionQuestions";
import GuataHeader from "@/components/guata/GuataHeader";
import { useGuataInput } from "@/hooks/useGuataInput";
import { useGuataConnection } from "@/hooks/useGuataConnection";
import { useGuataConversation } from "@/hooks/useGuataConversation";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/guataKnowledgeBase";

const GuataAI = () => {
  // Carrega a base de conhecimento e informações do usuário
  const knowledgeBase = getInitialKnowledgeBase();
  const usuarioInfo = getDefaultUserInfo();
  
  // Hooks para gerenciar diferentes aspectos da interface
  const { isConnected, connectionChecking } = useGuataConnection();
  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone, 
    handleKeyDown,
    handleSugestaoClick 
  } = useGuataInput();
  const {
    mensagens,
    isLoading,
    enviarMensagem,
    handleLimparConversa,
    enviarFeedback
  } = useGuataConversation(knowledgeBase, usuarioInfo);

  // Handler para enviar mensagem quando o usuário pressiona Enter
  const handleKeyDownWithSend = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputMensagem.trim() !== "") {
      enviarMensagem(inputMensagem);
      setInputMensagem("");
    }
  };

  // Handler para enviar mensagem quando o usuário clica no botão
  const handleEnviarMensagem = () => {
    enviarMensagem(inputMensagem);
    setInputMensagem("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green">
      <Navbar />
      <main className="flex-grow">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <GuataHeader 
              onClearConversation={handleLimparConversa} 
              mensagens={mensagens}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
              <div className="lg:col-span-2">
                <GuataChat
                  mensagens={mensagens}
                  inputMensagem={inputMensagem}
                  setInputMensagem={setInputMensagem}
                  enviarMensagem={handleEnviarMensagem}
                  isGravandoAudio={isGravandoAudio}
                  toggleMicrofone={toggleMicrofone}
                  isLoading={isLoading}
                  isConnected={isConnected}
                  connectionChecking={connectionChecking}
                  handleKeyDown={handleKeyDownWithSend}
                  enviarFeedback={enviarFeedback}
                />
              </div>
              
              <div>
                <SuggestionQuestions onSuggestionClick={handleSugestaoClick} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuataAI;
