import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para gerar resposta local inteligente
function generateLocalResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Apresentação
  if (lowerPrompt.includes('oi') || lowerPrompt.includes('olá') || lowerPrompt.includes('quem é') || lowerPrompt.includes('você é')) {
    return `Olá! Eu sou o Guatá, sua capivara guia de turismo de Mato Grosso do Sul! 🦦 Estou aqui para te ajudar a descobrir as maravilhas do nosso estado. Posso te contar sobre destinos incríveis como Bonito, o Pantanal, Campo Grande e muito mais. O que você gostaria de saber?`;
  }

  // Bonito
  if (lowerPrompt.includes('bonito')) {
    return `Bonito é mundialmente reconhecida como a Capital do Ecoturismo! 🌊 É um lugar mágico com águas cristalinas que parecem de outro mundo. As principais atrações são o Rio Sucuri, Gruta do Lago Azul, Gruta da Anhumas, Buraco das Araras e Rio da Prata. Cada lugar tem sua própria magia! Quer saber mais sobre algum passeio específico?`;
  }

  // Pantanal
  if (lowerPrompt.includes('pantanal')) {
    return `O Pantanal é um santuário ecológico, a maior área úmida contínua do planeta! 🐊 É um lugar de biodiversidade incrível, perfeito para quem ama a natureza e quer ver de perto jacarés, capivaras, aves e, com sorte, até onças-pintadas. A melhor época para visitar é na estação seca (maio a setembro) para observação da vida selvagem.`;
  }

  // Campo Grande
  if (lowerPrompt.includes('campo grande') || lowerPrompt.includes('capital')) {
    return `Campo Grande é nossa capital, conhecida como "Cidade Morena"! 🏙️ É um lugar cheio de história e cultura. As principais atrações são a Feira Central (que é um espetáculo à parte), Parque das Nações Indígenas, Memorial da Cultura Indígena, Mercadão Municipal e Praça do Rádio. Tem muita coisa legal para fazer!`;
  }

  // Corumbá
  if (lowerPrompt.includes('corumbá') || lowerPrompt.includes('corguinho') || lowerPrompt.includes('corumba')) {
    return `Corumbá é uma cidade histórica e estratégica de Mato Grosso do Sul! 🏛️ Conhecida como "Capital do Pantanal", é um dos principais portos fluviais do Brasil. As principais atrações são o Forte Coimbra, Porto Geral, Casa do Artesão, Museu de História do Pantanal, e é o ponto de partida para muitos passeios no Pantanal. A cidade tem uma rica história e é perfeita para quem quer conhecer a cultura pantaneira!`;
  }

  // Gastronomia
  if (lowerPrompt.includes('comida') || lowerPrompt.includes('gastronomia') || lowerPrompt.includes('culinária') || lowerPrompt.includes('tereré') || lowerPrompt.includes('sopa paraguaia')) {
    return `A culinária de Mato Grosso do Sul é uma delícia! 🍽️ Você não pode deixar de provar a sopa paraguaia (que é um bolo salgado!), o sobá (herança da imigração japonesa), a chipa, o espetinho e, claro, o tereré, nossa bebida tradicional. É uma mistura de sabores que reflete nossa cultura!`;
  }

  // Rota Bioceânica
  if (lowerPrompt.includes('rota bioceânica') || lowerPrompt.includes('bioceanica')) {
    return `A Rota Bioceânica é um projeto de integração rodoviária que conecta o Brasil ao Chile, passando por Mato Grosso do Sul, Paraguai e Argentina. É uma rota estratégica que visa facilitar o comércio, o turismo e a integração cultural entre os países da América do Sul, ligando o Oceano Atlântico ao Pacífico. Para MS, significa um grande potencial de desenvolvimento e novas oportunidades!`;
  }

  // Roteiros/Planejamento
  if (lowerPrompt.includes('roteiro') || lowerPrompt.includes('planejar') || lowerPrompt.includes('passeios') || lowerPrompt.includes('viagem')) {
    return `Que legal que você quer planejar uma viagem! 🗺️ Posso te ajudar a montar roteiros incríveis. Temos destinos únicos como Bonito para ecoturismo, Pantanal para vida selvagem, Campo Grande para cultura urbana, e Corumbá para história. Quantos dias você tem disponível? Qual tipo de experiência te interessa mais?`;
  }

  // Eventos
  if (lowerPrompt.includes('evento') || lowerPrompt.includes('festa') || lowerPrompt.includes('agenda')) {
    return `Mato Grosso do Sul tem eventos incríveis durante todo o ano! 🎉 Temos festivais de música, eventos gastronômicos, festas tradicionais e muito mais. Posso te ajudar a encontrar eventos que acontecem na época da sua visita. Que tipo de evento te interessa?`;
  }

  // Ajuda geral
  if (lowerPrompt.includes('ajuda') || lowerPrompt.includes('help') || lowerPrompt.includes('o que você pode')) {
    return `Posso te ajudar com várias coisas! 🤝 Posso falar sobre destinos turísticos, gastronomia, eventos, cultura, roteiros de viagem, história do estado e muito mais. Sobre o que você gostaria de saber?`;
  }

  // Resposta padrão inteligente
  return `Que pergunta interessante! 🤔 Posso te ajudar com informações sobre destinos, gastronomia, eventos e cultura de Mato Grosso do Sul. Temos lugares incríveis como Bonito, Pantanal, Campo Grande, Corumbá e muito mais. Sobre o que você gostaria de saber mais especificamente?`;
}

serve(async (req) => {
  console.log("🔵 guata-ai: request received", { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body with error handling
    let body;
    try {
      const raw = await req.text();
      if (!raw) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      body = JSON.parse(raw);
    } catch (parseError) {
      console.error('❌ guata-ai: JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid prompt field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🔵 guata-ai: processing prompt:", prompt.slice(0, 100));

    // Simple ping test
    if (prompt === "ping") {
      return new Response(
        JSON.stringify({ response: "pong" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Always use local intelligent response for now
    console.log('🔄 guata-ai: Using local intelligent response');
    const localResponse = generateLocalResponse(prompt);
    
    return new Response(
      JSON.stringify({ response: localResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ guata-ai: handler error:', { message: error?.message, stack: error?.stack });
    return new Response(
      JSON.stringify({
        error: 'Erro interno do servidor',
        details: error?.message || String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

