import React from "react";
import KodaProfile from "./KodaProfile";
import KodaChatMessages from "./KodaChatMessages";
import KodaChatInput from "./KodaChatInput";

interface KodaChatProps {
  messages: unknown[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  sendMessage: () => void;
  onClearConversation: () => void;
  isRecordingAudio: boolean;
  toggleMicrophone: () => void;
  isLoading: boolean;
  isConnected: boolean;
  connectionChecking: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  sendFeedback: (positive: boolean) => void;
}

const KodaChat = ({
  messages,
  inputMessage,
  setInputMessage,
  sendMessage,
  isRecordingAudio,
  toggleMicrophone,
  isLoading,
  isConnected,
  connectionChecking,
  handleKeyDown,
  sendFeedback,
  onClearConversation
}: KodaChatProps) => {
  return (
    <div className="bg-black bg-opacity-20 rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <KodaProfile 
          isConnected={isConnected} 
          connectionChecking={connectionChecking} 
        />
      </div>
      
      <KodaChatMessages 
        messages={messages} 
        sendFeedback={(positive) => {
          try { 
            sendFeedback(positive);
          } catch (error: unknown) {
            console.error('Erro ao enviar feedback:', error);
          }
        }} 
      />
      
      <KodaChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        sendMessage={sendMessage}
        isRecordingAudio={isRecordingAudio}
        toggleMicrophone={toggleMicrophone}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
        onClearConversation={onClearConversation}
        messages={messages}
      />
    </div>
  );
};

export default KodaChat;
