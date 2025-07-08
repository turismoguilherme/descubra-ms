
// Tourism data sources for the CAT Support AI
export const dataSources = [
  { id: 1, name: "Fundtur-MS", url: "https://www.turismo.ms.gov.br" },
  { id: 2, name: "MTur", url: "https://www.gov.br/turismo" },
  { id: 3, name: "EMBRATUR", url: "https://www.embratur.com.br" },
  { id: 4, name: "SETESC", url: "https://www.setesc.ms.gov.br" },
  { id: 5, name: "Prefeitura de Campo Grande", url: "https://www.campogrande.ms.gov.br" },
  { id: 6, name: "Alumia", url: "https://alumia.tur.br" },
  { id: 7, name: "Dados de Usuários", url: "interno" }
];

// Tourism data sources formatted for display in reports
export const dataSourcesFormatted = {
  "fundtur-ms": "Fundtur-MS",
  "cadastur": "Cadastur",
  "alumia": "Alumia (Futura Integração)",
  "secretarias": "Secretarias",
  "eventos": "Eventos",
  "manual": "Manual",
  "supabase": "Banco de Dados",
  "mockado": "Dados Provisórios",
  "interno": "Usuários do App",
  "simulação": "Dados Simulados"
};

// Tourism data priorities (highest to lowest)
export const dataSourcePriority = [
  "interno",    // First priority - App user registrations (currently active)
  "fundtur-ms", // Second priority - Official tourism bureau
  "cadastur",   // Third priority - Official registration system
  "secretarias",// Fourth priority - Government secretariats
  "supabase",   // Fifth priority - Database records
  "manual",     // Sixth priority - Manually entered
  "alumia",     // Seventh priority - Alumia platform (future integration)
  "mockado"     // Lowest priority - Mock data (only used if nothing else is available)
];
