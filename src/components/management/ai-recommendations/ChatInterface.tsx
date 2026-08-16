
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { Conversation, dadosOficiais } from "./types";
import { motion } from "framer-motion";
import { msRegions } from "../PerformanceDashboard";

interface ChatInterfaceProps {
  region: string;
}

const ChatInterface = ({ region }: ChatInterfaceProps) => {
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations]);

  const generateAIResponse = (question: string): string => {
    // Função simulada que geraria respostas baseadas em dados reais em uma implementação completa
    const questionLower = question.toLowerCase();
    const regionName = msRegions[region as keyof typeof msRegions] || "todas as regiões";
    
    // Respostas específicas com base em perguntas comuns
    if (questionLower.includes("festival gastronômico") || questionLower.includes("mercado municipal") || 
        (questionLower.includes("sugeriu") && questionLower.includes("campo grande"))) {
      return `O Mercado Municipal tem baixa visitação (${dadosOficiais["campo-grande"].mercadoMunicipal}). Um festival gastronômico pode atrair turistas interessados em Gastronomia (${dadosOficiais["campo-grande"].gastronomia}), conforme dados do Lovable. Além disso, houve ${dadosOficiais["campo-grande"].visitantes} de visitantes em Campo Grande no último mês, indicando uma tendência positiva para eventos gastronômicos.`;
    }
    
    if (questionLower.includes("ecoturismo") || questionLower.includes("pantanal") || 
        (questionLower.includes("são paulo") && questionLower.includes("campanha"))) {
      return `${dadosOficiais["pantanal"].natureza} dos turistas que visitam o Pantanal têm interesse em Natureza. Além disso, dados mostram que turistas de São Paulo (${dadosOficiais["pantanal"].spaulo}) buscam principalmente experiências de ecoturismo sustentável. Uma campanha focada nesse público tem potencial de aumentar em 22% os visitantes, segundo análise de tendências.`;
    }
    
    if (questionLower.includes("transporte") || questionLower.includes("bonito") || questionLower.includes("atrativos")) {
      return `A implementação de um sistema de transporte entre atrativos em Bonito é sugerida porque ${dadosOficiais["bonito-serra-da-bodoquena"].transportes}. Isso melhoraria a experiência dos turistas e reduziria o impacto ambiental, alinhando-se com os interesses de ${dadosOficiais["bonito-serra-da-bodoquena"].natureza} dos visitantes que buscam natureza e sustentabilidade.`;
    }

    if (questionLower.includes("cultural") || questionLower.includes("artesanato") || questionLower.includes("ipês")) {
      return `O desenvolvimento de um festival de artesanato regional no Caminho dos Ipês é recomendado porque ${dadosOficiais["caminhos-dos-ipes"].artesanato} dos visitantes demonstram interesse por artesanato. A taxa de ocupação de ${dadosOficiais["caminhos-dos-ipes"].hospedagem} pode ser aumentada com eventos culturais, já que ${dadosOficiais["caminhos-dos-ipes"].cultura} dos turistas buscam experiências culturais.`;
    }
    
    // Resposta genérica quando não temos dados específicos
    return `Com base nos dados coletados para ${regionName}, esta sugestão foi feita após análise de padrões de interesses dos visitantes, origem dos turistas e dados de uso do aplicativo. As sugestões são classificadas por prioridade com base no potencial de impacto e viabilidade de implementação. Em uma implementação completa, eu teria acesso a dados mais específicos para fundamentar melhor esta resposta.`;
  };

  const handleSubmitQuestion = () => {
    if (question.trim() === "") return;
    
    setLoadingAnswer(true);
    
    // Simula o tempo de processamento da IA
    setTimeout(() => {
      const answer = generateAIResponse(question);
      
      const newConversation = {
        id: `conv-${conversations.length + 1}`,
        question,
        answer
      };
      
      setConversations([...conversations, newConversation]);
      setQuestion("");
      setLoadingAnswer(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitQuestion();
    }
  };

  return (
    <Card className="p-4">
      <h3 className="font-medium text-ms-primary-blue flex items-center gap-2 mb-4">
        <MessageCircle size={18} />
        Converse com a IA
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-4 h-[300px] overflow-y-auto mb-4 flex flex-col gap-4">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 italic my-auto">
            <p>Faça perguntas sobre as recomendações da IA</p>
            <p className="text-sm mt-2">Exemplo: "Por que sugeriu um festival no Mercado Municipal?"</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-end"
              >
                <div className="bg-ms-primary-blue/10 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-gray-800">{conv.question}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex justify-start"
              >
                <div className="bg-ms-primary-blue/5 border border-ms-primary-blue/10 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-gray-800">{conv.answer}</p>
                </div>
              </motion.div>
            </div>
          ))
        )}
        {loadingAnswer && (
          <div className="flex justify-start">
            <div className="bg-ms-primary-blue/5 border border-ms-primary-blue/10 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-ms-primary-blue/40 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-ms-primary-blue/40 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-ms-primary-blue/40 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex space-x-2">
        <Input
          placeholder="Pergunte à IA sobre as recomendações..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loadingAnswer}
        />
        <Button 
          onClick={handleSubmitQuestion} 
          disabled={loadingAnswer || question.trim() === ""}
          className="bg-ms-primary-blue hover:bg-ms-primary-blue/90"
        >
          <Send size={16} className="mr-2" />
          Enviar
        </Button>
      </div>
    </Card>
  );
};

export default ChatInterface;
