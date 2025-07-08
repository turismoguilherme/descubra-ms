
export interface AIRecommendationsProps {
  region: string;
}

export interface Conversation {
  id: string;
  question: string;
  answer: string;
}

// Dados oficiais simulados
export const dadosOficiais = {
  "campo-grande": {
    mercadoMunicipal: "15% dos check-ins em Campo Grande, segundo o app",
    gastronomia: "20% dos usuários do app têm interesse em Gastronomia",
    visitantes: "Aumento de 12% em relação ao mês anterior"
  },
  "pantanal": {
    natureza: "65% dos turistas têm interesse em Natureza",
    spaulo: "40% dos visitantes desta região são de São Paulo",
    ecoturismo: "85% dos turistas buscam experiências de ecoturismo sustentável"
  },
  "bonito-serra-da-bodoquena": {
    natureza: "70% dos turistas têm interesse em Natureza",
    aventura: "50% buscam atividades de aventura",
    transportes: "25% dos comentários mencionam dificuldade de locomoção entre atrativos"
  },
  "caminhos-dos-ipes": {
    cultura: "35% dos turistas buscam eventos culturais",
    artesanato: "40% demonstram interesse em artesanato regional",
    hospedagem: "Taxa de ocupação média de 62% nos últimos 3 meses"
  }
};
