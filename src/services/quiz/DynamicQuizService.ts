// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

// Interface para perguntas do quiz
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  isDynamic?: boolean;
  source?: string;
}

// Interface para controle de uso das APIs
interface APIUsage {
  userId: string;
  date: string;
  geminiCalls: number;
  googleSearchCalls: number;
  lastQuizDate: string;
}

// Limites das APIs gratuitas (com margem de segurança)
const API_LIMITS = {
  GEMINI: {
    DAILY_LIMIT: 10, // 15 RPM com margem de segurança
    TOKENS_PER_DAY: 800000, // 1M com margem de segurança
  },
  GOOGLE_SEARCH: {
    DAILY_LIMIT: 50, // 100 com margem de segurança
  }
};

// Cache de perguntas dinâmicas (24h)
const DYNAMIC_QUESTIONS_CACHE = 'dynamic_quiz_questions';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

class DynamicQuizService {
  private async checkAPIUsage(userId: string): Promise<{ canUseGemini: boolean; canUseGoogle: boolean }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Verificar uso do Gemini
      const { data: geminiUsage } = await supabase
        .from('api_usage')
        .select('gemini_calls')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const geminiCalls = geminiUsage?.gemini_calls || 0;
      const canUseGemini = geminiCalls < API_LIMITS.GEMINI.DAILY_LIMIT;

      // Verificar uso do Google Search
      const { data: googleUsage } = await supabase
        .from('api_usage')
        .select('google_search_calls')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const googleCalls = googleUsage?.google_search_calls || 0;
      const canUseGoogle = googleCalls < API_LIMITS.GOOGLE_SEARCH.DAILY_LIMIT;

      return { canUseGemini, canUseGoogle };
    } catch (error) {
      console.error('Erro ao verificar uso das APIs:', error);
      return { canUseGemini: false, canUseGoogle: false };
    }
  }

  private async updateAPIUsage(userId: string, geminiCalls: number = 0, googleCalls: number = 0): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('api_usage')
        .upsert({
          user_id: userId,
          date: today,
          gemini_calls: geminiCalls,
          google_search_calls: googleCalls,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erro ao atualizar uso das APIs:', error);
    }
  }

  private async getCachedDynamicQuestions(): Promise<QuizQuestion[]> {
    try {
      const cached = localStorage.getItem(DYNAMIC_QUESTIONS_CACHE);
      if (cached) {
        const { questions, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Verificar se o cache ainda é válido (24h)
        if (now - timestamp < CACHE_DURATION) {
          return questions;
        }
      }
      return [];
    } catch (error) {
      console.error('Erro ao ler cache:', error);
      return [];
    }
  }

  private async setCachedDynamicQuestions(questions: QuizQuestion[]): Promise<void> {
    try {
      const cacheData = {
        questions,
        timestamp: Date.now()
      };
      localStorage.setItem(DYNAMIC_QUESTIONS_CACHE, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
    }
  }

  private async searchMSInfo(): Promise<string> {
    try {
      // Temas educativos específicos para MS
      const educationalTopics = [
        'CADASTUR Mato Grosso do Sul turismo regulamentação 2024',
        'MS eventos turísticos festivais cultura 2024',
        'MS destinos emergentes turismo rural 2024',
        'MS políticas públicas turismo sustentável 2024',
        'MS gastronomia regional culinária tradicional 2024',
        'MS tradições indígenas cultura preservação 2024',
        'MS projetos conservação meio ambiente 2024',
        'MS economia verde sustentabilidade 2024',
        'MS patrimônio histórico cultural 2024',
        'MS mudanças climáticas impacto turismo 2024'
      ];
      
      const randomTopic = educationalTopics[Math.floor(Math.random() * educationalTopics.length)];
      console.log('🔍 Buscando informações sobre:', randomTopic);
      
      // Simular pesquisa do Google Search (implementar com API real)
      // Em produção, integrar com Google Search API
      const mockInfo = `
        Informações educativas sobre ${randomTopic}: 
        Mato Grosso do Sul possui uma rica diversidade cultural e natural. 
        O estado investe em turismo sustentável, preservação do patrimônio cultural 
        e desenvolvimento de políticas públicas que promovem o crescimento econômico 
        aliado à conservação ambiental. A regulamentação através do CADASTUR e outros 
        mecanismos garante a qualidade dos serviços turísticos oferecidos.
      `;
      
      return mockInfo;
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      return '';
    }
  }

  private async generateQuestionsWithGemini(info: string): Promise<QuizQuestion[]> {
    try {
      // Simular geração com Gemini (implementar com API real)
      // Por enquanto, retornar perguntas mockadas baseadas na informação
      const mockQuestions: QuizQuestion[] = [
        {
          id: `dynamic_${Date.now()}_1`,
          question: 'O que é CADASTUR e qual sua importância para o turismo em MS?',
          options: [
            'Apenas um cadastro de hotéis',
            'Sistema nacional de cadastro de prestadores de serviços turísticos',
            'Só para guias turísticos',
            'Não tem importância'
          ],
          correctAnswer: 1,
          explanation: 'CADASTUR é o Cadastro de Prestadores de Serviços Turísticos, essencial para regularizar e profissionalizar o setor turístico em MS, garantindo qualidade e segurança aos turistas.',
          category: 'Regulamentação Turística',
          isDynamic: true,
          source: 'Gemini AI + Google Search'
        },
        {
          id: `dynamic_${Date.now()}_2`,
          question: 'Como os eventos culturais contribuem para o turismo em MS?',
          options: [
            'Apenas para entretenimento local',
            'Atraem turistas, preservam cultura e geram renda',
            'Só beneficiam grandes cidades',
            'Não têm impacto no turismo'
          ],
          correctAnswer: 1,
          explanation: 'Os eventos culturais em MS atraem turistas, preservam tradições locais, geram renda para comunidades e promovem a identidade cultural do estado.',
          category: 'Turismo Cultural',
          isDynamic: true,
          source: 'Gemini AI + Google Search'
        }
      ];
      
      return mockQuestions;
    } catch (error) {
      console.error('Erro ao gerar perguntas:', error);
      return [];
    }
  }

  // Perguntas fixas (sempre disponíveis)
  private getFixedQuestions(): QuizQuestion[] {
    return [
      {
        id: 'fixed_1',
        question: 'O que é um turismólogo e qual sua importância para MS?',
        options: [
          'Apenas um guia turístico',
          'Profissional que planeja e desenvolve o turismo sustentável',
          'Só trabalha com hotéis',
          'Não tem importância'
        ],
        correctAnswer: 1,
        explanation: 'O turismólogo é o profissional que estuda o turismo como fenômeno social e econômico, planeja destinos turísticos e promove o turismo sustentável, essencial para o desenvolvimento de MS.',
        category: 'Turismo',
        isDynamic: false
      },
      {
        id: 'fixed_2',
        question: 'Qual é o principal bioma de Mato Grosso do Sul?',
        options: [
          'Apenas Pantanal',
          'Pantanal e Cerrado',
          'Só Cerrado',
          'Amazônia'
        ],
        correctAnswer: 1,
        explanation: 'MS abriga principalmente o Pantanal e o Cerrado, dois biomas de extrema importância para a biodiversidade brasileira e o ecoturismo.',
        category: 'Biodiversidade',
        isDynamic: false
      },
      {
        id: 'fixed_3',
        question: 'Como o turismo sustentável contribui para MS?',
        options: [
          'Apenas gera renda',
          'Preserva cultura, gera renda e protege meio ambiente',
          'Só beneficia grandes empresas',
          'Não tem impacto positivo'
        ],
        correctAnswer: 1,
        explanation: 'O turismo sustentável em MS preserva a cultura local, gera renda para comunidades e protege o meio ambiente, sendo fundamental para o desenvolvimento do estado.',
        category: 'Turismo Sustentável',
        isDynamic: false
      }
    ];
  }

  // Perguntas dinâmicas mockadas (sempre disponíveis)
  private getMockDynamicQuestions(): QuizQuestion[] {
    const educationalQuestions = [
      {
        id: 'mock_1',
        question: 'O que é CADASTUR e por que é importante para o turismo em MS?',
        options: [
          'Apenas um cadastro de hotéis',
          'Sistema nacional de cadastro de prestadores de serviços turísticos',
          'Só para guias turísticos',
          'Não tem importância'
        ],
        correctAnswer: 1,
        explanation: 'CADASTUR é o Cadastro de Prestadores de Serviços Turísticos, essencial para regularizar e profissionalizar o setor turístico em MS, garantindo qualidade e segurança aos turistas.',
        category: 'Regulamentação Turística',
        isDynamic: true,
        source: 'Sistema Educativo'
      },
      {
        id: 'mock_2',
        question: 'Como os eventos culturais contribuem para o turismo em MS?',
        options: [
          'Apenas para entretenimento local',
          'Atraem turistas, preservam cultura e geram renda',
          'Só beneficiam grandes cidades',
          'Não têm impacto no turismo'
        ],
        correctAnswer: 1,
        explanation: 'Os eventos culturais em MS atraem turistas, preservam tradições locais, geram renda para comunidades e promovem a identidade cultural do estado.',
        category: 'Turismo Cultural',
        isDynamic: true,
        source: 'Sistema Educativo'
      },
      {
        id: 'mock_3',
        question: 'Qual é a importância da gastronomia regional para o turismo em MS?',
        options: [
          'Apenas para alimentar turistas',
          'Preserva tradições, atrai visitantes e gera renda local',
          'Só beneficia restaurantes grandes',
          'Não tem importância'
        ],
        correctAnswer: 1,
        explanation: 'A gastronomia regional em MS preserva tradições culinárias, atrai turistas interessados em experiências autênticas e gera renda para produtores locais.',
        category: 'Gastronomia Regional',
        isDynamic: true,
        source: 'Sistema Educativo'
      },
      {
        id: 'mock_4',
        question: 'Como o turismo rural contribui para o desenvolvimento sustentável em MS?',
        options: [
          'Apenas gera renda para fazendeiros',
          'Promove conservação, gera renda local e preserva tradições',
          'Só beneficia grandes propriedades',
          'Não tem impacto positivo'
        ],
        correctAnswer: 1,
        explanation: 'O turismo rural em MS promove a conservação ambiental, gera renda para comunidades locais e preserva tradições culturais, contribuindo para o desenvolvimento sustentável.',
        category: 'Turismo Rural',
        isDynamic: true,
        source: 'Sistema Educativo'
      }
    ];

    // Retornar 2 perguntas aleatórias
    const shuffled = educationalQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }

  public async generateHybridQuiz(userId: string): Promise<QuizQuestion[]> {
    try {
      // 1. Sempre incluir perguntas fixas (3)
      const fixedQuestions = this.getFixedQuestions();
      
      // 2. Tentar usar cache primeiro
      const cachedQuestions = await this.getCachedDynamicQuestions();
      if (cachedQuestions.length >= 2) {
        return [...fixedQuestions, ...cachedQuestions.slice(0, 2)];
      }

      // 3. Tentar gerar perguntas dinâmicas com APIs
      try {
        const searchInfo = await this.searchMSInfo();
        if (searchInfo) {
          const dynamicQuestions = await this.generateQuestionsWithGemini(searchInfo);
          if (dynamicQuestions.length > 0) {
            await this.setCachedDynamicQuestions(dynamicQuestions);
            return [...fixedQuestions, ...dynamicQuestions.slice(0, 2)];
          }
        }
      } catch (apiError) {
        console.log('APIs não disponíveis, usando perguntas mockadas:', apiError);
      }

      // 4. Fallback para perguntas mockadas
      const mockQuestions = this.getMockDynamicQuestions();
      return [...fixedQuestions, ...mockQuestions];

    } catch (error) {
      console.error('Erro ao gerar quiz híbrido:', error);
      // Fallback final para perguntas fixas
      return this.getFixedQuestions();
    }
  }

  // Método para verificar status das APIs (simplificado)
  public async getAPIStatus(userId: string): Promise<{
    gemini: { used: number; limit: number; available: boolean };
    google: { used: number; limit: number; available: boolean };
  }> {
    return {
      gemini: { used: 0, limit: 10, available: true },
      google: { used: 0, limit: 10, available: true }
    };
  }

}

export default new DynamicQuizService();
