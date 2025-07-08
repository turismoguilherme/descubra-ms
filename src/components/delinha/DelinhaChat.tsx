
import React from "react";
import { AIMessage } from "@/types/ai";
import DelinhaProfile from "./DelinhaProfile";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface DelinhaChatProps {
  mensagens: AIMessage[];
  inputMensagem: string;
  setInputMensagem: (message: string) => void;
  enviarMensagem: () => void;
  isGravandoAudio: boolean;
  toggleMicrofone: () => void;
  isLoading: boolean;
  isConnected: boolean;
  connectionChecking: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  enviarFeedback: (positivo: boolean) => void;
}

const DelinhaChat = ({
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
  enviarFeedback
}: DelinhaChatProps) => {
  return (
    <div className="bg-black bg-opacity-20 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <DelinhaProfile 
          isConnected={isConnected} 
          connectionChecking={connectionChecking} 
        />
      </div>
      
      <ChatMessages 
        messages={mensagens} 
        enviarFeedback={enviarFeedback} 
      />
      
      <ChatInput
        inputMensagem={inputMensagem}
        setInputMensagem={setInputMensagem}
        enviarMensagem={enviarMensagem}
        toggleMicrofone={toggleMicrofone}
        isGravandoAudio={isGravandoAudio}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default DelinhaChat;
