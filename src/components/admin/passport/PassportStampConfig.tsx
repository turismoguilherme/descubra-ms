import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { passportAdminService } from '@/services/admin/passportAdminService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PassportStampConfig: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [stampThemes, setStampThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [creatingTheme, setCreatingTheme] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newThemeForm, setNewThemeForm] = useState({
    theme_key: '',
    theme_name: '',
    emoji: '',
    description: '',
  });
  const [formData, setFormData] = useState({
    stamp_theme: 'onca' as string,
    stamp_fragments: 5,
    video_url: '',
    description: '',
    require_sequential: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔵 [PassportStampConfig] Componente montado, carregando dados...');
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔵 [PassportStampConfig] selectedRoute mudou para:', selectedRoute);

    if (selectedRoute && configs.length > 0) {
      // Carregar dados da configuração existente quando uma rota é selecionada
      const existingConfig = configs.find(c => c.route_id === selectedRoute);
      if (existingConfig) {
        console.log('🔵 [PassportStampConfig] Carregando configuração existente:', existingConfig);
        setFormData({
          stamp_theme: existingConfig.stamp_theme || 'onca',
          stamp_fragments: existingConfig.stamp_fragments || 5,
          video_url: existingConfig.video_url || '',
          description: existingConfig.description || '',
          require_sequential: existingConfig.require_sequential || false,
        });
      } else {
        // Resetar para valores padrão se não houver configuração
        console.log('🔵 [PassportStampConfig] Nenhuma configuração encontrada, usando valores padrão');
        setFormData({
          stamp_theme: 'onca',
          stamp_fragments: 5,
          video_url: '',
          description: '',
          require_sequential: false,
        });
      }
    }
  }, [selectedRoute, configs]);

  useEffect(() => {
    console.log('🔵 [PassportStampConfig] creatingTheme mudou para:', creatingTheme);
  }, [creatingTheme]);

  // Log de renderização apenas quando estados importantes mudam
  useEffect(() => {
    console.log('🔵 [PassportStampConfig] Estado atual:', {
      loading,
      routesCount: routes.length,
      configsCount: configs.length,
      themesCount: stampThemes.length,
      selectedRoute,
      creatingTheme,
    });
  }, [loading, routes.length, configs.length, stampThemes.length, selectedRoute, creatingTheme]);

  const loadData = async () => {
    console.log('🔵 [PassportStampConfig] ========== loadData INICIADO ==========');
    try {
      setLoading(true);
      console.log('🔵 [PassportStampConfig] Buscando rotas, configurações e temas...');
      const [routesRes, configsRes, themesRes] = await Promise.all([
        supabase.from('routes').select('*').eq('is_active', true),
        passportAdminService.getConfigurations(),
        supabase.from('stamp_themes' as any).select('*').eq('is_active', true).order('theme_name'),
      ]);

      if (routesRes.error) {
        console.error('❌ [PassportStampConfig] Erro ao buscar rotas:', routesRes.error);
        throw routesRes.error;
      }
      if (themesRes.error) {
        console.error('❌ [PassportStampConfig] Erro ao buscar temas:', themesRes.error);
        throw themesRes.error;
      }
      
      console.log('✅ [PassportStampConfig] Rotas carregadas:', routesRes.data?.length || 0);
      console.log('✅ [PassportStampConfig] Configurações carregadas:', configsRes?.length || 0);
      console.log('✅ [PassportStampConfig] Temas carregados:', themesRes.data?.length || 0);
      
      setRoutes(routesRes.data || []);
      setConfigs(configsRes);
      setStampThemes(themesRes.data || []);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PassportStampConfig] Erro completo ao carregar dados:', {
        message: err.message,
        code: (err as { code?: string }).code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('🔵 [PassportStampConfig] loadData finalizado');
    }
  };

  const handleCreateTheme = async () => {
    console.log('🔵 [PassportStampConfig] ========== handleCreateTheme INICIADO ==========');
    console.log('🔵 [PassportStampConfig] Form data:', JSON.stringify(newThemeForm, null, 2));
    
    if (!newThemeForm.theme_key.trim() || !newThemeForm.theme_name.trim()) {
      console.log('❌ [PassportStampConfig] Chave ou nome do tema vazio');
      toast({
        title: 'Erro',
        description: 'Chave e nome do tema são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ [PassportStampConfig] Validações passadas, criando tema...');
    
    try {
      const themeData = {
        theme_key: newThemeForm.theme_key.toLowerCase().replace(/\s+/g, '_'),
        theme_name: newThemeForm.theme_name,
        emoji: newThemeForm.emoji || null,
        description: newThemeForm.description || null,
        is_active: true,
      };
      
      console.log('🔵 [PassportStampConfig] Dados para inserção:', JSON.stringify(themeData, null, 2));
      
      const { data, error } = await supabase.from('stamp_themes' as any).insert(themeData).select();

      if (error) {
        console.error('❌ [PassportStampConfig] Erro ao inserir tema:', error);
        throw error;
      }

      console.log('✅ [PassportStampConfig] Tema criado com sucesso:', data);

      toast({
        title: 'Tema criado',
        description: 'O novo tema foi criado com sucesso.',
      });

      setCreatingTheme(false);
      setNewThemeForm({
        theme_key: '',
        theme_name: '',
        emoji: '',
        description: '',
      });
      loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PassportStampConfig] Erro completo ao criar tema:', {
        message: err.message,
        code: (err as { code?: string }).code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      toast({
        title: 'Erro ao criar tema',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    console.log('🔵 [PassportStampConfig] ========== handleSave INICIADO ==========');
    console.log('🔵 [PassportStampConfig] selectedRoute:', selectedRoute);
    console.log('🔵 [PassportStampConfig] Form data:', JSON.stringify(formData, null, 2));

    if (!selectedRoute) {
      console.log('❌ [PassportStampConfig] Rota não selecionada');
      toast({
        title: 'Selecione uma rota',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const existing = configs.find(c => c.route_id === selectedRoute);
      console.log('🔵 [PassportStampConfig] Configuração existente?', !!existing);

      if (existing) {
        console.log('🔵 [PassportStampConfig] Atualizando configuração existente...');
        await passportAdminService.updateConfiguration(selectedRoute, formData);
      } else {
        console.log('🔵 [PassportStampConfig] Criando nova configuração...');
        await passportAdminService.createConfiguration({
          route_id: selectedRoute,
          ...formData,
          map_config: {},
          is_active: true,
        });
      }

      console.log('✅ [PassportStampConfig] Configuração salva com sucesso');
      
      // Mostrar estado "Salvo!" no botão por 2 segundos
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2000);
      
      toast({
        title: 'Configuração salva com sucesso! ✅',
        description: existing ? 'As alterações foram aplicadas.' : 'Nova configuração criada.',
        duration: 5000, // 5 segundos de duração
      });
      await loadData();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PassportStampConfig] Erro completo ao salvar configuração:', {
        message: err.message,
        code: (err as { code?: string }).code,
        details: error.details,
        hint: error.hint,
        stack: error.stack,
      });
      
      // Verificar se é erro de migration não executada
      if (error.name === 'MigrationRequiredError' || (error.code === 'PGRST204' && error.message?.includes('require_sequential'))) {
        toast({
          title: 'Migração do banco de dados necessária',
          description: error.message || 'A coluna "require_sequential" não existe. Execute a migration no Supabase Dashboard.',
          variant: 'destructive',
          duration: 10000, // Mostrar por mais tempo
        });
      } else {
        toast({
          title: 'Erro ao salvar configuração',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
      // Resetar estado "Salvo!" em caso de erro
      if (saved) {
        setSaved(false);
      }
    }
  };

  if (loading) {
    console.log('🔵 [PassportStampConfig] Renderizando estado de loading');
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-center flex-1">Configurar Carimbos</CardTitle>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                console.log('🔵 [PassportStampConfig] Botão "Novo Tema" clicado');
                setCreatingTheme(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Tema
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
        <div>
          <Label>Rota</Label>
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma rota" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRoute && (
          <>
            <div>
              <Label>Tema do Carimbo</Label>
              <Select
                value={formData.stamp_theme}
                onValueChange={(v: string) => setFormData({ ...formData, stamp_theme: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stampThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.theme_key}>
                      {theme.emoji} {theme.theme_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Número de Fragmentos</Label>
              <Input
                type="number"
                min="1"
                value={formData.stamp_fragments}
                onChange={(e) =>
                  setFormData({ ...formData, stamp_fragments: parseInt(e.target.value) || 5 })
                }
              />
            </div>

            <div>
              <Label>URL do Vídeo (opcional)</Label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do roteiro..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="require_sequential"
                checked={formData.require_sequential}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, require_sequential: checked === true })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="require_sequential"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Requer ordem sequencial
                </Label>
                <p className="text-xs text-muted-foreground">
                  Se marcado, checkpoints devem ser visitados em ordem (1, 2, 3...). Se desmarcado, permite ordem livre.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔵 [PassportStampConfig] Botão "Salvar Configuração" clicado');
                handleSave();
              }}
              disabled={saving}
              className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saved && <CheckCircle2 className="h-4 w-4 mr-2" />}
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Configuração'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>

      {creatingTheme && (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Criar Novo Tema de Carimbo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme_key">Chave do Tema *</Label>
            <Input
              id="theme_key"
              value={newThemeForm.theme_key}
              onChange={(e) =>
                setNewThemeForm({ ...newThemeForm, theme_key: e.target.value })
              }
              placeholder="Ex: capivara (sem espaços, minúsculas)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Chave única para identificar o tema (será convertida para minúsculas e sem espaços)
            </p>
          </div>
          <div>
            <Label htmlFor="theme_name">Nome do Tema *</Label>
            <Input
              id="theme_name"
              value={newThemeForm.theme_name}
              onChange={(e) =>
                setNewThemeForm({ ...newThemeForm, theme_name: e.target.value })
              }
              placeholder="Ex: Capivara"
            />
          </div>
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={newThemeForm.emoji}
              onChange={(e) =>
                setNewThemeForm({ ...newThemeForm, emoji: e.target.value })
              }
              placeholder="Ex: 🐹"
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="theme_description">Descrição</Label>
            <Textarea
              id="theme_description"
              value={newThemeForm.description}
              onChange={(e) =>
                setNewThemeForm({ ...newThemeForm, description: e.target.value })
              }
              placeholder="Descrição do tema..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateTheme}>Criar Tema</Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatingTheme(false);
                setNewThemeForm({
                  theme_key: '',
                  theme_name: '',
                  emoji: '',
                  description: '',
                });
              }}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    )}
    </div>
  );
};

export default PassportStampConfig;

