// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { fallbackService } from '@/services/admin/fallbackService';
import { useToast } from '@/hooks/use-toast';
import { SystemFallback } from '@/types/admin';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';

export default function FallbackConfig() {
  const [config, setConfig] = useState<SystemFallback | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
    checkHealth();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await fallbackService.getFallbackConfig('descubra_ms');
      setConfig(data);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao carregar configuração',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    setChecking(true);
    try {
      const status = await fallbackService.checkSystemHealth('descubra_ms');
      if (config) {
        await fallbackService.updateFallbackConfig('descubra_ms', {
          status,
          last_check: new Date().toISOString(),
        });
        fetchConfig();
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Erro ao verificar saúde do sistema:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);

    try {
      await fallbackService.updateFallbackConfig('descubra_ms', {
        fallback_enabled: config.fallback_enabled,
        fallback_mode: config.fallback_mode,
        maintenance_message: config.maintenance_message,
        redirect_url: config.redirect_url,
      });
      toast({ title: 'Sucesso', description: 'Configuração salva com sucesso' });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar configuração',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Online</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-600"><AlertCircle className="h-3 w-3 mr-1" />Degradado</Badge>;
      case 'down':
        return <Badge className="bg-red-600"><AlertCircle className="h-3 w-3 mr-1" />Offline</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Fallback"
          description="Configure o modo de manutenção e mensagens de indisponibilidade da plataforma."
          helpText="Configure o modo de manutenção e mensagens de indisponibilidade da plataforma."
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkHealth} disabled={checking}>
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Verificar Status
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Status atual do Descubra MS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              {getStatusBadge(config.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Última Verificação</span>
              <span className="text-sm text-gray-600">
                {config.last_check 
                  ? new Date(config.last_check).toLocaleString('pt-BR')
                  : 'Nunca'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Fallback</CardTitle>
            <CardDescription>Configure o comportamento em caso de falha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="fallback_enabled">Fallback Habilitado</Label>
              <Switch
                id="fallback_enabled"
                checked={config.fallback_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, fallback_enabled: checked })}
              />
            </div>
            <div>
              <Label htmlFor="fallback_mode">Modo de Fallback</Label>
              <Select
                value={config.fallback_mode || ''}
                onValueChange={(value) => setConfig({ ...config, fallback_mode: value as 'maintenance' | 'readonly' | 'redirect' | null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Modo Manutenção</SelectItem>
                  <SelectItem value="readonly">Somente Leitura</SelectItem>
                  <SelectItem value="redirect">Redirecionar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {config.fallback_mode === 'maintenance' && (
        <Card>
          <CardHeader>
            <CardTitle>Mensagem de Manutenção</CardTitle>
            <CardDescription>Mensagem exibida quando sistema está em manutenção</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={config.maintenance_message || ''}
              onChange={(e) => setConfig({ ...config, maintenance_message: e.target.value })}
              placeholder="O sistema está temporariamente em manutenção. Voltaremos em breve."
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {config.fallback_mode === 'redirect' && (
        <Card>
          <CardHeader>
            <CardTitle>URL de Redirecionamento</CardTitle>
            <CardDescription>URL para redirecionar usuários quando sistema estiver offline</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="url"
              value={config.redirect_url || ''}
              onChange={(e) => setConfig({ ...config, redirect_url: e.target.value })}
              placeholder="https://exemplo.com/manutencao"
            />
          </CardContent>
        </Card>
      )}

      {config.status === 'down' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> O sistema Descubra MS está offline. 
            {config.fallback_enabled && config.fallback_mode && ' O modo de fallback está ativo.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
