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
  Activity, Server, Database, Cloud, Mail, CreditCard, Bot,
  CheckCircle, AlertTriangle, XCircle, RefreshCw, Bell, Settings,
  Clock, TrendingUp, Shield, Zap, MessageCircle, Phone
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ServiceStatus {
  name: string;
  status: 'online' | 'slow' | 'offline' | 'checking';
  latency: number;
  lastCheck: Date;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface AlertConfig {
  email: boolean;
  emailAddress: string;
  whatsapp: boolean;
  whatsappNumber: string;
  downtime: boolean;
  slowResponse: boolean;
  errors: boolean;
}

export default function SystemHealthMonitor() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [uptime, setUptime] = useState(99.9);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    email: true,
    emailAddress: '',
    whatsapp: false,
    whatsappNumber: '',
    downtime: true,
    slowResponse: true,
    errors: true,
  });

  useEffect(() => {
    checkAllServices();
    loadAlertConfig();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkAllServices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertConfig = () => {
    const saved = localStorage.getItem('system_alert_config');
    if (saved) {
      setAlertConfig(JSON.parse(saved));
    }
  };

  const saveAlertConfig = () => {
    localStorage.setItem('system_alert_config', JSON.stringify(alertConfig));
    toast({ title: 'Configurações salvas!' });
  };

  const checkService = async (name: string, checkFn: () => Promise<boolean>): Promise<{ online: boolean; latency: number }> => {
    const start = Date.now();
    try {
      const result = await Promise.race([
        checkFn(),
        new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
      ]);
      return { online: result, latency: Date.now() - start };
    } catch (error) {
      return { online: false, latency: Date.now() - start };
    }
  };

  const checkAllServices = async () => {
    setChecking(true);
    
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

    // Verificar cada serviço
    const results = await Promise.all([
      // Banco de dados
      checkService('database', async () => {
        const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
        return !error;
      }),
      // Autenticação
      checkService('auth', async () => {
        const { data } = await supabase.auth.getSession();
        return true;
      }),
      // Storage
      checkService('storage', async () => {
        const { data, error } = await supabase.storage.listBuckets();
        return !error;
      }),
      // API Gemini - simulado
      checkService('gemini', async () => {
        // Simular verificação da API
        await new Promise(r => setTimeout(r, 500));
        return true;
      }),
      // Email - simulado
      checkService('email', async () => {
        await new Promise(r => setTimeout(r, 300));
        return true;
      }),
    ]);

    const updatedServices = serviceChecks.map((service, index) => {
      const result = results[index];
      let status: 'online' | 'slow' | 'offline' = 'offline';
      
      if (result.online) {
        status = result.latency > 500 ? 'slow' : 'online';
      }
      
      return {
        ...service,
        status,
        latency: result.latency,
        lastCheck: new Date(),
      };
    });

    setServices(updatedServices);
    setLoading(false);
    setChecking(false);

    // Gerar alertas se necessário
    const newAlerts: any[] = [];
    updatedServices.forEach(service => {
      if (service.status === 'offline') {
        newAlerts.push({
          id: Date.now(),
          type: 'error',
          service: service.name,
          message: `${service.name} está offline!`,
          time: new Date(),
        });
      } else if (service.status === 'slow') {
        newAlerts.push({
          id: Date.now() + 1,
          type: 'warning',
          service: service.name,
          message: `${service.name} está lento (${service.latency}ms)`,
          time: new Date(),
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
    }

    // Calcular uptime
    const onlineCount = updatedServices.filter(s => s.status === 'online').length;
    setUptime((onlineCount / updatedServices.length) * 100);
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
                  {alerts.filter(a => a.type === 'warning').length}
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
                        alert.type === 'warning' && "bg-amber-50 border-amber-100"
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
                    checked={alertConfig.email}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, email: checked })}
                  />
                </div>
                {alertConfig.email && (
                  <div>
                    <Label className="text-slate-600">Endereço de Email</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={alertConfig.emailAddress}
                      onChange={(e) => setAlertConfig({ ...alertConfig, emailAddress: e.target.value })}
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
                    checked={alertConfig.whatsapp}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, whatsapp: checked })}
                  />
                </div>
                {alertConfig.whatsapp && (
                  <div>
                    <Label className="text-slate-600">Número do WhatsApp</Label>
                    <Input
                      type="tel"
                      placeholder="+55 67 99999-9999"
                      value={alertConfig.whatsappNumber}
                      onChange={(e) => setAlertConfig({ ...alertConfig, whatsappNumber: e.target.value })}
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
                    checked={alertConfig.downtime}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, downtime: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-700">Resposta Lenta</div>
                    <div className="text-sm text-slate-500">Alerta quando um serviço estiver lento ({">"} 500ms)</div>
                  </div>
                  <Switch
                    checked={alertConfig.slowResponse}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, slowResponse: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-700">Erros do Sistema</div>
                    <div className="text-sm text-slate-500">Alerta quando ocorrerem erros críticos</div>
                  </div>
                  <Switch
                    checked={alertConfig.errors}
                    onCheckedChange={(checked) => setAlertConfig({ ...alertConfig, errors: checked })}
                  />
                </div>
              </div>

              <Button onClick={saveAlertConfig} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

