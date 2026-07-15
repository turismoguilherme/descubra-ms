// Gemini function declarations for Guatá tools (Phase 1: read-only + create_event_draft)
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
      },
      required: ["title", "start_date", "city"],
    },
  },
];
