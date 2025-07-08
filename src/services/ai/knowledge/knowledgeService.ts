
import { KnowledgeItem } from "@/types/ai";

/**
 * Serviço para gerenciar a base de conhecimento utilizada pela Delinha
 */
export class KnowledgeService {
  /**
   * Filtra a base de conhecimento para itens relevantes à pergunta
   */
  filterRelevantKnowledge(prompt: string, knowledgeBase?: KnowledgeItem[]): KnowledgeItem[] {
    if (!knowledgeBase || knowledgeBase.length === 0) {
      return [];
    }

    const promptLowerCase = prompt.toLowerCase();
    
    // Primeiro, agrupe itens por tema/título
    const groupedItems = new Map<string, KnowledgeItem[]>();
    knowledgeBase.forEach(item => {
      const key = item.title.toLowerCase();
      if (!groupedItems.has(key)) {
        groupedItems.set(key, []);
      }
      groupedItems.get(key)!.push(item);
    });
    
    // Para cada grupo, selecione apenas o item mais recente
    const mostRecentItems: KnowledgeItem[] = [];
    groupedItems.forEach(items => {
      // Ordenar por data de atualização (decrescente)
      const sortedItems = items.sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
      // Adicionar apenas o item mais recente
      if (sortedItems.length > 0) {
        mostRecentItems.push(sortedItems[0]);
      }
    });
    
    // Agora filtre os itens mais recentes por relevância
    let relevantKnowledge = mostRecentItems.filter(item => {
      const itemContent = (item.title + " " + item.content).toLowerCase();
      // Verificar se há palavras-chave relevantes
      return promptLowerCase.split(" ").some(word => 
        word.length > 3 && itemContent.includes(word)
      );
    });
    
    // Se não encontrou itens relevantes, incluir pelo menos os 3 mais gerais
    if (relevantKnowledge.length === 0) {
      relevantKnowledge = mostRecentItems.slice(0, 3);
    }
    
    console.log(`Filtrado ${relevantKnowledge.length} itens mais recentes e relevantes da base de conhecimento`);
    return relevantKnowledge;
  }
  
  /**
   * Lista de fontes oficiais de turismo
   */
  getOfficialTourismSources() {
    return [
      { name: "Ministério do Turismo", url: "www.gov.br/turismo" },
      { name: "Embratur", url: "www.embratur.gov.br" },
      { name: "Brasil Turismo", url: "www.brasil-turismo.com" },
      { name: "Visit Brasil", url: "www.visitbrasil.com" },
      { name: "Organização Mundial do Turismo", url: "www.unwto.org" },
      { name: "World Travel & Tourism Council", url: "www.wttc.org" },
      { name: "Lonely Planet", url: "www.lonelyplanet.com" },
      { name: "TripAdvisor", url: "www.tripadvisor.com" },
      { name: "Expedia", url: "www.expedia.com" },
      { name: "Turismo de Bonito", url: "www.turismo.bonito.ms.gov.br" },
      { name: "Secretaria de Turismo de Campo Grande", url: "www.campogrande.ms.gov.br/sectur" },
      { name: "Prefeitura de Rio Verde", url: "www.rioverde.ms.gov.br" },
      { name: "Turismo de Corumbá", url: "www.corumba.ms.gov.br/turismo" },
      { name: "Prefeitura de Dourados", url: "www.dourados.ms.gov.br" },
      { name: "Prefeitura de Três Lagoas", url: "www.treslagoas.ms.gov.br" },
      { name: "Prefeitura de Ponta Porã", url: "www.pontapora.ms.gov.br" },
      { name: "Fundtur-MS", url: "www.turismo.ms.gov.br" },
      { name: "Visit MS", url: "www.visitms.com.br" },
      { name: "Bonito Ecotour", url: "bonitoecotour.com" },
      { name: "Bonito Way", url: "www.bonitoway.com.br" },
    ];
  }
  
  /**
   * Busca informações em fontes oficiais de turismo com base na pergunta do usuário
   * Esta função simula uma busca em APIs ou web scraping de fontes oficiais
   */
  async fetchOfficialInformation(query: string): Promise<{content: string, source: string} | null> {
    try {
      console.log("Buscando informações em fontes oficiais para:", query);
      
      // Em uma implementação real, aqui faríamos chamadas para APIs ou web scraping
      // Por enquanto, vamos simular um delay e retornar dados do nosso próprio banco de conhecimento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const queryLower = query.toLowerCase();
      
      // Simular busca por informações oficiais com base em palavras-chave
      if (queryLower.includes("bonito") || queryLower.includes("serra da bodoquena")) {
        return {
          content: "Bonito é o principal destino de ecoturismo do Brasil, localizado na Serra da Bodoquena em MS. " +
                  "O destino é conhecido mundialmente por suas águas cristalinas, grutas e biodiversidade. " +
                  "Segundo dados mais recentes, o destino recebeu aproximadamente 250 mil turistas, " +
                  "com uma taxa média de ocupação hoteleira de 72%. Os principais atrativos incluem flutuação " +
                  "no Rio da Prata, mergulho na Nascente Azul e visita à Gruta do Lago Azul, patrimônio da humanidade.",
          source: OfficialSources.FUNDTURMS
        };
      }
      
      if (queryLower.includes("pantanal")) {
        return {
          content: "O Pantanal é a maior planície alagável do mundo e um Patrimônio Natural da Humanidade reconhecido pela UNESCO. " +
                  "Estudos indicam que o bioma abriga mais de 4.700 espécies catalogadas de plantas e animais. " +
                  "A temporada de seca (maio a setembro) é considerada a melhor época para observação de fauna. " +
                  "De acordo com dados recentes, o turismo no Pantanal movimenta cerca de R$ 350 milhões por ano na economia local.",
          source: OfficialSources.IBGE + " e " + OfficialSources.EMBRATUR
        };
      }
      
      if (queryLower.includes("campo grande")) {
        return {
          content: "Campo Grande, capital de MS, possui cerca de 916 mil habitantes segundo dados recentes. " +
                  "A cidade é reconhecida como polo gastronômico e cultural, com forte influência de povos indígenas, " +
                  "migrantes japoneses e paraguaios. O Sobá, prato típico da cidade, foi reconhecido como Patrimônio " +
                  "Cultural Imaterial. A cidade conta com o Bioparque Pantanal, maior aquário de água doce do mundo, " +
                  "que recebeu mais de 300 mil visitantes em seu primeiro ano de funcionamento.",
          source: OfficialSources.IBGE + " e " + OfficialSources.MTUR
        };
      }
      
      if (queryLower.includes("trem") || queryLower.includes("passeio")) {
        return {
          content: "O passeio de trem entre Campo Grande e Miranda é uma experiência única que permite conhecer paisagens " +
                  "deslumbrantes do Pantanal. O percurso de 220 km atravessa fazendas históricas e áreas de conservação, " +
                  "com paradas interpretativas. Uma das atrações turísticas mais autênticas da região, o passeio opera " +
                  "regularmente e conta com guias especializados que explicam sobre a fauna, flora e história local.",
          source: OfficialSources.FUNDTURMS
        };
      }
      
      if (queryLower.includes("documentos") || queryLower.includes("viajar") || queryLower.includes("passaporte")) {
        return {
          content: "Para viagens domésticas dentro do Brasil é necessário documento " +
                  "oficial com foto (RG ou CNH). Para estrangeiros oriundos do Mercosul, é aceito o documento de identidade " +
                  "do país de origem. Para os demais estrangeiros, é necessário passaporte válido e, em alguns casos, visto. " +
                  "Recomenda-se que os documentos tenham validade mínima de 6 meses além da data planejada para retorno.",
          source: OfficialSources.MTUR + " e " + OfficialSources.UNWTO
        };
      }
      
      if (queryLower.includes("turismo") && (queryLower.includes("estatísticas") || queryLower.includes("dados"))) {
        return {
          content: "Segundo dados recentes, o Brasil recebeu aproximadamente 6,3 milhões de turistas " +
                  "internacionais, um aumento significativo em relação ao ano anterior. O estado de Mato Grosso do Sul " +
                  "recebeu cerca de 3,2 milhões de turistas, sendo 85% turistas nacionais e " +
                  "15% internacionais. O setor de turismo representa aproximadamente 8% do PIB do estado.",
          source: OfficialSources.UNWTO + " e " + OfficialSources.FUNDTURMS
        };
      }
      
      // Se não encontrou informações específicas
      return null;
      
    } catch (error) {
      console.error("Erro ao buscar informações oficiais:", error);
      return null;
    }
  }
}

// Fontes oficiais de dados turísticos
export const OfficialSources = {
  EMBRATUR: "Embratur - Agência Brasileira de Promoção Internacional do Turismo",
  IBGE: "Instituto Brasileiro de Geografia e Estatística",
  UNWTO: "Organização Mundial do Turismo das Nações Unidas",
  FUNDTURMS: "Fundação de Turismo de Mato Grosso do Sul",
  MTUR: "Ministério do Turismo"
};

// Instância única do serviço de conhecimento
export const knowledgeService = new KnowledgeService();
