
import { officialInformation } from "../data/officialInformation";

// Content filter function to detect offensive content
export const containsOffensiveContent = (text: string): boolean => {
  const offensiveTerms = [
    "racismo", "homofobia", "xenofobia", "preconceito", 
    // This would be expanded with a comprehensive list in production
  ];
  
  return offensiveTerms.some(term => text.toLowerCase().includes(term));
};

// Generate AI response based on user query
export const generateResponse = (query: string): { text: string; source?: string } => {
  const queryLower = query.toLowerCase();
  
  // Check for matching entries in official information
  for (const [key, info] of Object.entries(officialInformation)) {
    if (queryLower.includes(key)) {
      let response = info.content;
      
      // Add specific details based on the type of information
      if (info.attractions) {
        response += `\n\nPrincipais atrações: ${info.attractions.join(", ")}.`;
      }
      
      if (info.fees) {
        response += `\n\nTarifas: ${info.fees}`;
      }
      
      if (info.regions) {
        response += `\n\nRegiões: ${info.regions.join(", ")}.`;
      }
      
      if (info.access) {
        response += `\n\nAcesso: ${info.access}`;
      }
      
      return { 
        text: response,
        source: info.source 
      };
    }
  }
  
  // General responses based on keywords
  if (queryLower.includes("evento") || queryLower.includes("festival")) {
    return { 
      text: "O calendário oficial de eventos do MS está disponível no site da Fundtur-MS. Os principais eventos incluem o Festival de Inverno de Bonito (agosto), Festival América do Sul Pantanal (maio) e Festa do Sobá em Campo Grande (agosto). Recomendo consultar as datas exatas no calendário oficial, pois podem variar anualmente.",
      source: "Fundtur-MS" 
    };
  }
  
  if (queryLower.includes("clima") || queryLower.includes("temperatura")) {
    return { 
      text: "Mato Grosso do Sul tem clima tropical, com verões quentes e úmidos (dezembro a março) com temperaturas entre 25°C e 35°C, e invernos mais secos (junho a setembro) com temperaturas entre 15°C e 25°C. O Pantanal é mais quente, enquanto regiões como Bonito e Ponta Porã podem ter noites mais frias no inverno.",
      source: "EMBRATUR" 
    };
  }
  
  // Default response when no specific information is found
  return { 
    text: "Não possuo informações específicas sobre essa pergunta em minha base de dados atual. Recomendo consultar diretamente o site da Fundtur-MS (www.turismo.ms.gov.br) ou entrar em contato com a Central de Atendimento ao Turista mais próxima para obter informações precisas e atualizadas." 
  };
};
