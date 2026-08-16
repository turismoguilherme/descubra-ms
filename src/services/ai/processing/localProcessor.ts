
import { KnowledgeItem } from "@/types/ai";
import { DelinhaResponse, DelinhaUserInfo } from "../types/delinhaTypes";

/**
 * Processador local para fallback quando a API não está disponível
 */
export class LocalProcessor {
  /**
   * Processamento local (fallback) quando a API não está disponível
   * Usa regras simples para simular respostas da IA
   */
  processQuery(
    prompt: string, 
    knowledgeBase?: KnowledgeItem[],
    userInfo?: DelinhaUserInfo
  ): DelinhaResponse {
    const promptLower = prompt.toLowerCase();
    console.log("Processando localmente o prompt:", promptLower);
    
    // Tentar encontrar informações relevantes na base de conhecimento
    if (knowledgeBase && knowledgeBase.length > 0) {
      // Procurar por palavras-chave da pergunta na base de conhecimento
      const keywords = promptLower
        .replace(/[.,?!;:]/g, '')
        .split(' ')
        .filter(word => word.length > 3);
      
      console.log("Palavras-chave extraídas:", keywords);
      
      // Encontrar item mais relevante
      let bestMatch: KnowledgeItem | null = null;
      let secondBestMatch: KnowledgeItem | null = null;
      let highestScore = 0;
      let secondHighestScore = 0;
      
      for (const item of knowledgeBase) {
        const itemText = `${item.title} ${item.content}`.toLowerCase();
        let score = 0;
        
        for (const keyword of keywords) {
          if (itemText.includes(keyword)) {
            score += 1;
            // Bonus para correspondências no título
            if (item.title.toLowerCase().includes(keyword)) {
              score += 0.5;
            }
          }
        }
        
        if (score > highestScore) {
          secondHighestScore = highestScore;
          secondBestMatch = bestMatch;
          highestScore = score;
          bestMatch = item;
        } else if (score > secondHighestScore) {
          secondHighestScore = score;
          secondBestMatch = item;
        }
      }
      
      console.log("Melhor correspondência encontrada:", bestMatch, "com pontuação", highestScore);
      
      if (bestMatch && highestScore > 0) {
        let response = bestMatch.content;
        
        // Se temos uma segunda correspondência relevante, combinar as informações
        if (secondBestMatch && secondHighestScore > 0) {
          response += `\n\nAlém disso, você também pode se interessar por: ${secondBestMatch.content}`;
        }
        
        // Adicionar citação da fonte
        response += `\n\nEsta informação é baseada em dados de ${bestMatch.source}, atualizada em ${new Date(bestMatch.lastUpdated).toLocaleDateString('pt-BR')}.`;
        
        // Adicionar saudação personalizada
        const saudacao = this.getRandomGreeting();
        response += ` ${saudacao}`;
        
        return {
          response: response,
          source: bestMatch.source
        };
      }
    }
    
    // Respostas contextuais baseadas no conteúdo da pergunta
    return this.getContextualResponse(promptLower);
  }
  
  /**
   * Obter uma saudação aleatória para personalizar as respostas
   */
  private getRandomGreeting(): string {
    const saudacoes = [
      "Espero ter ajudado, meu bem!",
      "Posso ajudar com mais alguma coisa?", 
      "Fico à disposição para mais perguntas, viu?"
    ];
    return saudacoes[Math.floor(Math.random() * saudacoes.length)];
  }
  
  /**
   * Fornece respostas contextuais baseadas em palavras-chave da pergunta
   */
  private getContextualResponse(promptLower: string): DelinhaResponse {
    if (promptLower.includes('bonito')) {
      return {
        response: "Bonito é um dos principais destinos ecoturísticos do Brasil, conhecido por suas águas cristalinas, grutas e rica biodiversidade. Os passeios devem ser agendados com antecedência através de agências credenciadas. Os atrativos mais populares são o Gruta do Lago Azul, Rio da Prata, Abismo Anhumas e Boca da Onça. A melhor época para visitar é entre novembro e março, quando as águas estão mais cristalinas. Posso ajudar com informações mais específicas sobre algum atrativo?",
        source: "Fundtur-MS"
      };
    }
    
    if (promptLower.includes('pantanal')) {
      return {
        response: "O Pantanal é a maior planície alagável do planeta e abriga uma impressionante biodiversidade. A melhor época para visita é durante a seca (maio a setembro) quando a observação de animais é facilitada. As principais bases para explorar o Pantanal são Corumbá, Aquidauana e Miranda. Atividades populares incluem safári fotográfico, passeios de barco, pesca esportiva e observação de aves. Você gostaria de saber mais sobre alguma região específica ou atividade no Pantanal?",
        source: "SETESC"
      };
    }
    
    if (promptLower.includes('campo grande')) {
      return {
        response: "Campo Grande, a capital de Mato Grosso do Sul, oferece diversas atrações como o Parque das Nações Indígenas (terceiro maior parque urbano do Brasil), o Mercadão Municipal (onde você pode experimentar o tradicional sobá), o Bioparque Pantanal (maior aquário de água doce do mundo) e o Museu das Culturas Dom Bosco. A cidade também é conhecida pela rica gastronomia que mistura influências indígenas, paraguaias e japonesas. O que mais gostaria de saber sobre Campo Grande?",
        source: "Sectur"
      };
    }
    
    if (promptLower.includes('comida') || promptLower.includes('gastronom') || promptLower.includes('culinária') || promptLower.includes('prato')) {
      return {
        response: "A gastronomia sul-mato-grossense é rica e diversificada! Os pratos típicos incluem o sobá (macarrão japonês adaptado que virou patrimônio cultural de Campo Grande), o churrasco pantaneiro (preparo diferenciado com sal grosso e ervas locais), a chipa (pão de queijo paraguaio), o puchero (guisado de origem paraguaia) e o caldo de piranha (famoso por suas propriedades afrodisíacas). Para beber, não deixe de experimentar o tereré, bebida típica feita com erva-mate gelada. Algum desses pratos desperta seu interesse?",
        source: "Secretaria de Cultura e Turismo de MS"
      };
    }
    
    if (promptLower.includes('documento') || promptLower.includes('identidade') || promptLower.includes('passaporte')) {
      return {
        response: "Para brasileiros, é necessário documento oficial com foto (RG ou CNH) para hospedagem e alguns atrativos. Para estrangeiros, passaporte válido. Para países do Mercosul, é aceito o documento de identidade do país de origem. Alguns atrativos naturais e parques podem exigir comprovantes de vacinação contra febre amarela, especialmente para quem visita o Pantanal. Se pretende dirigir, verifique se sua carteira de habilitação é aceita (países do Mercosul normalmente não precisam de Permissão Internacional).",
        source: "MTur"
      };
    }
    
    if (promptLower.includes('festival') || promptLower.includes('evento')) {
      return {
        response: "Mato Grosso do Sul realiza vários eventos importantes ao longo do ano. Os principais são o Festival de Inverno de Bonito (julho/agosto), o Festival América do Sul Pantanal em Corumbá (maio), a Festa do Sobá em Campo Grande (agosto), o Festival da Guavira em Bodoquena (dezembro) e a Festa do Peixe em Miranda (setembro). Também há importantes festas de peão e rodeios pelo estado. Para datas exatas, recomendo consultar o calendário oficial de eventos no site da Fundtur-MS, pois podem variar anualmente.",
        source: "Fundtur-MS"
      };
    }
    
    if (promptLower.includes('clima') || promptLower.includes('temperatura') || promptLower.includes('tempo')) {
      return {
        response: "Mato Grosso do Sul tem clima tropical, com verões quentes e úmidos (dezembro a março) com temperaturas entre 25°C e 35°C, e invernos mais secos (junho a setembro) com temperaturas entre 15°C e 25°C. O Pantanal tende a ser mais quente e úmido, enquanto regiões como Bonito e Ponta Porã podem ter noites mais frias no inverno, ocasionalmente com mínimas abaixo de 10°C. A estação de chuvas vai de outubro a março, sendo que no Pantanal isso causa o fenômeno da cheia, quando parte da região fica alagada.",
        source: "INMET/Fundtur-MS"
      };
    }
    
    // Resposta para perguntas sobre a própria Delinha
    if (promptLower.includes('delinha') || promptLower.includes('você') || promptLower.includes('seu nome')) {
      return {
        response: "Eu sou a Delinha, uma assistente virtual de turismo inspirada na grande cantora Delanira Pereira Gonçalves, conhecida como Delinha, que foi uma ícone da música regional sul-mato-grossense. Estou aqui para ajudar com informações sobre destinos, eventos e atrações turísticas do Mato Grosso do Sul, sempre com base em dados oficiais dos órgãos de turismo como Fundtur-MS, Cadastur, MTur e outros. Como posso ajudar você hoje?",
        source: "Fundação de Cultura de MS"
      };
    }
    
    // Resposta genérica quando não encontrar informação específica
    return {
      response: `Não tenho informações específicas sobre isso na minha base de conhecimento atual, meu bem. Posso ajudar com informações sobre os principais destinos turísticos de MS como Bonito, Pantanal e Campo Grande. Você também pode perguntar sobre eventos culturais, gastronomia regional, documentação necessária para viagem ou como chegar a esses destinos. Em que mais posso ajudar?`,
      source: "Base de conhecimento Delinha"
    };
  }
}

// Instância única do processador local
export const localProcessor = new LocalProcessor();
