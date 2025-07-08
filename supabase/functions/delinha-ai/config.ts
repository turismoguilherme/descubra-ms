
// Configuration settings and shared constants for Delinha AI

// OpenAI API key from environment variables
export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// List of official tourism sources
export const officialTourismSources = [
  { url: "www.gov.br/turismo", description: "Ministério do Turismo" },
  { url: "www.embratur.gov.br", description: "Agência Brasileira de Promoção Internacional do Turismo" },
  { url: "www.brasil-turismo.com", description: "Portal de Turismo do Brasil" },
  { url: "www.visitbrasil.com", description: "Portal Oficial de Turismo do Brasil" },
  { url: "www.unwto.org", description: "Organização Mundial do Turismo" },
  { url: "www.wttc.org", description: "Conselho Mundial de Viagens e Turismo" },
  { url: "www.turismo.ms.gov.br", description: "Turismo de Mato Grosso do Sul" },
  { url: "www.visitms.com.br", description: "Portal de Turismo do MS" },
  { url: "www.turismo.bonito.ms.gov.br", description: "Turismo de Bonito" },
  { url: "www.campogrande.ms.gov.br/sectur", description: "Secretaria de Turismo de Campo Grande" },
  { url: "www.corumba.ms.gov.br/turismo", description: "Turismo de Corumbá" },
  { url: "www.rioverde.ms.gov.br", description: "Prefeitura de Rio Verde" },
  { url: "www.dourados.ms.gov.br", description: "Prefeitura de Dourados" },
  { url: "www.treslagoas.ms.gov.br", description: "Prefeitura de Três Lagoas" },
  { url: "www.pontapora.ms.gov.br", description: "Prefeitura de Ponta Porã" },
  { url: "bonitoecotour.com", description: "Guia de Ecoturismo de Bonito" },
  { url: "www.bonitoway.com.br", description: "Agência de Turismo de Bonito" },
  { url: "www.lonelyplanet.com", description: "Guia de Viagens Internacional" },
  { url: "www.tripadvisor.com", description: "Plataforma de Avaliações de Turismo" },
  { url: "www.expedia.com", description: "Portal de Reservas de Viagens" },
];

// OpenAI models and settings
export const AI_CONFIG = {
  model: "gpt-4o-mini",
  temperature: 0.9,
  maxTokens: 800
};
