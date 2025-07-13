// Tipos relacionados ao serviço Guatá IA

export interface GuataUserInfo {
  nome?: string;
  localizacao?: string;
  interesses?: string[];
  tipoViagem?: string;
  duracao?: string;
  orcamento?: string;
  acessibilidade?: string;
  idade?: number;
  viajandoCom?: string;
  origem?: string; // Para compatibilidade
}

export interface GuataResponse {
  resposta: string;
  response: string; // Alias para compatibilidade
  source?: string;
  fontesUtilizadas?: string[];
  sugestoes?: string[];
  localizacoes?: {
    nome: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  }[];
  erro?: string;
}

export interface GuataKnowledge {
  categoria: string;
  titulo: string;
  conteudo: string;
  tags?: string[];
  regiao?: string;
  verificado?: boolean;
}