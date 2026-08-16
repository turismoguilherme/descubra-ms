
import { Card } from "@/components/ui/card";

const AboutAI = () => {
  return (
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
  );
};

export default AboutAI;
