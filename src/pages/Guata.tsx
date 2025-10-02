import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import GuataHeader from "@/components/guata/GuataHeader";
import GuataChat from "@/components/guata/GuataChat";
import { useGuataConnection } from "@/hooks/useGuataConnection";
// import { useGuataConversation } from "@/hooks/useGuataConversation"; // Disabled
import { useGuataInput } from "@/hooks/useGuataInput";
import SuggestionQuestions from "@/components/guata/SuggestionQuestions";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/guataKnowledgeBase";
import UniversalLayout from "@/components/layout/UniversalLayout";

const Guata = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // const { isConnected, connectionChecking } = useGuataConnection();
  const isConnected = true;
  const connectionChecking = false;
  
  // Carrega a base de conhecimento e informações do usuário
  const knowledgeBase = getInitialKnowledgeBase();
  const usuarioInfo = getDefaultUserInfo(user);
  
  // Versão simplificada para evitar o hook desabilitado
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const enviarMensagem = async (msg: string) => {
    if (!msg.trim()) return;
    
    setChatLoading(true);
    setMensagens(prev => [...prev, { role: 'user', content: msg, isUser: true, text: msg, timestamp: new Date() }]);
    setInputMensagem(""); // Limpa o input
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay
    setMensagens(prev => [...prev, { role: 'assistant', content: `Olá! Você disse: "${msg}". Como posso ajudar hoje? (Simulado)`, isUser: false, text: `Olá! Você disse: "${msg}". Como posso ajudar hoje? (Simulado)`, timestamp: new Date() }]);
    setChatLoading(false);
  };
  const handleLimparConversa = () => setMensagens([]);
  const enviarFeedback = async (messageId: string, feedbackType: 'like' | 'dislike') => {
    console.log(`Feedback para ${messageId}: ${feedbackType}`);
    toast({ title: "Feedback enviado!", description: "Obrigado por sua contribuição." });
  };
  
  const { 
    inputMensagem, 
    setInputMensagem, 
    isGravandoAudio, 
    toggleMicrofone,
    handleKeyDown: handleKeyDownBase
  } = useGuataInput();

  const enviarMensagemBase = (msg: string) => {
    if (!msg.trim()) return;
    enviarMensagem(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDownBase(e, () => enviarMensagemBase(inputMensagem));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/ms/login");
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar o Guatá.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, navigate, toast]);

  if (authLoading || connectionChecking) {
    return (
      <UniversalLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <p className="text-lg text-gray-700">Carregando Guatá...</p>
        </div>
      </UniversalLayout>
    );
  }

  // Layout principal como na imagem
  return (
    <UniversalLayout>
      <div className="min-h-screen bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green">
        <main className="flex-grow py-8">
          <div className="ms-container max-w-6xl mx-auto">
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
                  enviarMensagem={() => enviarMensagemBase(inputMensagem)}
                  onClearConversation={handleLimparConversa}
                  isGravandoAudio={isGravandoAudio}
                  toggleMicrofone={toggleMicrofone}
                  isLoading={chatLoading}
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
      </div>
    </UniversalLayout>
  );
};

export default Guata;