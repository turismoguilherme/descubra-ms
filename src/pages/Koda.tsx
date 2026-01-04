import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { KodaHeader, KodaChat, KodaSuggestionQuestions } from "@/components/koda";
import KodaFooter from "@/components/koda/KodaFooter";
import { useKodaInput } from "@/hooks/useKodaInput";
import { kodaService } from "@/services/ai/kodaService";
import { useKodaLanguage } from "@/hooks/useKodaLanguage";
import enTranslations from "@/locales/koda/en.json";
import frTranslations from "@/locales/koda/fr.json";

const Koda = () => {
  const { toast } = useToast();
  const { language } = useKodaLanguage();
  const t = language === 'fr' ? frTranslations : enTranslations;

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionChecking, setConnectionChecking] = useState(false);

  // Scroll para o topo quando a página carregar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: t.chat.welcome,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, t.chat.welcome]);

  const sendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (messageToSend.trim() === "") return;
    
    const newUserMessage = {
      id: Date.now(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setConversationHistory(prev => [...prev, messageToSend]);
    setIsLoading(true);
    
    try {
      const isFirstUserMessage = conversationHistory.length === 0;
      const response = await kodaService.processQuestion({
        question: messageToSend,
        userId: 'guest',
        sessionId: `koda-session-${Date.now()}`,
        userLocation: 'Canada',
        conversationHistory: conversationHistory,
        isFirstUserMessage: isFirstUserMessage,
        language: language
      });
      
      const newBotMessage = {
        id: Date.now() + 1,
        text: response.answer,
        isUser: false,
        timestamp: new Date(),
        sources: response.sources,
        confidence: response.confidence,
        processingTime: response.processingTime
      };
      
      setMessages(prev => [...prev, newBotMessage]);
      
    } catch (error) {
      console.error("❌ Error in Koda:", error);
      toast({
        title: "Error",
        description: "Unable to process your question. Please try again!",
        variant: "destructive"
      });
      
      const fallbackMessage = {
        id: Date.now() + 1,
        text: t.chat.error,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  const sendFeedback = (positive: boolean) => {
    console.log("Feedback:", positive ? "positive" : "negative");
  };

  const { 
    inputMessage, 
    setInputMessage, 
    isRecordingAudio, 
    toggleMicrophone,
    handleKeyDown: handleKeyDownBase
  } = useKodaInput();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputMessage.trim() !== "") {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    sendMessage(question);
  };

  // Main interface - Full screen like ChatGuata
  return (
    <div 
      className="min-h-screen w-screen bg-gradient-to-br from-red-700 via-blue-600 to-red-700 flex flex-col"
      data-testid="koda-container"
    >
      <main className="flex-1 flex flex-col p-4 md:p-8 min-h-0">
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          <KodaHeader 
            onClearConversation={handleClearConversation}
            messages={messages}
          />
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-4">
            <div className="lg:col-span-2 flex flex-col min-h-0">
              <KodaChat
                messages={messages}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                sendMessage={sendMessage}
                onClearConversation={handleClearConversation}
                isRecordingAudio={isRecordingAudio}
                toggleMicrophone={toggleMicrophone}
                isLoading={isLoading}
                isConnected={isConnected}
                connectionChecking={connectionChecking}
                handleKeyDown={handleKeyDown}
                sendFeedback={sendFeedback}
              />
            </div>
            
            <div className="flex flex-col min-h-0">
              <KodaSuggestionQuestions 
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </div>
        </div>
      </main>
      
      <KodaFooter />
    </div>
  );
};

export default Koda;
