import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Activity, Database, Cloud, Mail, Bot,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  Clock, Shield, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { systemHealthService, type AlertConfig } from '@/services/admin/systemHealthService';

interface ServiceStatus {
  name: string;
  status: 'online' | 'slow' | 'offline' | 'checking';
  latency: number;
  lastCheck: Date;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Banco de Dados (Supabase)': Database,
  'Autenticação': Shield,
  'Storage de Arquivos': Cloud,
  'API Gemini (IA)': Bot,
  'Serviço de Email': Mail,
};

export default function SystemHealthMonitor() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [uptime, setUptime] = useState(99.9);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    email_enabled: true,
    email_address: '',
    whatsapp_enabled: false,
    whatsapp_number: '',
    downtime_alerts: true,
    slow_response_alerts: true,
    error_alerts: true,
  });

  useEffect(() => {
    loadInitialData();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkAllServices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    // Verificar se as políticas RLS estão corretas
    const rlsCheck = await systemHealthService.checkRLSPolicies();
    if (!rlsCheck.correct && rlsCheck.message) {
      toast({
        title: 'Atenção: Migration Pendente',
        description: rlsCheck.message + ' Arquivo: supabase/migrations/20251213000001_fix_system_health_rls_policies.sql',
        variant: 'destructive',
      });
    }

    await Promise.all([
      loadAlertConfig(),
      loadAlerts(),
      checkAllServices(),
    ]);
  };

  const loadAlertConfig = async () => {
    const config = await systemHealthService.loadAlertConfig();
    if (config) {
      setAlertConfig(config);
    } else {
      // Fallback para localStorage se não houver no banco
    const saved = localStorage.getItem('system_alert_config');
    if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAlertConfig({
            email_enabled: parsed.email ?? true,
            email_address: parsed.emailAddress ?? '',
            whatsapp_enabled: parsed.whatsapp ?? false,
            whatsapp_number: parsed.whatsappNumber ?? '',
            downtime_alerts: parsed.downtime ?? true,
            slow_response_alerts: parsed.slowResponse ?? true,
            error_alerts: parsed.errors ?? true,
          });
        } catch (e) {
          console.error('Erro ao carregar config do localStorage:', e);
        }
      }
    }
  };

  const saveAlertConfig = async () => {
    console.log('💾 [SystemHealthMonitor] Botão clicado! Salvando configurações...', alertConfig);
    setSavingConfig(true);
    
    try {
      // Validações básicas
      if (alertConfig.email_enabled && !alertConfig.email_address?.trim()) {
        console.warn('⚠️ [SystemHealthMonitor] Validação falhou: email habilitado mas sem endereço');
        toast({
          title: 'Erro de validação',
          description: 'Por favor, informe um endereço de email para receber alertas.',
          variant: 'destructive',
        });
        setSavingConfig(false);
        return;
      }

      if (alertConfig.whatsapp_enabled && !alertConfig.whatsapp_number?.trim()) {
        console.warn('⚠️ [SystemHealthMonitor] Validação falhou: WhatsApp habilitado mas sem número');
        toast({
          title: 'Erro de validação',
          description: 'Por favor, informe um número de WhatsApp para receber alertas.',
          variant: 'destructive',
        });
        setSavingConfig(false);
        return;
      }

      console.log('✅ [SystemHealthMonitor] Validações passaram, salvando no banco...');
    const success = await systemHealthService.saveAlertConfig(alertConfig);
      console.log('📊 [SystemHealthMonitor] Resultado do salvamento:', success);
      
    if (success) {
        console.log('✅ [SystemHealthMonitor] Configurações salvas com sucesso no banco!');
        // Forçar toast a aparecer - usar requestAnimationFrame para garantir que o DOM está pronto
        requestAnimationFrame(() => {
          console.log('🎯 [SystemHealthMonitor] Disparando toast...');
          toast({ 
            title: '✅ Configurações salvas!', 
            description: 'Suas preferências foram salvas no banco de dados. Você receberá alertas conforme configurado.',
            duration: 5000,
          });
          console.log('✅ [SystemHealthMonitor] Toast disparado!');
        });
    } else {
        console.warn('⚠️ [SystemHealthMonitor] Falha ao salvar no banco, usando localStorage como fallback');
      // Fallback para localStorage
      localStorage.setItem('system_alert_config', JSON.stringify({
        email: alertConfig.email_enabled,
        emailAddress: alertConfig.email_address,
        whatsapp: alertConfig.whatsapp_enabled,
        whatsappNumber: alertConfig.whatsapp_number,
        downtime: alertConfig.downtime_alerts,
        slowResponse: alertConfig.slow_response_alerts,
        errors: alertConfig.error_alerts,
      }));
        toast({ 
          title: '⚠️ Configurações salvas localmente', 
          description: 'Salvas no navegador (banco temporariamente indisponível). Configure novamente quando o banco estiver disponível.',
          variant: 'default',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('❌ [SystemHealthMonitor] Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as configurações. Tente novamente.',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const loadAlerts = async () => {
    console.log('📋 [SystemHealthMonitor] Carregando alertas do banco de dados...');
    const loadedAlerts = await systemHealthService.loadAlerts(50);
    console.log('✅ [SystemHealthMonitor] Alertas carregados (REAL do banco):', loadedAlerts.length);
    setAlerts(loadedAlerts.map(alert => ({
      id: alert.id,
      type: alert.alert_type,
      service: alert.service_name,
      message: alert.message,
      time: new Date(alert.created_at),
      severity: alert.severity,
      resolved: alert.resolved,
    })));
  };

  const checkAllServices = async () => {
    setChecking(true);
    setLoading(true);
    
    // Log para verificação - mostrar que estamos buscando dados reais
    console.log('🔍 [SystemHealthMonitor] Verificando serviços com dados REAIS...');
    
    // Inicializar serviços com status "checking"
    const serviceChecks: ServiceStatus[] = [
      {
        name: 'Banco de Dados (Supabase)',
        status: 'checking',
        latency: 0,
        lastCheck: new Date(),
        icon: Database,
        description: 'PostgreSQL hospedado no Supabase'
      },
      {
        name: 'Autenticação',
        status: 'checking',
        latency: 0,
        lastCheck: new Date(),
        icon: Shield,
        description: 'Sistema de login e sessões'
      },
      {
        name: 'Storage de Arquivos',
        status: 'checking',
        latency: 0,
        lastCheck: new Date(),
        icon: Cloud,
        description: 'Armazenamento de imagens e documentos'
      },
      {
        name: 'API Gemini (IA)',
        status: 'checking',
        latency: 0,
        lastCheck: new Date(),
        icon: Bot,
        description: 'Inteligência artificial do Guatá'
      },
      {
        name: 'Serviço de Email',
        status: 'checking',
        latency: 0,
        lastCheck: new Date(),
        icon: Mail,
        description: 'Envio de notificações por email'
      },
    ];

    setServices(serviceChecks);

    // Verificar cada serviço usando o serviço real
    const results = await Promise.all([
      systemHealthService.checkDatabase().then(result => {
        console.log('✅ [SystemHealthMonitor] Banco de Dados (REAL):', result);
        return result;
      }),
      systemHealthService.checkAuth().then(result => {
        console.log('✅ [SystemHealthMonitor] Autenticação (REAL):', result);
        return result;
      }),
      systemHealthService.checkStorage().then(result => {
        console.log('✅ [SystemHealthMonitor] Storage (REAL):', result);
        return result;
      }),
      systemHealthService.checkGeminiAPI().then(result => {
        console.log('✅ [SystemHealthMonitor] API Gemini (REAL):', result);
        return result;
      }),
      systemHealthService.checkEmailService().then(result => {
        console.log('✅ [SystemHealthMonitor] Email Service (REAL):', result);
        return result;
      }),
    ]);

    // Salvar verificações no banco
    console.log('💾 [SystemHealthMonitor] Salvando verificações no banco de dados...');
    await Promise.all(results.map(result => systemHealthService.saveHealthCheck(result)));
    console.log('✅ [SystemHealthMonitor] Verificações salvas no banco!');

    // Atualizar serviços com resultados reais
    const updatedServices = serviceChecks.map((service, index) => {
      const result = results[index];
      const Icon = SERVICE_ICONS[service.name] || Database;
      
      return {
        ...service,
        name: result.service_name,
        status: result.status,
        latency: result.latency_ms,
        lastCheck: new Date(),
        icon: Icon,
      };
    });

    setServices(updatedServices);

    // Calcular uptime real das últimas 24h
    console.log('📊 [SystemHealthMonitor] Calculando uptime real das últimas 24h do banco...');
    const realUptime = await systemHealthService.calculateUptime24h();
    console.log('✅ [SystemHealthMonitor] Uptime 24h (REAL do banco):', realUptime + '%');
    setUptime(realUptime);

    // Gerar e salvar alertas se necessário
    const newAlerts: any[] = [];
    for (const result of results) {
      if (result.status === 'offline' && alertConfig.downtime_alerts) {
        const alert = {
          service_name: result.service_name,
          alert_type: 'error' as const,
          message: `${result.service_name} está offline!`,
          severity: 'high' as const,
          metadata: { error_message: result.error_message },
        };
        await systemHealthService.saveAlert(alert);
        newAlerts.push({
          id: Date.now() + Math.random(),
          type: 'error',
          service: result.service_name,
          message: alert.message,
          time: new Date(),
        });
      } else if (result.status === 'slow' && alertConfig.slow_response_alerts) {
        const alert = {
          service_name: result.service_name,
          alert_type: 'warning' as const,
          message: `${result.service_name} está lento (${result.latency_ms}ms)`,
          severity: 'medium' as const,
          metadata: { latency_ms: result.latency_ms },
        };
        await systemHealthService.saveAlert(alert);
        newAlerts.push({
          id: Date.now() + Math.random(),
          type: 'warning',
          service: result.service_name,
          message: alert.message,
          time: new Date(),
        });
      }
    }

    // Recarregar alertas do banco
    await loadAlerts();

    setLoading(false);
    setChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'slow': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'offline': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Online</Badge>;
      case 'slow': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Lento</Badge>;
      case 'offline': return <Badge className="bg-red-100 text-red-700 border-red-200">Offline</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Verificando...</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Saúde do Sistema</h2>
          <p className="text-slate-500 mt-1">Monitore todos os serviços e receba alertas em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={checkAllServices}
            disabled={checking}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", checking && "animate-spin")} />
            Verificar Agora
          </Button>
        </div>
      </div>

      {/* Uptime Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Uptime (24h)</p>
                <p className="text-3xl font-bold mt-1">{uptime.toFixed(1)}%</p>
              </div>
              <Activity className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Serviços Online</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {services.filter(s => s.status === 'online').length}/{services.length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Alertas Ativos</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {alerts.filter(a => !a.resolved && a.type === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Última Verificação</p>
                <p className="text-lg font-semibold text-slate-700 mt-1">
                  {services[0]?.lastCheck ? format(services[0].lastCheck, 'HH:mm', { locale: ptBR }) : '--:--'}
                </p>
              </div>
              <Clock className="h-10 w-10 text-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        {/* Serviços */}
        <TabsContent value="services">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Status dos Serviços</CardTitle>
              <CardDescription>Monitoramento em tempo real de todos os componentes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && services.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                </div>
              ) : (
              <div className="space-y-3">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        service.status === 'online' && "bg-emerald-50/50 border-emerald-100",
                        service.status === 'slow' && "bg-amber-50/50 border-amber-100",
                        service.status === 'offline' && "bg-red-50/50 border-red-100",
                        service.status === 'checking' && "bg-slate-50 border-slate-100"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          service.status === 'online' && "bg-emerald-100",
                          service.status === 'slow' && "bg-amber-100",
                          service.status === 'offline' && "bg-red-100",
                          service.status === 'checking' && "bg-slate-100"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            service.status === 'online' && "text-emerald-600",
                            service.status === 'slow' && "text-amber-600",
                            service.status === 'offline' && "text-red-600",
                            service.status === 'checking' && "text-slate-400"
                          )} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{service.name}</div>
                          <div className="text-sm text-slate-500">{service.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-700">
                            {service.latency > 0 ? `${service.latency}ms` : '--'}
                          </div>
                          <div className="text-xs text-slate-400">Latência</div>
                        </div>
                        {getStatusBadge(service.status)}
                        {getStatusIcon(service.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alerts">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Histórico de Alertas</CardTitle>
              <CardDescription>Últimos alertas e notificações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 20).map((alert) => (
                    <div 
                      key={alert.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border",
                        alert.type === 'error' && "bg-red-50 border-red-100",
                        alert.type === 'warning' && "bg-amber-50 border-amber-100",
                        alert.resolved && "opacity-50"
                      )}
                    >
                      {alert.type === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium",
                          alert.type === 'error' ? "text-red-700" : "text-amber-700"
                        )}>
                          {alert.message}
                        </div>
                        <div className="text-sm text-slate-500">
                          {format(alert.time, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      {alert.resolved && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">Resolvido</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhum alerta registrado</p>
                  <p className="text-sm text-slate-400">Todos os serviços estão funcionando normalmente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações */}
        <TabsContent value="config">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Configurações de Alertas</CardTitle>
              <CardDescription>Configure como você deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-4 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">Alertas por Email</div>
                      <div className="text-sm text-slate-500">Receba notificações no seu email</div>
                    </div>
                  </div>
                  <Switch
                    checked={alertConfig.email_enabled}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, email_enabled: checked })}
                  />
                </div>
                {alertConfig.email_enabled && (
                  <div>
                    <Label className="text-slate-600">Endereço de Email</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={alertConfig.email_address || ''}
                      onChange={(e) => setAlertConfig({ ...alertConfig, email_address: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-4 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">Alertas por WhatsApp</div>
                      <div className="text-sm text-slate-500">Receba notificações no WhatsApp</div>
                    </div>
                  </div>
                  <Switch
                    checked={alertConfig.whatsapp_enabled}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, whatsapp_enabled: checked })}
                  />
                </div>
                {alertConfig.whatsapp_enabled && (
                  <div>
                    <Label className="text-slate-600">Número do WhatsApp</Label>
                    <Input
                      type="tel"
                      placeholder="+55 67 99999-9999"
                      value={alertConfig.whatsapp_number || ''}
                      onChange={(e) => setAlertConfig({ ...alertConfig, whatsapp_number: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Tipos de Alertas */}
              <div className="space-y-4 p-4 rounded-lg border border-slate-200">
                <div className="font-medium text-slate-800 mb-4">Tipos de Alertas</div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-700">Serviço Offline</div>
                    <div className="text-sm text-slate-500">Alerta quando um serviço ficar indisponível</div>
                  </div>
                  <Switch
                    checked={alertConfig.downtime_alerts}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, downtime_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-700">Resposta Lenta</div>
                    <div className="text-sm text-slate-500">Alerta quando um serviço estiver lento ({">"} 500ms)</div>
                  </div>
                  <Switch
                    checked={alertConfig.slow_response_alerts}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, slow_response_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-700">Erros do Sistema</div>
                    <div className="text-sm text-slate-500">Alerta quando ocorrerem erros críticos</div>
                  </div>
                  <Switch
                    checked={alertConfig.error_alerts}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, error_alerts: checked })}
                  />
                </div>
              </div>

              <Button 
                onClick={saveAlertConfig} 
                disabled={savingConfig}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingConfig ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
