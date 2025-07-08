
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, ThumbsUp, ThumbsDown, ChartBar, Calendar, Users, Send } from "lucide-react";
import { Suggestion } from "@/types/management";
import { msRegions } from "./PerformanceDashboard";

interface AIRecommendationsProps {
  region: string;
}

// Dados oficiais simulados
const dadosOficiais = {
  "campo-grande": {
    mercadoMunicipal: "15% dos check-ins em Campo Grande, segundo o app",
    gastronomia: "20% dos usuários do app têm interesse em Gastronomia",
    visitantes: "Aumento de 12% em relação ao mês anterior"
  },
  "pantanal": {
    natureza: "65% dos turistas têm interesse em Natureza",
    spaulo: "40% dos visitantes desta região são de São Paulo",
    ecoturismo: "85% dos turistas buscam experiências de ecoturismo sustentável"
  },
  "bonito-serra-da-bodoquena": {
    natureza: "70% dos turistas têm interesse em Natureza",
    aventura: "50% buscam atividades de aventura",
    transportes: "25% dos comentários mencionam dificuldade de locomoção entre atrativos"
  },
  "caminhos-dos-ipes": {
    cultura: "35% dos turistas buscam eventos culturais",
    artesanato: "40% demonstram interesse em artesanato regional",
    hospedagem: "Taxa de ocupação média de 62% nos últimos 3 meses"
  }
};

// Mock data - in a real application, this would come from an API
const mockSuggestions: Record<string, Suggestion[]> = {
  "all": [
    {
      id: "1",
      regionId: "campo-grande",
      text: "Realize um festival gastronômico no Mercado Municipal para aumentar a visitação em 30%",
      priority: "high",
      category: "event",
      timestamp: "2025-05-08T14:30:00",
      status: "pending"
    },
    {
      id: "2",
      regionId: "pantanal",
      text: "Crie uma campanha de marketing em São Paulo focada em ecoturismo sustentável no Pantanal",
      priority: "medium",
      category: "promotion",
      timestamp: "2025-05-07T10:15:00",
      status: "approved"
    },
    {
      id: "3",
      regionId: "caminhos-dos-ipes",
      text: "Desenvolva parcerias com hotéis em Bonito para oferecer pacotes combinados com o Caminho dos Ipês",
      priority: "high",
      category: "partnership",
      timestamp: "2025-05-06T16:45:00",
      status: "pending"
    }
  ],
  "campo-grande": [
    {
      id: "4",
      regionId: "campo-grande",
      text: "Crie um roteiro cultural ligando o Centro a pontos históricos subutilizados",
      priority: "high",
      category: "promotion",
      timestamp: "2025-05-05T09:20:00",
      status: "pending"
    },
    {
      id: "5",
      regionId: "campo-grande",
      text: "Promova workshops de culinária local no Mercado Municipal aos finais de semana",
      priority: "medium",
      category: "event",
      timestamp: "2025-05-04T11:10:00",
      status: "pending"
    },
  ],
  "pantanal": [
    {
      id: "6",
      regionId: "pantanal",
      text: "Desenvolva um programa de certificação de guias especializados em observação de onças",
      priority: "high",
      category: "training",
      timestamp: "2025-05-03T13:45:00",
      status: "pending"
    },
    {
      id: "7",
      regionId: "pantanal",
      text: "Implemente um sistema de monitoramento de fauna com participação dos turistas",
      priority: "medium",
      category: "experience",
      timestamp: "2025-05-02T10:30:00",
      status: "pending"
    },
  ],
  "bonito-serra-da-bodoquena": [
    {
      id: "8",
      regionId: "bonito-serra-da-bodoquena",
      text: "Implemente um sistema de transporte entre atrativos para reduzir o uso de carros",
      priority: "high",
      category: "infrastructure",
      timestamp: "2025-05-01T16:20:00",
      status: "pending"
    },
    {
      id: "9",
      regionId: "bonito-serra-da-bodoquena",
      text: "Crie um programa de capacitação em inglês para guias locais",
      priority: "medium",
      category: "training",
      timestamp: "2025-04-30T14:15:00",
      status: "pending"
    },
  ]
};

interface Conversation {
  id: string;
  question: string;
  answer: string;
}

const AIRecommendations = ({ region }: AIRecommendationsProps) => {
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const { toast } = useToast();

  const suggestions = mockSuggestions[region] || mockSuggestions["all"];

  const handleFeedback = (id: string, isPositive: boolean) => {
    console.log(`Feedback ${isPositive ? 'positivo' : 'negativo'} para sugestão ${id}`);
    setFeedbackSent(prev => ({ ...prev, [id]: true }));
    
    toast({
      title: isPositive ? "Feedback positivo registrado" : "Feedback negativo registrado",
      description: isPositive 
        ? "Obrigado por sua avaliação positiva!" 
        : "Sua avaliação nos ajudará a melhorar as recomendações.",
    });
    // In a real app, this would send the feedback to an API
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'event': return <Calendar size={18} />;
      case 'promotion': return <ChartBar size={18} />;
      case 'partnership': return <Users size={18} />;
      default: return <MessageCircle size={18} />;
    }
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">IA sugere {suggestions.length} ações</h3>
        <Button variant="outline" size="sm">
          Exportar relatório
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex space-x-3">
                  <div className={`p-2 rounded-md ${
                    suggestion.priority === 'high' ? 'bg-red-100' : 
                    suggestion.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{msRegions[suggestion.regionId as keyof typeof msRegions] || suggestion.regionId}</span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <Badge className={`text-xs ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                        'bg-blue-100 text-blue-800 hover:bg-blue-100'
                      }`}>
                        {suggestion.priority === 'high' ? 'Alta' : 
                        suggestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                      </Badge>
                    </div>
                    <p className="text-gray-800">{suggestion.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Gerado em {new Date(suggestion.timestamp).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!feedbackSent[suggestion.id] ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleFeedback(suggestion.id, true)}
                      >
                        <ThumbsUp size={16} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => handleFeedback(suggestion.id, false)}
                      >
                        <ThumbsDown size={16} />
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-green-600">Feedback enviado</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
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
                    <div className="flex justify-end">
                      <div className="bg-ms-primary-blue/10 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">{conv.question}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-ms-primary-blue/5 border border-ms-primary-blue/10 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-gray-800">{conv.answer}</p>
                      </div>
                    </div>
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
          
          <Card className="p-4">
            <h3 className="font-medium mb-2">Sobre as Recomendações da IA</h3>
            <p className="text-sm text-gray-600 mb-3">
              Esta IA analisa dados de múltiplas fontes para gerar recomendações estratégicas para o turismo em Mato Grosso do Sul:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dados de check-ins e interações do aplicativo</li>
              <li>• Informações de fontes oficiais (Alumia, Sectur, Cadastur)</li>
              <li>• Análise de padrões de visitação e interesses</li>
              <li>• Tendências sazonais e eventos relevantes</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              As recomendações são classificadas por prioridade e categoria para auxiliar na tomada de decisões estratégicas.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
