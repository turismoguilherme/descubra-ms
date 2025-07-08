
import { OfficialInformation } from "../types/CATSupportTypes";

// Knowledge base with official tourism information
export const officialInformation: OfficialInformation = {
  "bonito": {
    title: "Bonito",
    content: "Bonito é um dos principais destinos ecoturísticos do Brasil, conhecido por suas águas cristalinas, grutas e rica biodiversidade. Os passeios devem ser agendados com antecedência através de agências credenciadas.",
    attractions: ["Gruta do Lago Azul", "Rio da Prata", "Abismo Anhumas", "Parque Ecológico Rio Formoso"],
    fees: "A entrada na cidade é gratuita, mas cada atrativo tem sua própria tarifa. Os valores variam entre R$30 e R$350 dependendo do passeio.",
    source: "Fundtur-MS"
  },
  "pantanal": {
    title: "Pantanal",
    content: "O Pantanal é a maior planície alagável do planeta e abriga uma impressionante biodiversidade. A melhor época para visita é durante a seca (maio a setembro) quando a observação de animais é facilitada.",
    regions: ["Pantanal Norte (MT)", "Pantanal Sul (MS)"],
    access: "Principais acessos por Corumbá, Miranda e Aquidauana. É necessário contratar pousadas ou guias locais para acessar as áreas mais remotas.",
    source: "SETESC"
  },
  "documentos": {
    title: "Documentação necessária",
    content: "Para brasileiros, é necessário documento oficial com foto (RG ou CNH) para hospedagem e alguns atrativos. Para estrangeiros, passaporte válido. Para países do Mercosul, é aceito o documento de identidade do país de origem.",
    source: "MTur"
  },
  "transporte": {
    title: "Transporte",
    content: "Campo Grande possui aeroporto internacional. Bonito tem aeroporto regional com voos limitados. Para deslocamento entre cidades, há opções de ônibus intermunicipais ou aluguel de veículos. Dentro das cidades turísticas, recomenda-se táxi ou transporte por aplicativo.",
    source: "Prefeitura de Campo Grande"
  },
  "hospedagem": {
    title: "Hospedagem",
    content: "O estado oferece opções de hospedagem para todos os perfis - desde hotéis de luxo a pousadas e hostels. Nas cidades de maior fluxo turístico como Bonito e Corumbá, é essencial reservar com antecedência, especialmente em alta temporada (dezembro a março e julho).",
    source: "Cadastur"
  }
};
