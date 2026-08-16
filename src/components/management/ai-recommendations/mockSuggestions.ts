
import { Suggestion } from "@/types/management";

// Mock data - in a real application, this would come from an API
export const mockSuggestions: Record<string, Suggestion[]> = {
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
