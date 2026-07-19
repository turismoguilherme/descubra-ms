// Gemini function declarations for Guatá tools (Phase 1 + Phase 2)
// Format: https://ai.google.dev/gemini-api/docs/function-calling

export const guataToolDeclarations = [
  {
    name: "search_partners",
    description:
      "Busca parceiros comerciais ativos de Mato Grosso do Sul (pousadas, restaurantes, agências, atrativos). Use quando o usuário quiser reservar, comprar ou saber de um serviço específico. Retorna até 5 resultados.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Nome, tipo de serviço ou palavra-chave. Ex.: 'pousada', 'passeio Rio Sucuri', 'restaurante sobá'." },
        city: { type: "string", description: "Cidade em MS (opcional). Ex.: 'Bonito', 'Campo Grande'." },
        business_type: { type: "string", description: "Tipo de negócio (opcional). Ex.: 'hospedagem', 'gastronomia', 'passeio'." },
      },
      required: ["query"],
    },
  },
  {
    name: "check_availability",
    description:
      "Verifica disponibilidade e preço de um parceiro para uma data. Use SOMENTE depois de search_partners para obter o partner_id correto. Não invente IDs.",
    parameters: {
      type: "object",
      properties: {
        partner_id: { type: "string", description: "UUID do parceiro obtido em search_partners." },
        date: { type: "string", description: "Data no formato YYYY-MM-DD." },
        people: { type: "integer", description: "Número de pessoas. Default 1.", minimum: 1 },
      },
      required: ["partner_id", "date"],
    },
  },
  {
    name: "create_event_draft",
    description:
      "Cadastra um evento turístico. Vai para moderação (aprovação admin) — nunca é publicado direto. Só chame após confirmar TODOS os dados em linguagem natural com o usuário e receber um 'sim/confirmo' explícito no turno anterior.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Título do evento." },
        start_date: { type: "string", description: "Data/hora de início ISO 8601 (ex.: 2026-03-20T19:00:00-04:00)." },
        end_date: { type: "string", description: "Data/hora de término ISO 8601 (opcional)." },
        location: { type: "string", description: "Local (endereço ou nome do espaço)." },
        city: { type: "string", description: "Cidade em MS." },
        description: { type: "string", description: "Descrição resumida do evento." },
        category: { type: "string", description: "Categoria (ex.: 'música', 'gastronomia', 'esporte', 'cultura')." },
        organizer: { type: "string", description: "Organizador ou responsável (opcional)." },
        entry_type: { type: "string", description: "'gratuito' ou 'pago' (opcional)." },
        logo_url: { type: "string", description: "URL http(s) da logo/imagem do evento (opcional). Use a URL fornecida quando o usuário anexar uma imagem no chat." },
        promo_video_url: { type: "string", description: "URL http(s) de um vídeo promocional do evento, ex.: YouTube (opcional)." },
      },
      required: ["title", "start_date", "city"],
    },
  },
  {
    name: "create_reservation",
    description:
      "Cria uma reserva vinculada ao usuário logado (status pendente de pagamento). Só chame após search_partners + check_availability e confirmação explícita do usuário. Use service_id (pricing_id) retornado em check_availability.",
    parameters: {
      type: "object",
      properties: {
        partner_id: { type: "string", description: "UUID do parceiro." },
        date: { type: "string", description: "Data YYYY-MM-DD." },
        people: { type: "integer", description: "Número de pessoas.", minimum: 1 },
        service_id: { type: "string", description: "UUID do serviço (pricing_id de check_availability)." },
        reservation_time: { type: "string", description: "Horário HH:MM (opcional)." },
        notes: { type: "string", description: "Pedidos especiais (opcional)." },
      },
      required: ["partner_id", "date", "service_id"],
    },
  },
  {
    name: "create_checkout_link",
    description:
      "Gera link Stripe Checkout para uma reserva já criada (create_reservation). Só chame após create_reservation e confirmação do usuário para pagar.",
    parameters: {
      type: "object",
      properties: {
        reservation_id: { type: "string", description: "UUID da reserva retornado por create_reservation." },
      },
      required: ["reservation_id"],
    },
  },
];
