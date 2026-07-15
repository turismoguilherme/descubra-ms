
import React from "react";
import GuataProfile from "./GuataProfile";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestionQuestions from "./SuggestionQuestions";

interface GuataChatProps {
  mensagens: unknown[];
  inputMensagem: string;
  setInputMensagem: (message: string) => void;
  enviarMensagem: () => void;
  onClearConversation: () => void;
  isGravandoAudio: boolean;
  toggleMicrofone: () => void;
  isLoading: boolean;
  isConnected: boolean;
  connectionChecking: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  enviarFeedback: (positivo: boolean) => void;
  onSuggestionClick?: (suggestion: string) => void;
  suggestionsOverride?: string[];
  showInlineSuggestions?: boolean;
  conversationHistory?: string[];
}

const GuataChat = ({
  mensagens,
  inputMensagem,
  setInputMensagem,
  enviarMensagem,
  isGravandoAudio,
  toggleMicrofone,
  isLoading,
  isConnected,
  connectionChecking,
  handleKeyDown,
  enviarFeedback,
  onClearConversation,
  onSuggestionClick,
  suggestionsOverride,
  showInlineSuggestions = false,
  conversationHistory = [],
}: GuataChatProps) => {
  return (
    <div className="bg-black bg-opacity-20 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <GuataProfile 
          isConnected={isConnected} 
          connectionChecking={connectionChecking} 
        />
      </div>
      
      <ChatMessages 
        messages={mensagens}
        conversationHistory={conversationHistory}
        enviarFeedback={(positivo) => {
          try { 
            enviarFeedback(positivo);
          } catch (error: unknown) {
            console.error('Erro ao enviar feedback:', error);
          }
        }} 
      />

      {showInlineSuggestions && onSuggestionClick && (
        <div className="px-4 pb-3 lg:hidden border-t border-white/10 flex-shrink-0">
          <SuggestionQuestions
            variant="inline"
            onSuggestionClick={onSuggestionClick}
            suggestionsOverride={suggestionsOverride}
          />
        </div>
      )}
      
      <ChatInput
        inputMensagem={inputMensagem}
        setInputMensagem={setInputMensagem}
        enviarMensagem={enviarMensagem}
        isGravandoAudio={isGravandoAudio}
        toggleMicrofone={toggleMicrofone}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
        onClearConversation={onClearConversation}
        mensagens={mensagens}
      />
    </div>
  );
};

export default GuataChat;
