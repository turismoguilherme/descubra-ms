
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DelinhaChat from "@/components/delinha/DelinhaChat";
import SuggestionQuestions from "@/components/delinha/SuggestionQuestions";
import DelinhaHeader from "@/components/delinha/DelinhaHeader";
import { useDelinhaInput } from "@/hooks/useDelinhaInput";
import { useDelinhaConnection } from "@/hooks/useDelinhaConnection";
import { useDelinhaConversation } from "@/hooks/useDelinhaConversation";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/delinhaKnowledgeBase";

const DelinhaAI = () => {
  // Carrega a base de conhecimento e informações do usuário
  const knowledgeBase = getInitialKnowledgeBase();
  const usuarioInfo = getDefaultUserInfo();
  
  // Hooks para gerenciar diferentes aspectos da interface
  const { isConnected, connectionChecking } = useDelinhaConnection();
  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone, 
    handleKeyDown,
    handleSugestaoClick 
  } = useDelinhaInput();
  const {
    mensagens,
    isLoading,
    enviarMensagem,
    handleLimparConversa,
    enviarFeedback
  } = useDelinhaConversation(knowledgeBase, usuarioInfo);

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
            <DelinhaHeader 
              onClearConversation={handleLimparConversa} 
              mensagens={mensagens}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
              <div className="lg:col-span-2">
                <DelinhaChat
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

export default DelinhaAI;
