/**
 * Tipos para Sistema de Eventos Inteligente
 * 
 * FUNCIONALIDADE: Define estrutura completa de eventos
 * SEGURANÇA: Tipos seguros para TypeScript
 */

export interface EventoCompleto {
  // Identificação
  id: string;
  titulo: string;
  descricao_resumida: string;
  descricao_completa: string;
  
  // Datas
  data_inicio: string;
  data_fim?: string;
  horario_inicio?: string;
  horario_fim?: string;
  
  // Localização
  local: string;
  cidade: string;
  estado: string;
  endereco_completo: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  
  // Mídia
  imagem_principal?: string;
  video_promocional?: string; // YouTube/Vimeo URL
  galeria_imagens?: string[];
  
  // Links oficiais
  site_oficial?: string;
  link_inscricao?: string;
  link_ingressos?: string;
  link_redes_sociais?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Categorização
  categoria: 'cultural' | 'esportivo' | 'gastronomico' | 'turismo' | 'oficial' | 'educativo' | 'religioso';
  tipo_entrada: 'gratuito' | 'pago' | 'misto';
  publico_alvo: 'geral' | 'infantil' | 'adulto' | 'idoso' | 'profissional';
  
  // Status
  status: 'ativo' | 'cancelado' | 'adiado' | 'finalizado' | 'rascunho';
  visibilidade: boolean;
  destaque: boolean;
  
  // Organização
  organizador: string;
  contato?: {
    telefone?: string;
    email?: string;
    site?: string;
  };
  
  // Fonte e processamento
  fonte: 'google_search' | 'google_calendar' | 'manual' | 'api_oficial' | 'gemini_ai';
  processado_por_ia: boolean;
  confiabilidade: number; // 0-100
  ultima_atualizacao: string;
  
  // Metadados
  tags?: string[];
  palavras_chave?: string[];
  relevancia: number; // 0-100
}

export interface EventoBusca {
  query: string;
  localizacao?: string;
  data_inicio?: string;
  data_fim?: string;
  categoria?: string;
  limite?: number;
}

export interface EventoProcessamento {
  evento_bruto: any;
  evento_processado: EventoCompleto;
  confianca: number;
  fontes_encontradas: string[];
  melhorias_aplicadas: string[];
}

export interface EventoFiltros {
  cidade?: string;
  categoria?: string;
  data_inicio?: string;
  data_fim?: string;
  tipo_entrada?: string;
  status?: string;
  destaque?: boolean;
}

export interface EventoEstatisticas {
  total_eventos: number;
  eventos_ativos: number;
  eventos_esta_semana: number;
  eventos_este_mes: number;
  categorias_mais_populares: Array<{
    categoria: string;
    quantidade: number;
  }>;
  cidades_mais_ativas: Array<{
    cidade: string;
    quantidade: number;
  }>;
}

