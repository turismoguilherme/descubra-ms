
import { useState } from "react";
import { AIMessage } from "@/types/ai";
import { useToast } from "@/components/ui/use-toast";
import { guataService } from "@/services/ai";
import { useGuataMessages } from "@/hooks/useGuataMessages";
import { ENV } from "@/config/environment";
import { supabase } from "@/integrations/supabase/client";

export const useGuataConversation = (knowledgeBase: any, usuarioInfo: any) => {
  const { mensagens, setMensagens, limparHistorico } = useGuataMessages();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const enviarMensagem = async (inputMensagem: string) => {
    if (inputMensagem.trim() === "") return;
    
    // Adiciona a mensagem do usuário
    const novaMensagemUsuario: AIMessage = {
      id: Date.now(),
      text: inputMensagem,
      isUser: true,
      timestamp: new Date()
    };
    
    setMensagens(prev => [...prev, novaMensagemUsuario]);
    setIsLoading(true);
    
    try {
      console.log("Enviando mensagem para o Guatá:", novaMensagemUsuario.text);
      
      // Adicionar mensagem de digitando...
      const mensagemDigitando: AIMessage = {
        id: Date.now() + 0.5,
        text: "Digitando...",
        isUser: false,
        timestamp: new Date(),
        isTyping: true
      };
      
      setMensagens(prev => [...prev, mensagemDigitando]);

      let respostaTexto = "";
      let ragData: any = null; // Variável para armazenar dados do RAG

      if (ENV.FEATURES.ENABLE_RAG) {
        // Caminho RAG: chamar Edge Function guata-web-rag
        try {
          console.log('🔍 Tentando RAG...')
          const { data, error } = await supabase.functions.invoke("guata-web-rag", {
            body: {
              question: novaMensagemUsuario.text,
              state_code: ENV.RAG?.DEFAULT_STATE || "MS",
              user_id: usuarioInfo?.id || usuarioInfo?.nome || "Usuario"
            }
          });

          if (error) {
            throw new Error('RAG response error')
          }

          if (data && data.answer) {
            respostaTexto = data.answer
            ragData = data; // Armazenar dados do RAG
            console.log('✅ RAG funcionou:', { 
              confidence: data.confidence, 
              sources: data.sources?.length || 0 
            })
          } else {
            throw new Error('RAG no data')
          }
        } catch (ragError) {
          console.warn('⚠️ RAG falhou, usando fallback:', ragError)
          // Fallback para fluxo atual
          const resposta = await guataService.askQuestionSmart(
            novaMensagemUsuario.text,
            usuarioInfo?.nome || 'Usuário',
            `session-${Date.now()}`,
            'turismo',
            'Mato Grosso do Sul'
          );
          respostaTexto = resposta.answer;
        }
      } else {
        // Fluxo atual (sem RAG)
        const resposta = await guataService.askQuestionSmart(
          novaMensagemUsuario.text,
          usuarioInfo?.nome || 'Usuário',
          `session-${Date.now()}`,
          'turismo',
          'Mato Grosso do Sul'
        );
        respostaTexto = resposta.answer;
      }
      
      // Remover mensagem de digitando
      setMensagens(prev => prev.filter(msg => !msg.isTyping));
      
      const novaMensagemBot: AIMessage = {
        id: Date.now() + 1,
        text: respostaTexto,
        isUser: false,
        timestamp: new Date(),
        metadata: ENV.FEATURES.ENABLE_RAG && ragData ? {
          rag: true,
          confidence: ragData.confidence,
          sources: ragData.sources,
          total_sources: ragData.total_sources
        } : undefined
      };
      
      setMensagens(prev => [...prev, novaMensagemBot]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Remover mensagem de digitando
      setMensagens(prev => prev.filter(msg => !msg.isTyping));
      
      // Mensagem de erro para o usuário
      toast({
        title: "Erro ao processar mensagem",
        description: "Não foi possível obter uma resposta. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
      
      // Adicionar mensagem de erro do bot
      const mensagemErro: AIMessage = {
        id: Date.now() + 1,
        text: "Opa, tive um probleminha aqui no meu sistema! Pode tentar me perguntar de outro jeito? Às vezes a conexão do Pantanal falha um pouquinho!",
        isUser: false,
        error: true,
        timestamp: new Date()
      };
      
      setMensagens(prev => [...prev, mensagemErro]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparConversa = () => {
    // Mostrar confirmação antes de limpar
    if (window.confirm("Tem certeza que deseja apagar todo o histórico de conversa?")) {
      limparHistorico();
      toast({
        title: "Histórico limpo",
        description: "Sua conversa com o Guatá foi reiniciada."
      });
    }
  };

  const enviarFeedback = (positivo: boolean) => {
    toast({
      title: positivo ? "Obrigado pelo feedback!" : "Vou melhorar, prometo!",
      description: positivo 
        ? "Que bom que consegui te ajudar! Vamos continuar explorando o MS juntos!" 
        : "Desculpe se não consegui te ajudar dessa vez. Vou me esforçar mais!",
    });
  };

  return {
    mensagens,
    isLoading,
    enviarMensagem,
    handleLimparConversa,
    enviarFeedback
  };
};
