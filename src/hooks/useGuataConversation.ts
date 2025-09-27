
import { useState } from "react";
import { AIMessage } from "@/types/ai";
import { useToast } from "@/components/ui/use-toast";
import { guataNewIntelligentService } from "@/services/ai/guataNewIntelligentService";
import { useGuataMessages } from "@/hooks/useGuataMessages";

export const useGuataConversation = (knowledgeBase: any, usuarioInfo: any) => {
  const { mensagens, setMensagens, limparHistorico } = useGuataMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [userId] = useState(() => usuarioInfo?.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();
  const [lastAnswerMeta, setLastAnswerMeta] = useState<any>(null);

  const sanitizeText = (t: string) => {
    let out = t
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/^##?\s+/gm, '')
      .replace(/\*\s/g, '• ');
    // Remover autoapresentações comuns
    const introPatterns = [
      /^ol[áa][!,.]?\s+sou\s+o\s+guat[áa][^\n]*\n?/i,
      /^eu\s+sou\s+o\s+guat[áa][^\n]*\n?/i,
      /^como\s+seu\s+guia[^\n]*\n?/i
    ];
    introPatterns.forEach((rx) => { out = out.replace(rx, ''); });
    // Ajustar termo “Guia de turismo”
    out = out.replace(/guia\s+tur[ií]stic[oa]/gi, 'guia de turismo');
    return out.trim();
  };

  const enviarMensagem = async (inputMensagem: string) => {
    if (inputMensagem.trim() === "") return;
    const novaMensagemUsuario: AIMessage = {
      id: Date.now(),
      text: inputMensagem,
      isUser: true,
      timestamp: new Date()
    };
    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setIsLoading(true);
    
    try {
      console.log("🧠 Enviando mensagem para o Guatá Inteligente:", inputMensagem);
      const mensagemDigitando: AIMessage = {
        id: Date.now() + 0.5,
        text: "Digitando...",
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      setMensagens(prev => [...prev, mensagemDigitando]);

      let respostaTexto = "";
      let metadata: any = null;

      try {
        console.log('🚀 Usando fluxo simples via Gemini (guata-ai)...');
        const { guataSimpleEdgeService } = await import('@/services/ai/guataSimpleEdgeService');
        const kb = Array.isArray(knowledgeBase) ? knowledgeBase : [];
        const conversationHistory = mensagens.map(msg => msg.text);
        const text = await guataSimpleEdgeService.ask(inputMensagem, kb, usuarioInfo, 'tourist', conversationHistory);
        if (text && text.length > 0) {
          respostaTexto = sanitizeText(text);
          metadata = { confidence: 80 };
          console.log('✅ Resposta simples Gemini entregue');
        } else {
          // Se não há resposta, usar fallback
          respostaTexto = sanitizeText('Olá! Eu sou o Guatá, seu guia de turismo do Mato Grosso do Sul. Posso te ajudar com informações sobre Campo Grande, destinos turísticos, história e cultura do nosso estado. O que gostaria de descobrir?');
          metadata = { fallback: true };
        }
      } catch (error) {
        console.warn('❌ Sistema falhou, usando fallback inteligente:', error);
        // O fallback já está implementado no guataSimpleEdgeService
        // Se chegou aqui, significa que o fallback não funcionou, usar emergencial
        respostaTexto = sanitizeText(`Olá! Eu sou o Guatá, seu guia de turismo do Mato Grosso do Sul. Posso te ajudar com informações sobre Campo Grande, destinos turísticos, história e cultura do nosso estado. O que gostaria de descobrir?`);
        metadata = { emergency: true };
      }

      setMensagens(prev => prev.filter(msg => !msg.isTyping));
      
      const novaMensagemBot: AIMessage = {
        id: Date.now() + 1,
        text: respostaTexto,
        isUser: false,
        timestamp: new Date(),
        metadata
      };
      setMensagens(prev => [...prev, novaMensagemBot]);
      setLastAnswerMeta(metadata);

    } catch (error) {
      console.error("Erro crítico no Guatá:", error);
      setMensagens(prev => prev.filter(msg => !msg.isTyping));
      const mensagemErro: AIMessage = {
        id: Date.now() + 1,
        text: "Ops! Tive um problema técnico. Mas posso te ajudar! Diga o que você quer saber sobre Mato Grosso do Sul.",
        isUser: false,
        timestamp: new Date(),
        metadata: { error: true, confidence: 50 }
      };
      setMensagens(prev => [...prev, mensagemErro]);
      toast({ title: "Atenção", description: "Houve um problema, mas o Guatá ainda pode te ajudar!", variant: "default" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparConversa = () => {
    try {
      limparHistorico();
    } catch (e) {
      console.warn('Falha ao limpar histórico:', e);
    }
  };

  const registrarCorrecao = async (mensagemId: number, correcao: string) => {
    try {
      console.log('📝 Correção registrada:', { mensagemId, correcao });
      toast({ title: "Obrigado!", description: "Sua correção foi registrada e nos ajudará a melhorar!", variant: "default" });
    } catch (error) {
      console.error('Erro ao registrar correção:', error);
    }
  };

  const enviarFeedback = async (positivo: boolean) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const lastUser = [...mensagens].reverse().find(m => m.isUser);
      const lastBot = [...mensagens].reverse().find(m => !m.isUser);
      await supabase.functions.invoke('guata-feedback', {
        body: {
          user_id: userId,
          session_id: sessionId,
          question: lastUser?.text || '',
          answer: lastBot?.text || '',
          positive: positivo,
          meta: { ts: new Date().toISOString() }
        }
      });
      console.log('👍 Feedback enviado:', positivo);
    } catch (e) {
      console.warn('Falha ao enviar feedback:', e);
    }
  };

  return {
    mensagens,
    enviarMensagem,
    handleLimparConversa,
    enviarFeedback,
    isLoading,
    sessionId,
    userId,
    registrarCorrecao
  };
};
