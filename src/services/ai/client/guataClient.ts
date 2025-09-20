import { supabase } from "@/integrations/supabase/client";
import { KnowledgeItem } from "../knowledge/knowledgeTypes";
import { GuataUserInfo, GuataResponse } from "../types/guataTypes";
import { geminiClient, generateContent } from "@/config/gemini";
import { searchMSKnowledge } from "../knowledge/msKnowledgeBase";
import { addPersonalityToPrompt, detectContext, detectLanguage } from "../personality/guataPersonality";
import { webSearchService } from "../search/webSearchService";
import { dynamicWebSearchService } from "../search/dynamicWebSearchService";
import { socialMediaService } from "../social/socialMediaService";
import { reservationService } from "@/services/reservations/reservationService";
import { emergencyService } from "@/services/emergency/emergencyService";
import { itineraryService } from "@/services/itineraries/itineraryService";
import { ItineraryRequest } from "@/services/itineraries/itineraryTypes";
import { mlService } from "@/services/ml/mlService";
import { informationVerificationService } from "../verification/informationVerificationService";

/**
 * Cliente para comunicação com a API do Guatá
 */
export class GuataClient {
  private currentThreadId: string | null = null;
  private currentConversation: {
    introduced: boolean;
    context: string;
    messages: { role: 'user' | 'assistant', content: string }[];
  } = {
    introduced: false,
    context: '',
    messages: []
  };

  /**
   * Envia uma pergunta para a API Guatá usando Gemini
   */
  async sendQuery(
    prompt: string,
    knowledgeBase?: KnowledgeItem[],
    userInfo?: GuataUserInfo
  ): Promise<GuataResponse> {
    try {
      console.log("🦦 Guatá: Iniciando chamada com Gemini API");
      
      // Preparar contexto da base de conhecimento
      let knowledgeContextInfo = "";
      if (knowledgeBase?.length > 0) {
        knowledgeContextInfo = knowledgeBase.map(item => `
Título: ${item.title}
Categoria: ${item.category}
Conteúdo: ${item.content}
${item.source ? `Fonte: ${item.source}` : ''}
---`).join('\n');
      }

      // Preparar informações do usuário
      let userContext = "";
      if (userInfo) {
        userContext = `
Informações do usuário:
${userInfo.nome ? `Nome: ${userInfo.nome}` : ''}
${userInfo.localizacao ? `Localização: ${userInfo.localizacao}` : ''}
${userInfo.interesses ? `Interesses: ${userInfo.interesses.join(', ')}` : ''}
${userInfo.tipoViagem ? `Tipo de viagem: ${userInfo.tipoViagem}` : ''}
${userInfo.duracao ? `Duração: ${userInfo.duracao}` : ''}
${userInfo.orcamento ? `Orçamento: ${userInfo.orcamento}` : ''}
${userInfo.acessibilidade ? `Acessibilidade: ${userInfo.acessibilidade}` : ''}
${userInfo.idade ? `Idade: ${userInfo.idade}` : ''}
${userInfo.viajandoCom ? `Viajando com: ${userInfo.viajandoCom}` : ''}
---`;
      }

      // Buscar informações específicas de MS
      const context = detectContext(prompt);
      const msKnowledge = searchMSKnowledge(prompt, context as any);
      
      let msContextInfo = "";
      if (msKnowledge.length > 0) {
        msContextInfo = `
INFORMAÇÕES ESPECÍFICAS DE MS (VERIFICADAS E ATUALIZADAS):
${msKnowledge.map(item => `
${item.category.toUpperCase()}: ${item.name}
Localização: ${item.location}
Descrição: ${item.description}
${item.contact ? `Contato: ${item.contact}` : ''}
${item.website ? `Website: ${item.website}` : ''}
${item.tripAdvisorRating ? `TripAdvisor: ${item.tripAdvisorRating}/5` : item.rating ? `Avaliação: ${item.rating}/5` : ''}
${item.priceRange ? `Faixa de preço: ${item.priceRange}` : ''}
${item.specialties ? `Especialidades: ${item.specialties.join(', ')}` : ''}
${item.isPartner ? '⭐ PARCEIRO DA PLATAFORMA' : ''}
${item.cadasturCode ? `Cadastur: ${item.cadasturCode}` : ''}
---`).join('\n')}`;
      }

      // Buscar informações atualizadas da web usando sistema dinâmico inteligente
      let webContextInfo = "";
      try {
        console.log('🔍 Guatá: Iniciando busca dinâmica inteligente...');
        const dynamicAnalysis = await dynamicWebSearchService.search(prompt);
        
        if (dynamicAnalysis.confidence > 50) {
          webContextInfo = `
🔍 INFORMAÇÕES INTELIGENTES DA WEB (${dynamicAnalysis.confidence}% confiança):
${dynamicAnalysis.sources.length > 0 ? `Fontes consultadas: ${dynamicAnalysis.sources.join(', ')}` : ''}

✅ MELHOR RESPOSTA ENCONTRADA:
${dynamicAnalysis.bestAnswer}

📊 ANÁLISE DETALHADA:
${dynamicAnalysis.results.slice(0, 3).map(result => `
FONTE: ${result.source}
CONFIANÇA: ${result.confidence}%
CATEGORIAS: ${result.categories.join(', ')}
OFICIAL: ${result.isOfficial ? '✅' : '❌'}
---`).join('\n')}
---`;
          
          console.log(`✅ Guatá: Busca dinâmica concluída (${dynamicAnalysis.confidence}% confiança)`);
        } else {
          console.log('⚠️ Guatá: Busca dinâmica com baixa confiança, usando fallback');
          // Fallback para busca web tradicional
          const webResults = await webSearchService.search(prompt);
          if (webResults.length > 0) {
            webContextInfo = `
INFORMAÇÕES ATUALIZADAS DA WEB (FONTES CONFIÁVEIS):
${webResults.slice(0, 3).map(result => `
FONTE: ${result.source || 'Web'}
TÍTULO: ${result.title}
CONTEÚDO: ${result.content}
CONFIANÇA: ${Math.round(result.confidence * 100)}%
---`).join('\n')}`;
          }
        }
      } catch (error) {
        console.log('⚠️ Erro na busca dinâmica:', error);
        // Fallback para busca web tradicional
        try {
          const webResults = await webSearchService.search(prompt);
          if (webResults.length > 0) {
            webContextInfo = `
INFORMAÇÕES ATUALIZADAS DA WEB (FONTES CONFIÁVEIS):
${webResults.slice(0, 3).map(result => `
FONTE: ${result.source || 'Web'}
TÍTULO: ${result.title}
CONTEÚDO: ${result.content}
CONFIANÇA: ${Math.round(result.confidence * 100)}%
---`).join('\n')}`;
          }
        } catch (fallbackError) {
          console.log('⚠️ Erro no fallback da busca web:', fallbackError);
        }
      }

      // Buscar informações de redes sociais (INTERNO - não mostrar ao usuário)
      let socialContextInfo = "";
      try {
        const socialResults = await socialMediaService.getRecentPosts(prompt);
        if (socialResults.length > 0) {
          socialContextInfo = `
INFORMAÇÕES INTERNAS (NÃO MENCIONAR AO USUÁRIO):
${socialResults.slice(0, 2).map(result => `
FONTE INTERNA: ${result.source?.name || 'Instagram'}
TÍTULO: ${result.title}
CONTEÚDO: ${result.content}
TIPO: ${result.category}
---`).join('\n')}`;
        }
      } catch (error) {
        console.log('⚠️ Erro na busca de redes sociais:', error);
      }

      // Buscar parceiros disponíveis para reservas (APENAS REAIS)
      let reservationContextInfo = "";
      try {
        if (prompt.toLowerCase().includes('reserva') || prompt.toLowerCase().includes('agendar') || 
            prompt.toLowerCase().includes('hotel') || prompt.toLowerCase().includes('restaurante')) {
          
          // Verificar se há parceiros reais disponíveis
          const hasPartners = await reservationService.hasPartners();
          const partnerStats = await reservationService.getPartnerStats();
          
          if (hasPartners && partnerStats.verifiedPartners > 0) {
            // Só mostrar parceiros se existirem e forem verificados
            const partners = await reservationService.getAvailablePartners();
            if (partners.length > 0) {
              reservationContextInfo = `
PARCEIROS VERIFICADOS DISPONÍVEIS:
${partners.map(partner => `
${partner.type.toUpperCase()}: ${partner.name}
Localização: ${partner.location}
Descrição: ${partner.description}
Contato: ${partner.contactInfo.phone}
Email: ${partner.contactInfo.email}
Preço: ${partner.pricing.minPrice}-${partner.pricing.maxPrice} ${partner.pricing.currency}
Disponibilidade: ${partner.availability.hours}
---`).join('\n')}`;
            }
          } else {
            // Se não há parceiros, informar de forma transparente
            reservationContextInfo = `
INFORMAÇÃO SOBRE PARCEIROS:
- Atualmente não temos parceiros oficiais na plataforma
- Quando tivermos parceiros verificados, eles serão priorizados
- Para reservas, recomendo consultar sites oficiais ou agências locais
---`;
          }
        }
      } catch (error) {
        console.log('⚠️ Erro na verificação de parceiros:', error);
      }

      // Buscar alertas de emergência e contatos
      let emergencyContextInfo = "";
      try {
        // Detectar localização mencionada na pergunta
        const locationKeywords = ['bonito', 'campo grande', 'corumbá', 'pantanal', 'ms', 'mato grosso do sul'];
        const mentionedLocation = locationKeywords.find(loc => 
          prompt.toLowerCase().includes(loc)
        ) || 'Mato Grosso do Sul';

        const emergencyAlerts = await emergencyService.getActiveAlerts(mentionedLocation);
        const emergencyContacts = await emergencyService.getEmergencyContacts(mentionedLocation);
        const safetyRecommendations = await emergencyService.getTouristSafetyRecommendations(mentionedLocation);

        if (emergencyAlerts.success && (emergencyAlerts.weather?.length || emergencyAlerts.health?.length || emergencyAlerts.safety?.length)) {
          emergencyContextInfo = `
🚨 ALERTAS DE EMERGÊNCIA ATIVOS PARA ${mentionedLocation.toUpperCase()}:
${emergencyAlerts.weather?.map(alert => `
CLIMA: ${alert.description}
Severidade: ${alert.severity}
Recomendações: ${alert.recommendations.join(', ')}
---`).join('\n') || ''}
${emergencyAlerts.health?.map(alert => `
SAÚDE: ${alert.description}
Severidade: ${alert.severity}
Prevenção: ${alert.prevention.join(', ')}
---`).join('\n') || ''}
${emergencyAlerts.safety?.map(alert => `
SEGURANÇA: ${alert.description}
Severidade: ${alert.severity}
Áreas afetadas: ${alert.affectedAreas.join(', ')}
Recomendações: ${alert.recommendations.join(', ')}
---`).join('\n') || ''}

📞 CONTATOS DE EMERGÊNCIA:
${emergencyContacts.map(contact => `
${contact.category.toUpperCase()}: ${contact.name}
Telefone: ${contact.phone}
${contact.address ? `Endereço: ${contact.address}` : ''}
${contact.available24h ? '24h' : ''}
---`).join('\n')}

🛡️ RECOMENDAÇÕES DE SEGURANÇA:
${safetyRecommendations.join('\n')}
---`;
        }
      } catch (error) {
        console.log('⚠️ Erro na busca de alertas de emergência:', error);
      }

      // Buscar informações de roteiros dinâmicos
      let itineraryContextInfo = "";
      try {
        // Detectar se o usuário está pedindo um roteiro
        const itineraryKeywords = ['roteiro', 'itinerário', 'programa', 'agenda', 'cronograma', 'planejar', 'organizar'];
        const isAskingForItinerary = itineraryKeywords.some(keyword => 
          prompt.toLowerCase().includes(keyword)
        );

        if (isAskingForItinerary) {
          // Extrair informações do prompt para gerar roteiro
          const interests = this.extractInterests(prompt);
          const location = this.extractLocation(prompt);
          const duration = this.extractDuration(prompt);
          const budget = this.extractBudget(prompt);

          if (interests.length > 0 && location) {
            const itineraryRequest: ItineraryRequest = {
              destination: location,
              location: location,
              duration: duration || 3,
              interests: interests,
              budget: budget || 'moderate',
              startDate: new Date().toISOString(),
              groupSize: 2, // Default value
              accessibility: [] // Default value
            };

            const itineraryResponse = await itineraryService.generateItinerary(itineraryRequest);
            
            if (itineraryResponse.success && itineraryResponse.itinerary) {
              const itinerary = itineraryResponse.itinerary;
              itineraryContextInfo = `
🗺️ ROTEIRO PERSONALIZADO GERADO:
Título: ${itinerary.title}
Duração: ${itinerary.duration} dias
Interesses: ${itinerary.interests.join(', ')}
Orçamento: ${itinerary.budget}

ATRAÇÕES INCLUÍDAS:
${itinerary.attractions.map(attraction => `
${attraction.priority.toUpperCase()}: ${attraction.name}
Localização: ${attraction.location}
Tempo estimado: ${attraction.estimatedTime} horas
Custo estimado: R$ ${attraction.estimatedCost}
---`).join('\n')}

ROTA DIÁRIA:
${itinerary.route.filter(point => point.type === 'attraction').map(point => `
Dia ${point.day}: ${point.name}
Tempo: ${Math.round(point.estimatedTime / 60)} horas
Custo: R$ ${point.estimatedCost}
---`).join('\n')}
---`;
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erro na geração de roteiro:', error);
      }

      // Buscar recomendações personalizadas do ML
      let mlContextInfo = "";
      try {
        const userId = userInfo?.nome ? `user-${userInfo.nome}` : 'default-user';
        
        // Registrar interação do usuário
        if (msKnowledge.length > 0) {
          for (const item of msKnowledge.slice(0, 3)) {
            await mlService.recordInteraction({
              id: `interaction-${Date.now()}`,
              userId,
              category: item.category as any,
              itemId: item.id,
              itemName: item.name,
              rating: item.rating || 4,
              interactionType: 'view',
              timestamp: new Date().toISOString(),
              context: {
                location: userInfo?.localizacao,
                interests: userInfo?.interesses,
                budget: userInfo?.orcamento,
                groupSize: userInfo?.idade ? Number(userInfo.idade) : undefined
              }
            });
          }
        }

        // Gerar recomendações personalizadas
        const mlPrediction = await mlService.generateRecommendations(userId, {
          location: userInfo?.localizacao,
          interests: userInfo?.interesses,
          budget: userInfo?.orcamento,
          groupSize: userInfo?.idade ? Number(userInfo.idade) : undefined
        });

        if (mlPrediction.recommendations.length > 0) {
          mlContextInfo = `
🤖 RECOMENDAÇÕES PERSONALIZADAS (IA):
Confiança: ${Math.round(mlPrediction.confidence * 100)}%
Modelo: ${mlPrediction.modelUsed}

${mlPrediction.recommendations.slice(0, 5).map(rec => `
⭐ ${rec.itemName}
Categoria: ${rec.category}
Razão: ${rec.reason}
Confiança: ${Math.round(rec.confidence * 100)}%
---`).join('\n')}
---`;
        }
      } catch (error) {
        console.log('⚠️ Erro no sistema de ML:', error);
      }

      // Preparar contexto mantendo histórico
      let contextInfo = "";
      
      // Adicionar apresentação apenas na primeira mensagem
      if (!this.currentConversation.introduced) {
        contextInfo += `Você é o Guatá, guia especializado em Mato Grosso do Sul. Mantenha suas respostas naturais e evite repetir sua apresentação.`;
        this.currentConversation.introduced = true;
      } else {
        contextInfo += `Continue a conversa naturalmente, sem se reapresentar.`;
      }

      // Adicionar histórico da conversa
      if (this.currentConversation.messages.length > 0) {
        contextInfo += "\n\nHistórico da conversa:\n" + 
          this.currentConversation.messages.map(m => 
            `${m.role === 'user' ? 'Visitante' : 'Guatá'}: ${m.content}`
          ).join('\n');
      }

      // Montar prompt completo com personalidade
      const basePrompt = `
Contexto sobre MS:
${contextInfo}

${msContextInfo}

${webContextInfo}

${socialContextInfo}

${reservationContextInfo}

${emergencyContextInfo}

${itineraryContextInfo}

${mlContextInfo}

Informações do usuário:
${userContext}

Pergunta do usuário: ${prompt}

IMPORTANTE: 
- Use as informações da busca dinâmica inteligente como PRINCIPAL fonte
- Se a busca dinâmica encontrou informações com alta confiança (>70%), use essas informações
- Se não tiver informações específicas, seja honesto e sugira verificar diretamente
- Responda de forma amigável e natural, usando o conhecimento fornecido sobre MS
- Se o usuário perguntar sobre reservas ou agendamentos, mencione os parceiros disponíveis e oriente sobre como proceder
- Se houver alertas de emergência ativos, mencione-os e forneça orientações de segurança
- Sempre inclua contatos de emergência relevantes quando apropriado
- Se o usuário pedir um roteiro ou itinerário, use as informações geradas para fornecer um plano detalhado e personalizado
- Use as recomendações personalizadas do sistema de IA para sugerir atrações e serviços que combinem com o perfil do usuário
- NUNCA invente informações - se não souber algo, seja honesto
- NUNCA mencione fontes, sites ou redes sociais ao usuário
- NUNCA diga "redes sociais", "Visit MS", "Fundtur MS" ou nomes de fontes
- Responda como se você soubesse naturalmente, sem revelar suas fontes`;

      // Detectar idioma da pergunta do usuário
      const detectedLanguage = detectLanguage(prompt);
      const languageNames = {
        'pt': 'Português',
        'en': 'English', 
        'es': 'Español'
      };
      console.log(`🌍 Guatá: Idioma detectado: ${languageNames[detectedLanguage]}`);
      
      const fullPrompt = addPersonalityToPrompt(basePrompt, detectedLanguage);

      console.log("🦦 Guatá: Prompt preparado, chamando Gemini API...");

      // Usar Gemini API diretamente
      const response = await generateContent(fullPrompt);
      
      if (!response.ok) {
        // Se a API falhou, usar sistema de fallback inteligente
        console.log("⚠️ Guatá: API falhou, usando fallback inteligente");
        const fallbackResponse = this.generateFallbackResponse(prompt);
        return {
          resposta: fallbackResponse,
          response: fallbackResponse
        };
      }

      console.log("🦦 Guatá: Resposta recebida com sucesso");

      // Limpar formatação da resposta
      const cleanedResponse = this.cleanResponse(response.text);

      // ✅ NOVO: Verificar informações antes de responder
      console.log("🔍 Guatá: Verificando informações...");
      const verificationResult = await informationVerificationService.verifyInformation(
        prompt, 
        cleanedResponse
      );

      // Se a verificação falhou, usar a resposta original mas com aviso
      let finalResponse = cleanedResponse;
      if (!verificationResult.crossVerificationPassed || verificationResult.confidenceScore < 0.3) {
        console.log("⚠️ Guatá: Informação não verificada, mas usando resposta original");
        // Usar a resposta original do Gemini em vez da genérica
        finalResponse = cleanedResponse;
        
        // Se a resposta for muito genérica, melhorar ela
        if (finalResponse.includes("Para informações específicas sobre isso") || 
            finalResponse.includes("recomendo consultar fontes oficiais")) {
          // Gerar uma resposta mais inteligente baseada no contexto
          const improvedResponse = this.generateIntelligentResponse(prompt, cleanedResponse);
          finalResponse = improvedResponse;
        }
      }

      // Salvar mensagem no histórico
      this.currentConversation.messages.push(
        { role: 'user', content: prompt },
        { role: 'assistant', content: finalResponse }
      );

      // Limitar tamanho do histórico
      if (this.currentConversation.messages.length > 10) {
        this.currentConversation.messages = this.currentConversation.messages.slice(-10);
      }

      return {
        resposta: finalResponse,
        response: finalResponse
      };

    } catch (error) {
      console.error("🦦 Guatá: Erro ao processar pergunta:", error);
      
      return {
        resposta: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, você pode entrar em contato com nosso suporte.",
        response: "Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes. Se o problema persistir, você pode entrar em contato com nosso suporte.",
        erro: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }

  /**
   * Limpa formatação da resposta removendo marcadores ** e excesso de quebras
   */
  private cleanResponse(text: string): string {
    return text
      .replace(/\*\*/g, '') // Remove marcadores **
      .replace(/\n{3,}/g, '\n\n') // Remove excesso de quebras de linha
      .trim();
  }

  /**
   * Gera resposta de fallback quando a API falha
   */
  private generateFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Respostas específicas para perguntas comuns
    if (lowerPrompt.includes('campo grande') || lowerPrompt.includes('capital')) {
      return `Campo Grande é a capital de Mato Grosso do Sul e tem muito a oferecer! A cidade é conhecida por suas áreas verdes, como o Parque das Nações Indígenas, que é perfeito para caminhadas e contato com a natureza. O centro histórico tem prédios interessantes e a gastronomia local é incrível, com pratos típicos como o sobá. Para quem gosta de cultura, há museus e centros culturais. A cidade tem uma vibe tranquila mas moderna, ideal para quem quer conhecer o MS!`;
    }
    
    if (lowerPrompt.includes('comida') || lowerPrompt.includes('gastronomia') || lowerPrompt.includes('culinária')) {
      return `A gastronomia de Mato Grosso do Sul é uma experiência incrível! A região tem uma mistura interessante de sabores, com influências da culinária japonesa (como o sobá em Campo Grande) e pratos típicos regionais. Você encontra desde restaurantes tradicionais até opções mais modernas. A Feira Central de Campo Grande é um lugar imperdível para experimentar a culinária local!`;
    }
    
    if (lowerPrompt.includes('hotel') || lowerPrompt.includes('hospedagem')) {
      return `Em Campo Grande você encontra boas opções de hospedagem! A maioria dos hotéis fica no centro ou próximo ao centro da cidade, o que facilita o acesso aos principais pontos turísticos. Há opções para todos os bolsos, desde hotéis mais simples até os mais luxuosos. A região central é a mais prática para turistas.`;
    }
    
    if (lowerPrompt.includes('passeio') || lowerPrompt.includes('atração') || lowerPrompt.includes('fazer')) {
      return `Campo Grande tem várias atrações interessantes! O Parque das Nações Indígenas é um dos principais pontos, perfeito para caminhadas e contato com a natureza. O centro histórico tem prédios bonitos para fotografar. Para quem gosta de cultura, há museus interessantes. E não pode faltar experimentar a gastronomia local!`;
    }
    
    // Resposta genérica mas útil
    return `Posso te ajudar com informações sobre Mato Grosso do Sul! O que você gostaria de saber especificamente sobre turismo, gastronomia, hospedagem ou atrações?`;
  }

  /**
   * Gera resposta inteligente quando a resposta original é muito genérica
   */
  private generateIntelligentResponse(prompt: string, originalResponse: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detectar tipo de pergunta e fornecer informações mais específicas
    if (lowerPrompt.includes('campo grande') || lowerPrompt.includes('capital')) {
      return `Campo Grande é a capital de Mato Grosso do Sul e tem muito a oferecer! A cidade é conhecida por suas áreas verdes, como o Parque das Nações Indígenas, que é perfeito para caminhadas e contato com a natureza. O centro histórico tem prédios interessantes e a gastronomia local é incrível, com pratos típicos como o sobá. Para quem gosta de cultura, há museus e centros culturais. A cidade tem uma vibe tranquila mas moderna, ideal para quem quer conhecer o MS!`;
    }
    
    if (lowerPrompt.includes('hotel') || lowerPrompt.includes('hospedagem')) {
      return `Em Campo Grande você encontra boas opções de hospedagem! A maioria dos hotéis fica no centro ou próximo ao centro da cidade, o que facilita o acesso aos principais pontos turísticos. Há opções para todos os bolsos, desde hotéis mais simples até os mais luxuosos. A região central é a mais prática para turistas.`;
    }
    
    if (lowerPrompt.includes('restaurante') || lowerPrompt.includes('comida')) {
      return `A gastronomia de Campo Grande é uma experiência incrível! A cidade tem uma mistura interessante de sabores, com influências da culinária japonesa (como o sobá) e pratos típicos regionais. Você encontra desde restaurantes tradicionais até opções mais modernas. A Feira Central é um lugar imperdível para experimentar a culinária local!`;
    }
    
    if (lowerPrompt.includes('passeio') || lowerPrompt.includes('atração') || lowerPrompt.includes('fazer')) {
      return `Campo Grande tem várias atrações interessantes! O Parque das Nações Indígenas é um dos principais pontos, perfeito para caminhadas e contato com a natureza. O centro histórico tem prédios bonitos para fotografar. Para quem gosta de cultura, há museus interessantes. E não pode faltar experimentar a gastronomia local!`;
    }
    
    // Para outras perguntas, usar a resposta original mas melhorada
    return originalResponse.replace(
      /Para informações específicas sobre isso, recomendo consultar fontes oficiais ou entrar em contato diretamente com os estabelecimentos de interesse\. Posso ajudar com informações gerais sobre turismo em Mato Grosso do Sul!/g,
      'Posso te ajudar com informações sobre Mato Grosso do Sul! O que você gostaria de saber especificamente?'
    );
  }

  /**
   * Gera resposta alternativa quando a verificação falha
   */
  private generateUncertainResponse(prompt: string, verificationResult: any): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Detectar tipo de pergunta e fornecer informações mais específicas
    if (lowerPrompt.includes('hotel') || lowerPrompt.includes('hospedagem')) {
      return `Sobre hospedagem em Mato Grosso do Sul, recomendo consultar diretamente os sites oficiais de reservas como Booking.com, Airbnb ou os sites dos próprios hotéis para informações atualizadas sobre disponibilidade e preços. Para Campo Grande, você pode encontrar boas opções próximas ao centro da cidade.`;
    }
    
    if (lowerPrompt.includes('restaurante') || lowerPrompt.includes('comida')) {
      return `Para restaurantes em Mato Grosso do Sul, especialmente em Campo Grande, recomendo consultar o TripAdvisor ou Google Maps para encontrar as melhores opções com avaliações atualizadas dos clientes. A cidade tem uma excelente gastronomia local!`;
    }
    
    if (lowerPrompt.includes('passeio') || lowerPrompt.includes('atração')) {
      return `Para informações sobre atrações e passeios em Mato Grosso do Sul, recomendo consultar o site oficial da Fundtur-MS (fundtur.ms.gov.br) ou entrar em contato diretamente com as atrações que você tem interesse em visitar.`;
    }
    
    // Para perguntas gerais sobre lugares, fornecer informações básicas
    if (lowerPrompt.includes('campo grande') || lowerPrompt.includes('capital')) {
      return `Campo Grande é a capital de Mato Grosso do Sul e oferece diversas atrações como o Parque das Nações Indígenas, museus, gastronomia local e uma rica cultura. Para informações mais detalhadas, recomendo consultar o site oficial da Fundtur-MS.`;
    }
    
    // Resposta genérica para outras perguntas
    return `Para informações específicas sobre isso, recomendo consultar fontes oficiais ou entrar em contato diretamente com os estabelecimentos de interesse. Posso ajudar com informações gerais sobre turismo em Mato Grosso do Sul!`;
  }

  private extractInterests(prompt: string): string[] {
    const interests = [];
    const interestKeywords = [
      'ecoturismo', 'natureza', 'trilha', 'gruta', 'pantanal', 'bonito', 'campo grande',
      'cultura', 'história', 'gastronomia', 'aventura', 'relaxamento', 'família',
      'casal', 'amigos', 'fotografia', 'observação de aves', 'pesca', 'rafting'
    ];

    interestKeywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword)) {
        interests.push(keyword);
      }
    });

    return interests;
  }

  private extractLocation(prompt: string): string {
    const locations = ['bonito', 'campo grande', 'corumbá', 'pantanal', 'ms', 'mato grosso do sul'];
    const foundLocation = locations.find(location => 
      prompt.toLowerCase().includes(location)
    );
    return foundLocation || 'Mato Grosso do Sul';
  }

  private extractDuration(prompt: string): number {
    const durationMatch = prompt.match(/(\d+)\s*(dia|dias)/i);
    if (durationMatch) {
      return parseInt(durationMatch[1]);
    }
    return 3; // Default 3 dias
  }

  private extractBudget(prompt: string): 'budget' | 'moderate' | 'luxury' {
    if (prompt.toLowerCase().includes('econômico') || prompt.toLowerCase().includes('barato')) {
      return 'budget';
    }
    if (prompt.toLowerCase().includes('luxo') || prompt.toLowerCase().includes('premium')) {
      return 'luxury';
    }
    return 'moderate';
  }

  /**
   * Limpa o thread ID atual, iniciando uma nova conversa
   */
  clearThread(): void {
    this.currentThreadId = null;
    // Resetar conversa também
    this.currentConversation = {
      introduced: false,
      context: '',
      messages: []
    };
    console.log("🦦 Guatá: Nova conversa iniciada");
  }

  /**
   * Obtém o thread ID atual
   */
  getCurrentThreadId(): string | null {
    return this.currentThreadId;
  }

  /**
   * Define um thread ID específico
   */
  setThreadId(threadId: string): void {
    this.currentThreadId = threadId;
    console.log("🦦 Guatá: Thread ID definido:", threadId);
  }
}

// Instância singleton do cliente
export const guataClient = new GuataClient();
 
