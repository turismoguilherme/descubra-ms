import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { KodaHeader, KodaChat, KodaSuggestionQuestions } from "@/components/koda";
import { useKodaInput } from "@/hooks/useKodaInput";
import { kodaService } from "@/services/ai/kodaService";
import UniversalLayout from "@/components/layout/UniversalLayout";
import { ENV } from "@/config/environment";

const Koda = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionChecking, setConnectionChecking] = useState(false);

  // Force load after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceLoad(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0 && (forceLoad || !authLoading)) {
      const welcomeMessage = {
        id: 1,
        text: ENV.KODA.DEFAULT_GREETING,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, forceLoad, authLoading]);

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
        userId: user?.id || 'guest',
        sessionId: `koda-session-${Date.now()}`,
        userLocation: 'Canada',
        conversationHistory: conversationHistory,
        isFirstUserMessage: isFirstUserMessage
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
        text: "I'm having a little trouble right now. Could you try asking that again? 🦌",
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

  // Loading state
  if (authLoading && !forceLoad) {
    return (
      <UniversalLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-blue-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-16 h-16 mx-auto mb-4 animate-pulse bg-white/20 rounded-full"></div>
            <p className="text-lg">Checking authentication...</p>
            <button 
              onClick={() => setForceLoad(true)}
              className="mt-4 text-sm text-white/70 hover:text-white underline"
            >
              Skip verification
            </button>
          </div>
        </div>
      </UniversalLayout>
    );
  }

  // Main interface
  return (
    <UniversalLayout>
      <div 
        className="min-h-screen bg-gradient-to-br from-red-700 via-red-600 to-blue-900"
        data-testid="koda-container"
      >
        {/* Guest mode indicator */}
        {forceLoad && !user && (
          <div className="bg-yellow-500/90 text-white text-center py-2 px-4">
            <p className="text-sm">
              🎭 Guest Mode - 
              <button 
                onClick={() => navigate("/viajar/login")}
                className="underline hover:no-underline ml-1"
              >
                Log in for the full experience
              </button>
            </p>
          </div>
        )}
        
        <main className="flex-grow py-8">
          <div className="max-w-4xl mx-auto px-4">
            <KodaHeader 
              onClearConversation={handleClearConversation}
              messages={messages}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-2">
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
              
              <div>
                <KodaSuggestionQuestions 
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

export default Koda;
