import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import GuataHeader from "@/components/guata/GuataHeader";
import GuataChat from "@/components/guata/GuataChat";
import { useGuataConnection } from "@/hooks/useGuataConnection";
// import { useGuataConversation } from "@/hooks/useGuataConversation"; // Disabled
import { useGuataInput } from "@/hooks/useGuataInput";
import SuggestionQuestions from "@/components/guata/SuggestionQuestions";
import { getInitialKnowledgeBase, getDefaultUserInfo } from "@/services/ai/knowledge/guataKnowledgeBase";

const GuataPublic = () => {
  // 🔥 HOOKS DEVEM ESTAR NA ORDEM CORRETA - TODOS OS useState PRIMEIRO
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  
  // Hooks básicos do React
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const enviarMensagem = () => {
    if (!inputMensagem.trim()) return;
    enviarMensagemBase(inputMensagem);
    setInputMensagem("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDownBase(e, enviarMensagem);
  };

  // Efeito para detectar quando a conversa começou
  useEffect(() => {
    if (mensagens.length > 0) {
      setShowInitialScreen(false);
    }
  }, [mensagens]);

  // Se deve mostrar tela inicial do totem
  if (showInitialScreen && mensagens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green flex flex-col">
        {/* Tela inicial do totem */}
        <div className="flex-grow flex flex-col items-center justify-center text-center px-8">
          {/* Avatar principal */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <img 
                src="/guata-mascote.jpg" 
                alt="Guatá" 
                className="w-28 h-28 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%234A90E2'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='white' font-size='24' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-6xl font-bold text-white mb-6">
            Guatá
          </h1>
          <p className="text-2xl text-white mb-12 max-w-4xl">
            Seu Guia de Turismo para Mato Grosso do Sul
          </p>

          {/* Seção "Olá! Como posso ajudar?" */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl">
            <h2 className="text-3xl text-white mb-4 flex items-center justify-center">
              💬 Olá! Como posso ajudar?
            </h2>
            <p className="text-xl text-white/90 mb-6">
              Sou seu assistente virtual especializado em turismo. Posso fornecer 
              informações sobre atrações, hotéis, roteiros e muito mais!
            </p>
            
            {/* Input principal */}
            <div className="mb-6">
              <input
                type="text"
                value={inputMensagem}
                onChange={(e) => setInputMensagem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte ao Guatá sobre o MS..."
                className="w-full p-4 text-lg bg-white rounded-xl border-0 focus:ring-2 focus:ring-blue-300 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={enviarMensagem}
                disabled={isLoading || !inputMensagem.trim()}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Pensando...' : 'Conversar com o Guatá'}
              </button>
            </div>
          </div>

          {/* Cards de serviços */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-8">
            <div 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
              onClick={() => {
                setInputMensagem("Quais são as principais atrações turísticas de MS?");
                enviarMensagemBase("Quais são as principais atrações turísticas de MS?");
                setShowInitialScreen(false);
              }}
            >
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-2">Atrações Turísticas</h3>
            </div>
            
            <div 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
              onClick={() => {
                setInputMensagem("Me ajude a criar um roteiro personalizado");
                enviarMensagemBase("Me ajude a criar um roteiro personalizado");
              }}
            >
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Roteiros Personalizados</h3>
            </div>
            
            <div 
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-6 rounded-xl transition-all duration-200 hover:scale-105 cursor-pointer"
              onClick={() => {
                setInputMensagem("Preciso de ajuda com reservas e agendamentos");
                enviarMensagemBase("Preciso de ajuda com reservas e agendamentos");
              }}
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">Reservas e Agendamentos</h3>
            </div>
          </div>

          {/* Idiomas */}
          <div className="text-white/80 flex items-center">
            <span className="mr-2">🌐</span>
            <span>Disponível em português e inglês</span>
          </div>
        </div>
      </div>
    );
  }

  // Interface de chat (quando há mensagens)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-ms-primary-blue to-ms-pantanal-green">
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
    </div>
  );
};

export default GuataPublic;

