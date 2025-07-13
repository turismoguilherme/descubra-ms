
import { KnowledgeItem } from "@/types/ai";

// Base de conhecimento inicial do Guatá
export const getInitialKnowledgeBase = (): KnowledgeItem[] => [
  {
    id: "bonito",
    title: "Bonito",
    content: "Bonito é um dos principais destinos ecoturísticos do Brasil, conhecido por suas águas cristalinas, grutas e rica biodiversidade. Os passeios devem ser agendados com antecedência através de agências credenciadas.",
    category: "destinos",
    source: "Fundtur-MS",
    lastUpdated: "2025-05-01"
  },
  {
    id: "pantanal",
    title: "Pantanal",
    content: "O Pantanal é a maior planície alagável do planeta e abriga uma impressionante biodiversidade. A melhor época para visita é durante a seca (maio a setembro) quando a observação de animais é facilitada.",
    category: "destinos",
    source: "SETESC",
    lastUpdated: "2025-05-02"
  },
  {
    id: "documentos",
    title: "Documentação necessária",
    content: "Para brasileiros, é necessário documento oficial com foto (RG ou CNH) para hospedagem e alguns atrativos. Para estrangeiros, passaporte válido. Para países do Mercosul, é aceito o documento de identidade do país de origem.",
    category: "informações",
    source: "MTur",
    lastUpdated: "2025-04-15"
  },
  {
    id: "gastronomia",
    title: "Gastronomia de MS",
    content: "A culinária sul-mato-grossense mistura influências paraguaias, bolivianas e indígenas. Pratos típicos incluem o sobá (macarrão japonês adaptado), chipa (pão de queijo paraguaio), e o tradicional churrasco pantaneiro. O tereré (erva-mate gelada) é a bebida típica do estado.",
    category: "gastronomia",
    source: "Secretaria de Cultura e Turismo de MS",
    lastUpdated: "2025-03-20"
  },
  {
    id: "corumba",
    title: "Corumbá",
    content: "Conhecida como a Capital do Pantanal, Corumbá é porta de entrada para o bioma e oferece passeios de barco pelo Rio Paraguai, observação de fauna e pesca esportiva. A cidade tem forte influência boliviana e preserva casarões históricos do período do ciclo da borracha.",
    category: "destinos",
    source: "Prefeitura de Corumbá",
    lastUpdated: "2025-04-10"
  },
  {
    id: "trem-do-pantanal",
    title: "Trem do Pantanal",
    content: "O passeio de trem entre Campo Grande e Miranda é uma experiência única que permite conhecer paisagens deslumbrantes do Pantanal. O percurso de 220 km atravessa fazendas históricas e áreas de conservação, com paradas interpretativas.",
    category: "atrações",
    source: "Fundtur-MS",
    lastUpdated: "2025-04-22"
  },
  {
    id: "festival-de-inverno-de-bonito",
    title: "Festival de Inverno de Bonito",
    content: "Realizado anualmente em julho, o Festival de Inverno de Bonito é um dos maiores eventos culturais do estado, reunindo shows musicais, exposições de arte, oficinas culturais e gastronomia. O festival tem foco em sustentabilidade e na valorização da cultura regional.",
    category: "eventos",
    source: "Secretaria de Cultura e Turismo de MS",
    lastUpdated: "2025-04-05"
  },
  {
    id: "rota-bioceânica",
    title: "Rota Bioceânica",
    content: "A Rota Bioceânica é um corredor rodoviário que ligará os oceanos Atlântico e Pacífico, passando pelo Brasil, Paraguai, Argentina e Chile. No MS, a rota promete impulsionar o turismo e o desenvolvimento econômico, especialmente na região de Porto Murtinho.",
    category: "informações",
    source: "Governo do Estado de MS",
    lastUpdated: "2025-04-18"
  }
];

export const getDefaultUserInfo = () => ({
  origem: "São Paulo",
  interesses: ["Natureza", "Aventura", "Gastronomia"],
  visitouAnteriormente: false
});
