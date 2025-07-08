
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Brain, Send, Sparkles } from "lucide-react";

const AIInterface = () => {
  const [question, setQuestion] = useState("");

  const exampleQuestions = [
    "Qual o perfil dos turistas que mais visitam nossa região?",
    "Em que período do ano temos maior fluxo turístico?",
    "Quais são os principais atrativos procurados?",
    "Como melhorar a experiência dos visitantes?",
    "Qual o impacto econômico do turismo na região?",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            IA Interpretativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Funcionalidade em Desenvolvimento</h3>
            </div>
            <p className="text-blue-700">
              Nossa IA interpretativa estará disponível em breve para análise automatizada 
              de dados turísticos. Ela poderá responder perguntas complexas sobre 
              tendências, padrões e insights dos dados coletados.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Digite sua pergunta sobre dados turísticos:
            </label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite aqui sua dúvida sobre os dados turísticos..."
              className="min-h-[100px]"
              disabled
            />
          </div>

          <Button disabled className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Enviar Pergunta (Em Breve)
          </Button>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Exemplos de perguntas que poderá fazer:</h4>
            <div className="space-y-2">
              {exampleQuestions.map((example, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg cursor-not-allowed opacity-50"
                >
                  <MessageSquare className="h-4 w-4 inline mr-2 text-gray-400" />
                  {example}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Área de Respostas da IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">
              Respostas Inteligentes
            </h3>
            <p>
              Esta funcionalidade estará disponível em breve com análise de dados 
              automatizada. A IA interpretará seus documentos e dados da API 
              para fornecer insights valiosos sobre o turismo na região.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInterface;
