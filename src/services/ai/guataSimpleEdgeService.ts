export class GuataSimpleEdgeService {
  private needsRealTimeData(_text: string): boolean {
    // SEMPRE buscar informações atualizadas para ser super inteligente
    return true;
  }

  private rewriteQuery(prompt: string, conversationHistory?: string[]): string {
    const historyTail = (conversationHistory || []).slice(-3).join(' | ').trim();
    if (!historyTail) return prompt;
    // Heurística simples para resolver pronomes curtos
    const isShort = prompt.trim().length < 24;
    if (isShort || /isso|isso aí|ali|lá|então|e agora|qual|quanto|quando|onde|como/i.test(prompt)) {
      return `${prompt} (contexto anterior: ${historyTail})`;
    }
    return prompt;
  }

  private async fetchWebContext(question: string): Promise<{ sources: any[]; answer?: string; confidence?: number }> {
    try {
      console.log('🔍 Guatá: Buscando informações atualizadas na web...');
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("guata-web-rag", {
        body: { 
          question, 
          state_code: 'MS',
          max_results: 5,
          include_sources: true
        }
      });
      
      if (error) {
        console.warn('⚠️ Guatá: Erro na busca web:', error);
        return { sources: [] };
      }
      
      const sourcesRaw = data?.sources || [];
      const mapped = sourcesRaw.map((s: any) => ({
        id: s.chunk_id || s.title || Math.random().toString(),
        title: s.title || 'Informação da Web',
        content: s.snippet || s.content || s.text || '',
        category: 'web',
        source: s.source || (s.link ? new URL(s.link).hostname : 'web'),
        lastUpdated: new Date().toISOString(),
        url: s.link || ''
      }));

      console.log('✅ Guatá: Encontrou', mapped.length, 'fontes na web');
      return { sources: mapped, answer: data?.answer, confidence: data?.confidence };
    } catch (error) {
      console.error('❌ Guatá: Erro na busca web:', error);
      return { sources: [] };
    }
  }

  private getNaturalOpening(): string {
    const variants = [
      'Uma boa opção é',
      'Muita gente gosta de',
      'Se você curte este estilo, pode aproveitar',
      'Uma experiência típica é',
      'Para começar, vale considerar'
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  }

  private getOfflineResponse(prompt: string, queryType: 'simple' | 'complex' | 'location' | 'event' | 'detail'): string {
    // Resposta genérica para modo offline - com narrativa envolvente
    switch (queryType) {
      case 'event':
        return `${this.getNaturalOpening()} explorar a cena cultural local. Posso procurar agendas oficiais e te trazer opções dentro dos próximos 30 dias. Prefere música regional ou algo mais tranquilo?`;
      case 'location':
        return `${this.getNaturalOpening()} conhecer lugares queridos pelos moradores, como o Mercado Municipal e o Parque das Nações. Quer um caminho simples para chegar lá?`;
      case 'simple':
        return `${this.getNaturalOpening()} te dar uma visão direta e rápida. Me diga se você prefere natureza, cultura ou gastronomia para eu personalizar melhor.`;
      default:
        return `${this.getNaturalOpening()} entender seu estilo para te indicar algo que combine com você. Prefere natureza, cultura ou gastronomia?`;
    }
  }

  async ask(prompt: string, knowledgeBase?: any[], userInfo?: any, mode: 'tourist' | 'cat' = 'tourist', conversationHistory?: string[]) {
    console.log('🧠 Guatá: Processando pergunta com IA super inteligente...');
    
    // Reescrever consulta com base no histórico recente
    const rewritten = this.rewriteQuery(prompt, conversationHistory);

    // SEMPRE usar as APIs para ser super inteligente
    const needsWeb = this.needsRealTimeData(rewritten);
    const rag = needsWeb ? await this.fetchWebContext(rewritten) : { sources: [] };

    // Montar KB combinando a base local + fontes web + resposta RAG (como doc)
    const kb = [
      ...(Array.isArray(knowledgeBase) ? knowledgeBase : []),
      ...(rag.sources || []),
      ...(rag.answer ? [{
        id: 'rag-answer',
        title: 'Resposta RAG (web consolidada)',
        content: String(rag.answer),
        source: 'rag',
        lastUpdated: new Date().toISOString()
      }] : [])
    ];

    try {
      console.log('🌐 Guatá: Usando APIs para resposta inteligente...');
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke("guata-ai", {
        body: {
          prompt: rewritten,
          knowledgeBase: kb.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            source: item.source || 'web',
            lastUpdated: item.lastUpdated || new Date().toISOString()
          })),
          userContext: userInfo ? JSON.stringify(userInfo) : '',
          chatHistory: conversationHistory?.join('\n') || '',
          mode
        }
      });

      if (error) throw error;
      if (data?.response && data.response.trim().length > 0) {
        console.log('✅ Guatá: Resposta inteligente gerada via API');
        return data.response;
      }
    } catch (error: any) {
      console.error('❌ guataSimpleEdgeService: Erro na API, usando fallback inteligente:', error);
    }

    // Se o modelo não respondeu mas temos uma resposta do RAG, use-a
    if (rag.answer && String(rag.answer).trim().length > 0) {
      return this.enhanceRealistic(String(rag.answer));
    }

    // Se temos fontes mas nenhuma resposta direta, sumarizar as fontes
    if ((rag.sources || []).length > 0) {
      const summary = this.summarizeSources(rag.sources as any[]);
      const followup = this.generateClarifyingQuestion(prompt);
      return `${summary}\n\n${followup}`.trim();
    }

    // Se confiança baixa, perguntar de forma interativa
    if (typeof rag.confidence === 'number' && rag.confidence < 0.4) {
      return this.generateClarifyingQuestion(prompt);
    }

    // Fallback inteligente com Economia da Experiência
    return this.generateExperienceResponse(prompt);
  }

  private enhanceRealistic(answer: string): string {
    const trimmed = String(answer).trim();
    // Adicionar um convite curto e realista para interação
    const suffix = '\n\nQuer que eu detalhe como chegar, melhores horários ou valores aproximados?';
    // Evitar duplicar o sufixo caso o RAG já traga call-to-action
    if (trimmed.toLowerCase().includes('quer que eu')) return trimmed;
    return `${trimmed}${suffix}`;
  }

  private summarizeSources(sources: Array<{ title?: string; content?: string; url?: string; source?: string }>): string {
    const top = sources.slice(0, 3);
    const bullets = top.map((s, i) => {
      const title = s.title || `Fonte ${i + 1}`;
      const host = s.source ? ` (${s.source})` : '';
      return `- ${title}${host}`;
    });
    return `Encontrei algumas referências úteis:\n${bullets.join('\n')}`;
  }

  private generateClarifyingQuestion(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (/bonito|flutuaç|rio da prata|gruta/i.test(lower)) {
      return 'Você quer saber sobre atrativos, preços dos passeios ou como chegar em Bonito?';
    }
    if (/pantanal|saf[áa]ri|on[çc]a|ariranha/i.test(lower)) {
      return 'Prefere saber melhor época, fazendas/lodges ou tempo mínimo de estadia no Pantanal?';
    }
    if (/campo grande|feira central|mercad[aã]o|parque das na[çc][õo]es/i.test(lower)) {
      return 'Você quer dicas de onde comer, o que visitar ou como montar um roteiro em Campo Grande?';
    }
    if (/evento|agenda|festival|show/i.test(lower)) {
      return 'Quer ver eventos deste fim de semana, dos próximos 30 dias ou um tipo específico (música, cultura, infantil)?';
    }
    if (/hotel|pousada|hosped/i.test(lower)) {
      return 'Procura hotel no centro, pousada mais tranquila ou algo próximo aos principais atrativos?';
    }
    if (/roteiro|itiner[áa]rio|dias/i.test(lower)) {
      return 'Quantos dias você tem e seu estilo de viagem (natureza, cultura, gastronomia)?';
    }
    return 'Para eu te ajudar melhor, me diga se você busca natureza, cultura ou gastronomia — e quantos dias pretende ficar.';
  }

  private generateExperienceResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    // ECONOMIA DA EXPERIÊNCIA - Narrativa envolvente que desperta curiosidade
    
    // MERCADO MUNICIPAL - Exemplo da Economia da Experiência
    if (promptLower.includes('mercado') || promptLower.includes('municipal')) {
      return 'Você já ouviu falar no Mercado Municipal de Campo Grande? Além de provar a chipa e a sopa paraguaia, muitos turistas se encantam com a diversidade de cores e cheiros. É como dar um passeio pela história da imigração na cidade. Quer que eu sugira um prato típico para experimentar lá?';
    }
    
    // SOBÁ - Narrativa real e autêntica
    if (promptLower.includes('sobá') || promptLower.includes('comida') || promptLower.includes('gastronomia')) {
      return 'Já imaginou provar o sobá na Feira Central? É uma experiência única! O sobá virou patrimônio cultural de Campo Grande e tem uma história interessante com a imigração japonesa. Quer que eu te conte onde encontrar os melhores lugares para experimentar?';
    }
    
    // TERERÉ - Experiência cultural real
    if (promptLower.includes('tereré') || promptLower.includes('tradição')) {
      return 'O tereré aqui é mais que uma bebida, é tradição! É comum ver o pessoal na praça passando a cuia de mão em mão. É uma forma de se conectar e conversar. Quer saber onde encontrar as melhores rodas de tereré?';
    }
    
    // PARQUE DAS NAÇÕES - Experiência real
    if (promptLower.includes('parque') || promptLower.includes('nações')) {
      return 'O Parque das Nações é um dos lugares mais queridos da cidade! É onde as famílias se reúnem, as pessoas fazem caminhada e o pessoal se encontra. Tem um lago bonito e áreas verdes. Quer que eu te conte os melhores horários para visitar?';
    }
    
    // BONITO - Experiência real
    if (promptLower.includes('bonito')) {
      return 'Bonito é um destino incrível! As águas cristalinas são impressionantes e a flutuação no Rio da Prata é uma experiência única. É um lugar que realmente vale a pena conhecer. Quer que eu te conte os principais atrativos e como organizar a viagem?';
    }
    
    // PANTANAL - Experiência real
    if (promptLower.includes('pantanal')) {
      return 'O Pantanal é um lugar especial! Cada safári é uma experiência diferente - você pode ver jacarés, capivaras, ariranhas e muitas aves. É uma oportunidade única de observar a vida selvagem. Quer saber a melhor época para visitar?';
    }
    
    // ROTA BIOCEÂNICA - Informação real
    if (promptLower.includes('rota bioceânica') || promptLower.includes('bioceanica')) {
      return 'A Rota Bioceânica é um projeto importante que vai conectar Campo Grande ao Pacífico, passando por Paraguai, Argentina e Chile. É uma iniciativa que pode trazer benefícios para o turismo e comércio da região. Quer que eu te conte mais detalhes sobre esse projeto?';
    }
    
    // ROTEIROS - Ajuda real
    if (promptLower.includes('roteiro') || promptLower.includes('3 dias') || promptLower.includes('2 dias')) {
      return 'Que legal! Posso te ajudar a montar um roteiro aqui em Campo Grande. Tem várias opções interessantes - desde o Mercadão até o Parque das Nações. Quer que eu te sugira um roteiro que combine com o que você gosta de fazer?';
    }
    
    // EVENTOS - Informação real
    if (promptLower.includes('evento') || promptLower.includes('festival')) {
      return 'Aqui sempre tem eventos interessantes! Tem o Festival de Inverno, festas tradicionais e outros eventos culturais. Quer que eu te conte quais eventos estão acontecendo e como participar?';
    }
    
    // TRANSPORTE - Informação real
    if (promptLower.includes('como chegar') || promptLower.includes('transporte')) {
      return 'Chegar aqui é bem fácil! Tem voos diretos para Campo Grande, ônibus de várias cidades e as estradas estão boas. Quer que eu te conte a melhor forma de chegar e se locomover pela cidade?';
    }
    
    // HOSPEDAGEM - Informação real
    if (promptLower.includes('onde ficar') || promptLower.includes('hotel') || promptLower.includes('pousada')) {
      return 'Aqui tem várias opções de hospedagem! Tem hotéis no centro, pousadas mais charmosas e opções para todos os gostos. Quer que eu te conte as melhores opções para você?';
    }
    
    // Resposta genérica real e autêntica
    return 'Oi! Sou o Guatá, sua capivara guia! Aqui no Mato Grosso do Sul tem lugares incríveis para conhecer. Quer que eu te conte sobre nossos destinos, nossa gastronomia ou nossas tradições? Vou te ajudar a descobrir o que mais combina com você!';
  }

  private generateTourismResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    // GASTRONOMIA - Com depoimentos locais
    if (promptLower.includes('comida') || promptLower.includes('gastronomia') || promptLower.includes('pratos') || promptLower.includes('sobá')) {
      return 'Ah, rapaz! Aqui no Mercadão você encontra o famoso sobá, que virou patrimônio cultural da cidade. O Seu Jorge, que vende sobá há mais de 20 anos, sempre diz: "Sobá bom é aquele que aquece o coração". Quer que eu te mostre onde comer?';
    }
    
    // TRADIÇÕES LOCAIS - Com cultura viva
    if (promptLower.includes('tereré') || promptLower.includes('tradição') || promptLower.includes('cultura')) {
      return 'O tereré é muito mais que uma bebida, é um símbolo de amizade! Campo-grandense de verdade sempre tem a cuia por perto. Até o Seu Paulo, taxista aqui do centro, costuma dizer: "Se não tiver tereré, não tem conversa". Quer conhecer lugares onde a roda de tereré é tradição?';
    }
    
    // ROTA BIOCEÂNICA - Com perspectiva local
    if (promptLower.includes('rota bioceânica') || promptLower.includes('bioceanica')) {
      return 'Olha só que novidade! A Rota Bioceânica vai ligar Campo Grande ao Pacífico, passando por Paraguai, Argentina e Chile. O pessoal daqui anda animado: dizem que vai ser como abrir uma nova janela pro mundo. Quer que eu conte como isso pode transformar o turismo na região?';
    }
    
    // ROTEIROS - Com experiências autênticas
    if (promptLower.includes('roteiro') || promptLower.includes('3 dias') || promptLower.includes('2 dias') || promptLower.includes('1 dia')) {
      return this.generateAuthenticItinerary(promptLower);
    }
    
    // BONITO - Com curiosidades locais
    if (promptLower.includes('bonito')) {
      return 'Bonito é nosso tesouro escondido! A Dona Rosa, que trabalha na pousada há 15 anos, sempre conta: "Quem vem pra Bonito nunca esquece das águas cristalinas". Ela recomenda começar pelo Rio da Prata - é como flutuar no céu! Quer que eu te conte os segredos que só os moradores conhecem?';
    }
    
    // PANTANAL - Com histórias pantaneiras
    if (promptLower.includes('pantanal')) {
      return 'O Pantanal é nossa alma! O Seu João, guia pantaneiro há 30 anos, sempre diz: "Aqui cada dia é uma surpresa". Ele já viu jacarés de 4 metros e ariranhas brincando. Quer que eu te conte as melhores épocas e os safáris que valem cada minuto?';
    }
    
    // CAMPO GRANDE - Com vida cotidiana
    if (promptLower.includes('campo grande')) {
      return 'Campo Grande é minha casa! A Dona Maria, que sempre toma tereré na Praça Ary Coelho, recomenda experimentar o tereré geladinho com limão, tradição daqui. Ela diz que é assim que a gente se senta e conversa. Quer conhecer os cantinhos que só quem mora aqui sabe?';
    }
    
    // EVENTOS - Com vivência local
    if (promptLower.includes('evento') || promptLower.includes('festival')) {
      return 'Aqui sempre tem movimento! O pessoal do centro adora o Festival de Inverno - a Dona Ana, que vende artesanato, sempre diz: "É quando a cidade fica mais viva". Quer que eu te conte quais eventos estão rolando e como participar da nossa cultura?';
    }
    
    // TRANSPORTE - Com dicas práticas
    if (promptLower.includes('como chegar') || promptLower.includes('transporte')) {
      return 'Chegar aqui é mais fácil do que parece! O Seu Carlos, que trabalha no aeroporto, sempre orienta os visitantes: "Campo Grande recebe todo mundo de braços abertos". Quer que eu te conte as melhores formas de chegar e se locomover pela cidade?';
    }
    
    // HOSPEDAGEM - Com recomendações locais
    if (promptLower.includes('onde ficar') || promptLower.includes('hotel') || promptLower.includes('pousada')) {
      return 'Aqui tem opção pra todo mundo! A Dona Lúcia, dona de pousada no centro, sempre recebe os hóspedes dizendo: "Aqui você vai se sentir em casa". Quer que eu te conte os melhores lugares pra ficar e viver a experiência campo-grandense?';
    }
    
    // Resposta genérica com personalidade
    return 'Oi! Sou o Guatá, sua capivara guia! Aqui no Mato Grosso do Sul a gente tem histórias pra contar e lugares pra te encantar. Quer que eu te conte sobre nossa gastronomia, nossos destinos ou nossas tradições?';
  }

  private generateAuthenticItinerary(prompt: string): string {
    if (prompt.includes('3 dias') && prompt.includes('campo grande')) {
      return 'Que legal! Vou te mostrar como a gente vive aqui em Campo Grande. Comece pela manhã no Mercadão - a Dona Tereza, que vende sobá há 25 anos, sempre diz: "Quem não prova sobá não conhece Campo Grande". À tarde, vá pro Parque das Nações - é onde a gente se reúne pra tomar tereré. A noite, o pessoal adora a Feira Central. Quer que eu te conte os horários e os melhores cantinhos que só quem mora aqui conhece?';
    }
    
    if (prompt.includes('bonito')) {
      return 'Bonito é nossa joia! A Dona Rosa, que trabalha lá há 15 anos, sempre orienta: "Comece pelo Rio da Prata - é como flutuar no céu". Ela diz que quem vem pra Bonito nunca esquece. Depois tem a Gruta do Lago Azul que é de tirar o fôlego. Quer que eu te conte os segredos que só os moradores conhecem e como aproveitar cada minuto?';
    }
    
    if (prompt.includes('pantanal')) {
      return 'O Pantanal é nossa alma! O Seu João, guia pantaneiro há 30 anos, sempre diz: "Aqui cada dia é uma surpresa". Ele já viu jacarés de 4 metros e ariranhas brincando. O safári é uma experiência única - você vai se encantar com a vida selvagem. Quer que eu te conte as melhores épocas e como viver essa aventura?';
    }
    
    return 'Oi! Posso te ajudar com roteiros incríveis! Aqui no Mato Grosso do Sul a gente tem experiências únicas. Quer conhecer Campo Grande, Bonito, Pantanal ou Corumbá? Me conta quantos dias você tem e eu te mostro como viver a experiência que só quem mora aqui conhece!';
  }

  private generateIntelligentResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    // Análise semântica inteligente para diferentes tipos de pergunta
    if (this.isGreeting(promptLower)) {
      return this.getGreetingResponse();
    }
    
    if (this.isHistoryQuestion(promptLower)) {
      return this.getHistoryResponse(promptLower);
    }
    
    if (this.isTourismQuestion(promptLower)) {
      return this.getTourismResponse(promptLower);
    }
    
    if (this.isFoodQuestion(promptLower)) {
      return this.getFoodResponse(promptLower);
    }
    
    if (this.isNatureQuestion(promptLower)) {
      return this.getNatureResponse(promptLower);
    }
    
    if (this.isCityQuestion(promptLower)) {
      return this.getCityResponse(promptLower);
    }
    
    if (this.isEventQuestion(promptLower)) {
      return this.getEventResponse(promptLower);
    }
    
    if (this.isTransportQuestion(promptLower)) {
      return this.getTransportResponse(promptLower);
    }
    
    if (this.isAccommodationQuestion(promptLower)) {
      return this.getAccommodationResponse(promptLower);
    }
    
    // Resposta inteligente genérica baseada no contexto
    return this.getIntelligentGenericResponse(promptLower);
  }

  private isGreeting(prompt: string): boolean {
    const greetings = ['oi', 'olá', 'ola', 'hello', 'hi', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'eai'];
    return greetings.some(greeting => prompt.includes(greeting)) && prompt.length < 20;
  }

  private isHistoryQuestion(prompt: string): boolean {
    const historyKeywords = ['história', 'historia', 'fundou', 'fundador', 'criou', 'origem', 'nascimento', 'início', 'começo', 'descoberta'];
    return historyKeywords.some(keyword => prompt.includes(keyword));
  }

  private isTourismQuestion(prompt: string): boolean {
    const tourismKeywords = ['turismo', 'visitar', 'atrações', 'passeios', 'lugares', 'pontos turísticos', 'destinos', 'conhecer', 'explorar'];
    return tourismKeywords.some(keyword => prompt.includes(keyword));
  }

  private isFoodQuestion(prompt: string): boolean {
    const foodKeywords = ['comida', 'culinária', 'gastronomia', 'pratos', 'restaurantes', 'comer', 'sabor', 'típico', 'tradicional'];
    return foodKeywords.some(keyword => prompt.includes(keyword));
  }

  private isNatureQuestion(prompt: string): boolean {
    const natureKeywords = ['pantanal', 'bonito', 'natureza', 'ecoturismo', 'cachoeiras', 'rios', 'flora', 'fauna', 'biodiversidade'];
    return natureKeywords.some(keyword => prompt.includes(keyword));
  }

  private isCityQuestion(prompt: string): boolean {
    const cities = ['campo grande', 'corumbá', 'dourados', 'três lagoas', 'naviraí', 'nova andradina', 'pontaporã', 'maracaju'];
    return cities.some(city => prompt.includes(city));
  }

  private isEventQuestion(prompt: string): boolean {
    const eventKeywords = ['eventos', 'festivais', 'festa', 'comemoração', 'celebração', 'tradição', 'cultura', 'dança', 'música'];
    return eventKeywords.some(keyword => prompt.includes(keyword));
  }

  private isTransportQuestion(prompt: string): boolean {
    const transportKeywords = ['como chegar', 'transporte', 'ônibus', 'avião', 'carro', 'distância', 'rota', 'estrada', 'viagem'];
    return transportKeywords.some(keyword => prompt.includes(keyword));
  }

  private isAccommodationQuestion(prompt: string): boolean {
    const accommodationKeywords = ['hospedagem', 'hotel', 'pousada', 'onde ficar', 'acomodação', 'alojamento', 'pernoite'];
    return accommodationKeywords.some(keyword => prompt.includes(keyword));
  }

  private getGreetingResponse(): string {
    const greetings = [
      'Oi! Sou o Guatá, sua capivara guia! Aqui no Mato Grosso do Sul a gente tem histórias pra contar e lugares pra te encantar. Quer que eu te conte sobre nossa gastronomia, nossos destinos ou nossas tradições?',
      'Olá! Sou o Guatá! Aqui no MS a gente vive experiências únicas - desde o tereré geladinho na praça até as águas cristalinas de Bonito. O que você quer descobrir hoje?',
      'Oi! Sou o Guatá, sua capivara simpática! Aqui a gente tem o Mercadão com o melhor sobá, o Pantanal com jacarés gigantes e muito mais. Quer que eu te conte os segredos que só quem mora aqui conhece?'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getHistoryResponse(prompt: string): string {
    if (prompt.includes('campo grande')) {
      return 'Campo Grande foi fundada em 26 de agosto de 1899 por José Antônio Pereira, um pioneiro que chegou à região em busca de terras férteis. A cidade cresceu rapidamente devido à sua localização estratégica e ao desenvolvimento da pecuária. Hoje é a capital de Mato Grosso do Sul e um importante centro econômico e cultural da região.';
    }
    
    if (prompt.includes('mato grosso do sul') || prompt.includes('ms')) {
      return 'Mato Grosso do Sul foi criado em 11 de outubro de 1977, desmembrado de Mato Grosso. O estado tem uma rica história indígena, com povos como os Terena, Guarani e Kadiwéu. A região foi colonizada por bandeirantes e tropeiros, desenvolvendo uma cultura única que mistura tradições indígenas, gaúchas e pantaneiras.';
    }
    
    return 'Mato Grosso do Sul tem uma história fascinante! O estado foi criado em 1977 e possui uma rica herança cultural indígena, com povos como Terena, Guarani e Kadiwéu. A região foi colonizada por bandeirantes e tropeiros, criando uma cultura única que mistura tradições indígenas, gaúchas e pantaneiras.';
  }

  private getTourismResponse(prompt: string): string {
    if (prompt.includes('bonito')) {
      return 'Bonito é um dos destinos mais famosos do Brasil! 🐠 Conhecido por suas águas cristalinas, grutas impressionantes e cachoeiras, oferece experiências únicas como flutuação no Rio da Prata, mergulho na Gruta do Lago Azul e trilhas ecológicas. É perfeito para quem ama natureza e aventura!';
    }
    
    if (prompt.includes('pantanal')) {
      return 'O Pantanal é a maior planície alagável do mundo! 🐊 É o melhor lugar para observar a vida selvagem brasileira, com jacarés, capivaras, ariranhas e centenas de espécies de aves. A melhor época para visitar é de maio a outubro, durante a seca, quando os animais se concentram nas lagoas.';
    }
    
    if (prompt.includes('campo grande')) {
      return 'Campo Grande oferece diversas atrações! 🏛️ Visite o Parque das Nações Indígenas, o Museu da Imagem e do Som, a Feira Central com sua gastronomia típica, o Mercado Municipal e o Memorial da Cultura Indígena. A cidade também é conhecida por eventos como o Festival de Inverno e a Festa de São Francisco.';
    }
    
    return 'Mato Grosso do Sul tem destinos incríveis! 🏞️ Bonito para ecoturismo, Pantanal para observação de vida selvagem, Campo Grande para cultura urbana, Corumbá para história, e muitas outras cidades com suas próprias belezas. O que mais te interessa?';
  }

  private getFoodResponse(_prompt: string): string {
    return 'A culinária de Mato Grosso do Sul é uma delícia! 🍖 Experimente o arroz carreteiro, o churrasco pantaneiro, a sopa paraguaia, o chipa, o tereré gelado e os doces de frutas regionais. Em Campo Grande, não perca a Feira Central para provar pratos típicos, e em Corumbá, experimente os peixes do Pantanal!';
  }

  private getNatureResponse(_prompt: string): string {
    return 'Mato Grosso do Sul é um paraíso natural! 🌿 O Pantanal oferece safáris fotográficos e observação de vida selvagem. Bonito tem águas cristalinas perfeitas para flutuação. O estado também tem cachoeiras, grutas, trilhas ecológicas e uma biodiversidade incrível. É o destino perfeito para ecoturismo!';
  }

  private getCityResponse(prompt: string): string {
    if (prompt.includes('corumbá')) {
      return 'Corumbá é a porta de entrada do Pantanal! 🚢 Conhecida como "Cidade Branca", tem uma rica história e é perfeita para quem quer conhecer o Pantanal. Visite o Forte Coimbra, o Porto Geral e aproveite para fazer safáris fotográficos na região pantaneira.';
    }
    
    if (prompt.includes('dourados')) {
      return 'Dourados é uma cidade importante do MS! 🌾 Conhecida como "Princesa dos Ervais", tem uma forte economia agrícola e uma rica cultura indígena. Visite o Parque dos Ipês, o Museu Histórico e Cultural e aproveite para conhecer as comunidades indígenas da região.';
    }
    
    return 'Mato Grosso do Sul tem cidades incríveis! 🏙️ Cada uma com sua personalidade única - Campo Grande com sua cultura urbana, Corumbá com sua história pantaneira, Dourados com sua tradição indígena, e muitas outras esperando para serem descobertas!';
  }

  private getEventResponse(_prompt: string): string {
    return 'Mato Grosso do Sul tem eventos incríveis! 🎉 O Festival de Inverno de Campo Grande, a Festa de São Francisco em Corumbá, as festas indígenas em Dourados, e muitos outros eventos que celebram nossa rica cultura. Cada cidade tem suas próprias tradições e celebrações únicas!';
  }

  private getTransportResponse(_prompt: string): string {
    return 'Para chegar ao Mato Grosso do Sul, você pode usar avião (Campo Grande tem aeroporto internacional), ônibus (conexões com várias capitais), ou carro (estradas bem sinalizadas). Dentro do estado, há opções de transporte público, aluguel de carros e até passeios organizados para os destinos turísticos!';
  }

  private getAccommodationResponse(_prompt: string): string {
    return 'Mato Grosso do Sul oferece ótimas opções de hospedagem! 🏨 Em Campo Grande, há hotéis de todas as categorias. Em Bonito, pousadas e hotéis-fazenda. No Pantanal, lodges e fazendas de turismo. Em Corumbá, hotéis com vista para o rio. Há opções para todos os gostos e orçamentos!';
  }

  private getIntelligentGenericResponse(_prompt: string): string {
    return 'Olá! Eu sou o Guatá, seu guia inteligente do Mato Grosso do Sul! 🦆 Posso te ajudar com informações sobre destinos turísticos, história, cultura, gastronomia, eventos, hospedagem, transporte e muito mais. Seja específico na sua pergunta que eu te dou uma resposta completa e útil!';
  }

}

export const guataSimpleEdgeService = new GuataSimpleEdgeService();
