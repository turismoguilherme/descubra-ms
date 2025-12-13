import { supabase } from '@/integrations/supabase/client';
import { geminiClient } from '@/config/gemini';

/**
 * Helper para tentar renovar o token e retentar a operação
 */
async function retryWithTokenRefresh<T>(
  operation: () => Promise<T>,
  retries = 1
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Se for erro de JWT expirado e ainda tiver tentativas
    if ((error.code === 'PGRST301' || error.message?.includes('JWT expired')) && retries > 0) {
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          throw error; // Se não conseguir renovar, propagar erro original
        }
        
        // Aguardar um pouco para garantir que o token foi atualizado
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Retentar a operação
        return await operation();
      } catch (refreshErr) {
        throw error; // Se falhar, propagar erro original
      }
    }
    throw error;
  }
}

export interface HealthCheckResult {
  service_name: string;
  service_type: 'database' | 'auth' | 'storage' | 'api' | 'email' | 'cdn' | 'other';
  status: 'online' | 'slow' | 'offline' | 'checking';
  latency_ms: number;
  response_data?: any;
  error_message?: string;
}

export interface SystemAlert {
  id: string;
  service_name: string;
  alert_type: 'error' | 'warning' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface AlertConfig {
  email_enabled: boolean;
  email_address?: string;
  whatsapp_enabled: boolean;
  whatsapp_number?: string;
  downtime_alerts: boolean;
  slow_response_alerts: boolean;
  error_alerts: boolean;
}

export const systemHealthService = {
  /**
   * Verifica se as políticas RLS estão corretas
   * Retorna true se as políticas estão corretas, false caso contrário
   */
  async checkRLSPolicies(): Promise<{ correct: boolean; message?: string }> {
    try {
      // Tentar fazer uma query simples para verificar se as políticas permitem acesso
      const { data, error } = await supabase
        .from('system_health_checks')
        .select('id')
        .limit(1);

      // Se conseguir ler, as políticas podem estar corretas (ou RLS está desabilitado)
      if (!error) {
        return { correct: true };
      }

      // Se for erro 401 e a mensagem indicar problema de políticas, as políticas estão incorretas
      if (error.code === 'PGRST301' || error.message?.includes('JWT expired')) {
        // Tentar renovar token primeiro
        try {
          await supabase.auth.refreshSession();
          // Tentar novamente após renovar
          const { error: retryError } = await supabase
            .from('system_health_checks')
            .select('id')
            .limit(1);
          
          if (!retryError) {
            return { correct: true };
          }
        } catch (refreshError) {
          // Ignorar erro de refresh
        }
      }

      // Se for erro de permissão (não JWT expired), pode ser políticas incorretas
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        return {
          correct: false,
          message: 'Políticas RLS podem estar incorretas. Execute a migration de correção no Supabase Dashboard.'
        };
      }

      // Se for erro 401 mas não JWT expired, pode ser políticas
      if (error.code === 'PGRST301') {
        return {
          correct: false,
          message: 'JWT expirado ou políticas RLS incorretas. Tente fazer logout e login novamente, ou execute a migration de correção.'
        };
      }

      return { correct: true }; // Se não conseguir determinar, assumir que está ok
    } catch (error) {
      return {
        correct: false,
        message: 'Erro ao verificar políticas RLS'
      };
    }
  },

  /**
   * Verifica o status do banco de dados
   */
  async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { error } = await supabase.from('user_profiles').select('id').limit(1);
      const latency = Date.now() - start;
      return {
        service_name: 'Banco de Dados (Supabase)',
        service_type: 'database',
        status: error ? 'offline' : latency > 500 ? 'slow' : 'online',
        latency_ms: latency,
        error_message: error?.message,
      };
    } catch (error: any) {
      return {
        service_name: 'Banco de Dados (Supabase)',
        service_type: 'database',
        status: 'offline',
        latency_ms: Date.now() - start,
        error_message: error.message,
      };
    }
  },

  /**
   * Verifica o status da autenticação
   */
  async checkAuth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await supabase.auth.getSession();
      const latency = Date.now() - start;
      return {
        service_name: 'Autenticação',
        service_type: 'auth',
        status: latency > 500 ? 'slow' : 'online',
        latency_ms: latency,
      };
    } catch (error: any) {
      return {
        service_name: 'Autenticação',
        service_type: 'auth',
        status: 'offline',
        latency_ms: Date.now() - start,
        error_message: error.message,
      };
    }
  },

  /**
   * Verifica o status do storage
   */
  async checkStorage(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { error } = await supabase.storage.listBuckets();
      const latency = Date.now() - start;
      return {
        service_name: 'Storage de Arquivos',
        service_type: 'storage',
        status: error ? 'offline' : latency > 500 ? 'slow' : 'online',
        latency_ms: latency,
        error_message: error?.message,
      };
    } catch (error: any) {
      return {
        service_name: 'Storage de Arquivos',
        service_type: 'storage',
        status: 'offline',
        latency_ms: Date.now() - start,
        error_message: error.message,
      };
    }
  },

  /**
   * Verifica o status da API Gemini
   */
  async checkGeminiAPI(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      // Verificar se a API key está configurada
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return {
          service_name: 'API Gemini (IA)',
          service_type: 'api',
          status: 'offline',
          latency_ms: Date.now() - start,
          error_message: 'API key não configurada',
        };
      }

      // Verificar se a Edge Function está disponível (mais leve que chamar a API diretamente)
      try {
        const { error } = await supabase.functions.invoke('guata-gemini-proxy', {
          body: {
            prompt: 'health check',
            model: 'gemini-1.5-flash',
            temperature: 0.3,
            maxOutputTokens: 10
          },
        });

        const latency = Date.now() - start;
        
        // Se retornar erro de validação ou rate limit, significa que a função está funcionando
        const isAvailable = !error || 
          error.message?.includes('prompt') || 
          error.message?.includes('rate limit') ||
          error.message?.includes('invalid');

        return {
          service_name: 'API Gemini (IA)',
          service_type: 'api',
          status: isAvailable ? (latency > 2000 ? 'slow' : 'online') : 'offline',
          latency_ms: latency,
          response_data: { method: 'edge_function' },
          error_message: isAvailable ? undefined : error?.message,
        };
      } catch (edgeError: any) {
        // Se Edge Function não disponível, verificar se o cliente está configurado
        const latency = Date.now() - start;
        return {
          service_name: 'API Gemini (IA)',
          service_type: 'api',
          status: 'slow',
          latency_ms: latency,
          error_message: 'Edge Function não disponível, usando cliente direto',
        };
      }
    } catch (error: any) {
      return {
        service_name: 'API Gemini (IA)',
        service_type: 'api',
        status: 'offline',
        latency_ms: Date.now() - start,
        error_message: error.message,
      };
    }
  },

  /**
   * Verifica o status do serviço de Email
   */
  async checkEmailService(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      // Verificar se a Edge Function está disponível fazendo uma chamada de health check
      // Não enviamos email real, apenas verificamos se a função responde
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'welcome',
          to: 'health-check@test.local',
          data: {},
        },
      });

      const latency = Date.now() - start;
      
      // Se retornar erro de validação de email ou campos obrigatórios, significa que a função está funcionando
      // Se retornar erro de configuração (RESEND_API_KEY), também significa que está funcionando mas não configurado
      const isAvailable = !error || 
        error.message?.includes('email') || 
        error.message?.includes('to') || 
        error.message?.includes('type') ||
        error.message?.includes('RESEND') ||
        error.message?.includes('SENDGRID');
      
      return {
        service_name: 'Serviço de Email',
        service_type: 'email',
        status: isAvailable ? (latency > 1000 ? 'slow' : 'online') : 'offline',
        latency_ms: latency,
        error_message: isAvailable ? undefined : error?.message,
        response_data: { 
          available: isAvailable,
          note: isAvailable && error?.message?.includes('RESEND') ? 'Configuração pendente' : undefined
        },
      };
    } catch (error: any) {
      return {
        service_name: 'Serviço de Email',
        service_type: 'email',
        status: 'offline',
        latency_ms: Date.now() - start,
        error_message: error.message,
      };
    }
  },

  /**
   * Salva uma verificação de saúde no banco
   */
  async saveHealthCheck(check: HealthCheckResult): Promise<void> {
    try {
      await retryWithTokenRefresh(async () => {
        const { error } = await supabase.from('system_health_checks').insert({
          service_name: check.service_name,
          service_type: check.service_type,
          status: check.status,
          latency_ms: check.latency_ms,
          response_data: check.response_data,
          error_message: check.error_message,
        });
        
        if (error) {
          console.error('Erro ao salvar verificação de saúde:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Erro ao salvar verificação de saúde:', error);
      // Não propagar erro - permitir que o sistema continue funcionando
    }
  },

  /**
   * Salva um alerta no banco
   */
  async saveAlert(alert: {
    service_name: string;
    alert_type: 'error' | 'warning' | 'info';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: any;
  }): Promise<void> {
    try {
      await retryWithTokenRefresh(async () => {
        const { error } = await supabase.from('system_alerts').insert({
          service_name: alert.service_name,
          alert_type: alert.alert_type,
          message: alert.message,
          severity: alert.severity,
          metadata: alert.metadata,
        });
        
        if (error) {
          console.error('Erro ao salvar alerta:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Erro ao salvar alerta:', error);
      // Não propagar erro - permitir que o sistema continue funcionando
    }
  },

  /**
   * Carrega alertas do banco
   */
  async loadAlerts(limit: number = 50): Promise<SystemAlert[]> {
    try {
      return await retryWithTokenRefresh(async () => {
        const { data, error } = await supabase
          .from('system_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Erro ao carregar alertas:', error);
          throw error;
        }
        
        return (data || []) as SystemAlert[];
      });
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      return [];
    }
  },

  /**
   * Carrega configurações de alertas do banco
   */
  async loadAlertConfig(): Promise<AlertConfig | null> {
    try {
      return await retryWithTokenRefresh(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return null;
        }

        const { data, error } = await supabase
          .from('system_alert_config')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Usar maybeSingle ao invés de single para evitar erro 406

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao carregar configurações:', error);
          return null;
        }

        if (data) {
          return {
            email_enabled: data.email_enabled ?? true,
            email_address: data.email_address,
            whatsapp_enabled: data.whatsapp_enabled ?? false,
            whatsapp_number: data.whatsapp_number,
            downtime_alerts: data.downtime_alerts ?? true,
            slow_response_alerts: data.slow_response_alerts ?? true,
            error_alerts: data.error_alerts ?? true,
          };
        }

        return null;
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return null;
    }
  },

  /**
   * Salva configurações de alertas no banco
   */
  async saveAlertConfig(config: AlertConfig): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('system_alert_config')
        .upsert({
          user_id: user.id,
          email_enabled: config.email_enabled,
          email_address: config.email_address,
          whatsapp_enabled: config.whatsapp_enabled,
          whatsapp_number: config.whatsapp_number,
          downtime_alerts: config.downtime_alerts,
          slow_response_alerts: config.slow_response_alerts,
          error_alerts: config.error_alerts,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      return false;
    }
  },

  /**
   * Calcula uptime real das últimas 24h
   */
  async calculateUptime24h(serviceName?: string): Promise<number> {
    try {
      return await retryWithTokenRefresh(async () => {
        // Tentar usar a função RPC primeiro
        const { data, error } = await supabase.rpc('calculate_system_uptime_24h', {
          service_name_param: serviceName || null,
        });

        if (!error && data !== null && data !== undefined) {
          return Number(data);
        }
        
        // Se RPC falhou, calcular manualmente
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        let query = supabase
          .from('system_health_checks')
          .select('status')
          .gte('checked_at', twentyFourHoursAgo);

        if (serviceName) {
          query = query.eq('service_name', serviceName);
        }

        const { data: checkData, error: countError } = await query;

        if (countError) {
          console.error('Erro ao calcular uptime manualmente:', countError);
          return 99.9;
        }

        if (!checkData || checkData.length === 0) {
          return 100.0; // Se não há verificações, assumir 100%
        }

        const onlineCount = checkData.filter((d: any) => d.status === 'online').length;
        const uptime = Math.round((onlineCount / checkData.length) * 100 * 100) / 100;
        return uptime;
      });
    } catch (error) {
      console.error('Erro ao calcular uptime:', error);
      return 99.9; // Fallback final
    }
  },
};

