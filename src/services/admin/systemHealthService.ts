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
   * Salva um alerta no banco e envia notificações se configurado
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
        const { data, error } = await supabase.from('system_alerts').insert({
          service_name: alert.service_name,
          alert_type: alert.alert_type,
          message: alert.message,
          severity: alert.severity,
          metadata: alert.metadata,
        }).select().single();
        
        if (error) {
          console.error('Erro ao salvar alerta:', error);
          throw error;
        }

        // Enviar notificações se configurado
        if (data) {
          await this.sendAlertNotifications(data);
        }
      });
    } catch (error) {
      console.error('Erro ao salvar alerta:', error);
      // Não propagar erro - permitir que o sistema continue funcionando
    }
  },

  /**
   * Envia notificações de alerta (email/WhatsApp) para usuários configurados
   */
  async sendAlertNotifications(alert: SystemAlert): Promise<void> {
    // #region agent log - HYP-A: sendAlertNotifications iniciado
    console.log('🔍 [DEBUG-HYP-A] sendAlertNotifications iniciado:', {
      alertType: alert.alert_type,
      serviceName: alert.service_name,
      severity: alert.severity,
      hasMessage: !!alert.message,
      message: alert.message,
      hasCreatedAt: !!alert.created_at,
      createdAt: alert.created_at
    });
    // #endregion
    
    try {
      // Buscar todas as configurações de alerta ativas
      const { data: configs, error } = await supabase
        .from('system_alert_config')
        .select('*')
        .eq('downtime_alerts', true)
        .or(`email_enabled.eq.true,whatsapp_enabled.eq.true`);

      // #region agent log - HYP-B: Configurações de alerta buscadas
      console.log('🔍 [DEBUG-HYP-B] Configurações de alerta buscadas:', {
        hasError: !!error,
        errorMessage: error?.message,
        configsCount: configs?.length || 0,
        configs: configs
      });
      // #endregion

      if (error || !configs || configs.length === 0) {
        return; // Nenhuma configuração encontrada
      }

      // Enviar para cada usuário configurado
      for (const config of configs) {
        // Enviar email se configurado e for alerta de erro ou warning
        if (config.email_enabled && config.email_address && (alert.alert_type === 'error' || alert.alert_type === 'warning')) {
          try {
            const emailPayload = {
              type: 'system_alert',
              to: config.email_address,
              data: {
                service_name: alert.service_name,
                message: alert.message,
                severity: alert.severity,
                alert_type: alert.alert_type,
                timestamp: alert.created_at,
              },
            };
            
            // #region agent log - HYP-A/B: Payload antes de enviar
            console.log('🔍 [DEBUG-HYP-A] Payload completo antes de enviar:', JSON.stringify(emailPayload, null, 2));
            console.log('🔍 [DEBUG-HYP-B] Validação do payload:', {
              hasType: !!emailPayload.type,
              typeValue: emailPayload.type,
              hasTo: !!emailPayload.to,
              toValue: emailPayload.to,
              hasData: !!emailPayload.data,
              dataKeys: Object.keys(emailPayload.data || {}),
              dataValues: emailPayload.data
            });
            // #endregion
            
            console.log('📧 [systemHealthService] Enviando email de alerta:', {
              to: config.email_address,
              payload: emailPayload,
              alertData: {
                service_name: alert.service_name,
                message: alert.message,
                severity: alert.severity,
                alert_type: alert.alert_type,
                created_at: alert.created_at,
              }
            });
            
            // Usar fetch direto para garantir que o body seja enviado corretamente
            // O Supabase client pode estar serializando o body de forma incorreta
            let emailResult: any = null;
            let emailError: any = null;
            
            try {
              const { data: { session } } = await supabase.auth.getSession();
              const supabaseUrl = 'https://hvtrpkbjgbuypkskqcqm.supabase.co';
              const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHJwa2JqZ2J1eXBrc2txY3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzIzODgsImV4cCI6MjA2NzYwODM4OH0.gHxmJIedckwQxz89DUHx4odzTbPefFeadW3T7cYcW2Q';
              const functionUrl = `${supabaseUrl}/functions/v1/send-notification-email`;
              
              // #region agent log - HYP-C: Tentando fetch direto
              console.log('🔍 [DEBUG-HYP-C] Fazendo fetch direto para:', functionUrl);
              console.log('🔍 [DEBUG-HYP-C] Payload serializado:', JSON.stringify(emailPayload));
              console.log('🔍 [DEBUG-HYP-C] Payload type:', typeof emailPayload);
              console.log('🔍 [DEBUG-HYP-C] Payload keys:', Object.keys(emailPayload));
              // #endregion
              
              const directResponse = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
                  'apikey': supabaseAnonKey,
                },
                body: JSON.stringify(emailPayload),
              });
              
              const responseText = await directResponse.text();
              let responseBody: any;
              try {
                responseBody = JSON.parse(responseText);
              } catch {
                responseBody = { raw: responseText };
              }
              
              // #region agent log - HYP-C/D/E: Resposta capturada
              console.log('🔍 [DEBUG-HYP-C] Resposta HTTP direta capturada:', {
                status: directResponse.status,
                statusText: directResponse.statusText,
                ok: directResponse.ok,
                headers: Object.fromEntries(directResponse.headers.entries()),
                body: responseBody,
                bodyRaw: responseText,
                bodyRawLength: responseText.length
              });
              
              console.log('🔍 [DEBUG-HYP-E] CORPO COMPLETO DA RESPOSTA (bodyRaw):', responseText);
              console.log('🔍 [DEBUG-HYP-E] CORPO PARSED (body):', JSON.stringify(responseBody, null, 2));
              // #endregion
              
              if (!directResponse.ok) {
                emailError = {
                  name: 'FunctionsHttpError',
                  message: `Edge Function returned status ${directResponse.status}`,
                  status: directResponse.status,
                  context: responseBody
                };
              } else {
                emailResult = responseBody;
              }
            } catch (fetchError: any) {
              // #region agent log - HYP-C/E: Erro no fetch
              console.warn('🔍 [DEBUG-HYP-C] Erro ao fazer fetch direto:', {
                error: fetchError,
                message: fetchError?.message,
                stack: fetchError?.stack
              });
              // #endregion
              emailError = fetchError;
            }
            
            if (emailError) {
            // #region agent log - HYP-D/E: Erro detalhado capturado
            console.log('🔍 [DEBUG-HYP-D] Erro detalhado:', {
              errorName: emailError?.name,
              errorMessage: emailError?.message,
              errorStack: emailError?.stack,
              errorContext: emailError?.context,
              errorKeys: Object.keys(emailError || {}),
              errorType: typeof emailError,
              errorConstructor: emailError?.constructor?.name,
              fullErrorString: JSON.stringify(emailError, Object.getOwnPropertyNames(emailError), 2)
            });
            // #endregion
              
              // Tentar extrair mensagem de erro mais detalhada
              const errorMessage = emailError.message || JSON.stringify(emailError);
              console.error(`❌ Erro ao enviar email de alerta para ${config.email_address}:`, {
                error: emailError,
                message: errorMessage,
                errorName: emailError?.name,
                errorContext: emailError?.context,
                fullError: JSON.stringify(emailError, null, 2),
                context: {
                  service_name: alert.service_name,
                  alert_type: alert.alert_type,
                  severity: alert.severity,
                }
              });
              console.warn('💡 Dica: Verifique os logs da Edge Function no Supabase Dashboard para mais detalhes sobre o erro 400');
            } else {
            // #region agent log - HYP-A: Sucesso
            console.log('🔍 [DEBUG-HYP-A] Sucesso - Edge Function retornou sem erro:', emailResult);
            // #endregion
              console.log(`✅ Email de alerta enviado para ${config.email_address}`, emailResult);
            }
          } catch (emailError: any) {
            // #region agent log - HYP-C/E: Exceção capturada no catch
            console.log('🔍 [DEBUG-HYP-C] Exceção capturada no catch:', {
              errorName: emailError?.name,
              errorMessage: emailError?.message,
              errorStack: emailError?.stack,
              errorType: typeof emailError,
              errorConstructor: emailError?.constructor?.name,
              errorProps: Object.getOwnPropertyNames(emailError),
              errorString: String(emailError)
            });
            // #endregion
            
            // Capturar mensagem de erro mais detalhada
            let errorDetails = emailError?.message || String(emailError);
            if (emailError?.context) {
              errorDetails += ` | Context: ${JSON.stringify(emailError.context)}`;
            }
            console.error(`❌ Erro ao enviar email de alerta para ${config.email_address}:`, {
              error: emailError,
              message: errorDetails,
              stack: emailError?.stack,
              errorName: emailError?.name,
              fullError: JSON.stringify(emailError, Object.getOwnPropertyNames(emailError), 2),
            });
            console.warn('💡 Dica: Verifique os logs da Edge Function no Supabase Dashboard para mais detalhes sobre o erro 400');
            // Não propagar erro - não queremos que falhas de email quebrem o sistema
          }
        }

        // WhatsApp pode ser implementado aqui se houver integração
        if (config.whatsapp_enabled && config.whatsapp_number) {
          // TODO: Implementar envio via WhatsApp quando houver integração
          console.log(`📱 WhatsApp alerta seria enviado para ${config.whatsapp_number}`);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar notificações de alerta:', error);
      // Não propagar erro - não queremos que falhas de notificação quebrem o sistema
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
      console.log('💾 [systemHealthService] Iniciando salvamento de configurações...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ [systemHealthService] Erro ao obter usuário:', userError);
        return false;
      }
      
      if (!user) {
        console.warn('⚠️ [systemHealthService] Nenhum usuário autenticado');
        return false;
      }

      console.log('👤 [systemHealthService] Usuário autenticado:', user.id);
      console.log('📝 [systemHealthService] Configurações a salvar:', config);

      const { data, error } = await supabase
        .from('system_alert_config')
        .upsert({
          user_id: user.id,
          email_enabled: config.email_enabled ?? false,
          email_address: config.email_address || null,
          whatsapp_enabled: config.whatsapp_enabled ?? false,
          whatsapp_number: config.whatsapp_number || null,
          downtime_alerts: config.downtime_alerts ?? true,
          slow_response_alerts: config.slow_response_alerts ?? true,
          error_alerts: config.error_alerts ?? true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select();

      if (error) {
        console.error('❌ [systemHealthService] Erro ao salvar no banco:', error);
        console.error('❌ [systemHealthService] Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      console.log('✅ [systemHealthService] Configurações salvas com sucesso!', data);
      return true;
    } catch (error: any) {
      console.error('❌ [systemHealthService] Erro ao salvar configurações:', error);
      console.error('❌ [systemHealthService] Stack trace:', error.stack);
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

