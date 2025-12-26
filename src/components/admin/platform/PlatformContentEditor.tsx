import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Save, Loader2, Check, Globe, Building2, 
  Link2, Image, Video, FileText, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  platformContentService, 
  PLATFORM_SECTIONS, 
  PlatformContent,
  ContentField 
} from '@/services/admin/platformContentService';

interface PlatformContentEditorProps {
  platform: 'viajar' | 'descubra_ms';
}

export default function PlatformContentEditor({ platform }: PlatformContentEditorProps) {
  const [contents, setContents] = useState<Record<string, string>>({});
  const [originalContents, setOriginalContents] = useState<Record<string, string>>({});
  const [contentIds, setContentIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const prefix = platform === 'viajar' ? 'viajar_' : 'ms_';
  const sections = PLATFORM_SECTIONS[platform] || [];
  const platformName = platform === 'viajar' ? 'ViaJARTur' : 'Descubra MS';

  useEffect(() => {
    loadContent();
  }, [platform]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await platformContentService.getContentByPrefix(prefix);
      
      const contentMap: Record<string, string> = {};
      const idMap: Record<string, string> = {};
      
      data.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
        idMap[item.content_key] = item.id;
      });
      
      setContents(contentMap);
      setOriginalContents(contentMap);
      setContentIds(idMap);
    } catch (error: any) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o conteúdo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setContents(prev => ({ ...prev, [key]: value }));
    // Remover do salvos se foi modificado novamente
    setSavedFields(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const hasChanges = (key: string) => {
    return contents[key] !== originalContents[key];
  };

  const hasAnyChanges = () => {
    return Object.keys(contents).some(key => hasChanges(key));
  };

  const saveField = async (key: string) => {
    setSaving(true);
    try {
      await platformContentService.upsertContent(key, contents[key] || '');
      
      setOriginalContents(prev => ({ ...prev, [key]: contents[key] }));
      setSavedFields(prev => new Set(prev).add(key));
      
      toast({
        title: 'Salvo!',
        description: 'Campo atualizado com sucesso.',
      });
      
      // Remover indicador de salvo após 2s
      setTimeout(() => {
        setSavedFields(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      const changedKeys = Object.keys(contents).filter(key => hasChanges(key));
      
      for (const key of changedKeys) {
        await platformContentService.upsertContent(key, contents[key] || '');
      }
      
      setOriginalContents({ ...contents });
      
      toast({
        title: 'Todas as alterações salvas!',
        description: `${changedKeys.length} campo(s) atualizado(s).`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (field: ContentField) => {
    const value = contents[field.key] || '';
    const changed = hasChanges(field.key);
    const saved = savedFields.has(field.key);

    const getIcon = () => {
      switch (field.type) {
        case 'url': return <Link2 className="h-4 w-4 text-muted-foreground" />;
        case 'image': return <Image className="h-4 w-4 text-muted-foreground" />;
        case 'video': return <Video className="h-4 w-4 text-muted-foreground" />;
        default: return null;
      }
    };

    return (
      <div key={field.key} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-foreground">
            {getIcon()}
            {field.label}
            {changed && (
              <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-600 border-amber-200">
                Modificado
              </Badge>
            )}
            {saved && (
              <Badge className="ml-2 text-xs bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Salvo
              </Badge>
            )}
          </Label>
          {changed && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => saveField(field.key)}
              disabled={saving}
              className="h-7 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Salvar
            </Button>
          )}
        </div>
        
        {field.type === 'json' ? (
          <Textarea
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                // Validar JSON ao digitar
                const parsed = JSON.parse(e.target.value);
                updateField(field.key, JSON.stringify(parsed, null, 2));
              } catch {
                // Se não for JSON válido ainda, apenas atualizar o texto
                updateField(field.key, e.target.value);
              }
            }}
            placeholder={field.placeholder || '[] ou {}'}
            rows={8}
            className={cn(
              "border-border transition-colors font-mono text-sm",
              changed && "border-amber-300 bg-amber-50/50",
              saved && "border-green-300 bg-green-50/50"
            )}
          />
        ) : field.type === 'textarea' || field.type === 'html' ? (
          <Textarea
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}...`}
            rows={field.type === 'html' ? 8 : 4}
            className={cn(
              "border-border transition-colors",
              changed && "border-amber-300 bg-amber-50/50",
              saved && "border-green-300 bg-green-50/50"
            )}
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}...`}
            className={cn(
              "border-border transition-colors",
              changed && "border-amber-300 bg-amber-50/50",
              saved && "border-green-300 bg-green-50/50"
            )}
          />
        )}
        
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        
        {/* Preview para URLs de imagem/vídeo */}
        {field.type === 'image' && value && (
          <div className="mt-2 rounded-lg overflow-hidden border border-border max-w-xs">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-24 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        {field.type === 'video' && value && value.includes('youtube') && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <Video className="h-3 w-3" />
            Vídeo do YouTube configurado
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {platform === 'viajar' ? (
            <Building2 className="h-6 w-6 text-primary" />
          ) : (
            <Globe className="h-6 w-6 text-primary" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Editor de Conteúdo - {platformName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Edite textos, links e informações das páginas
            </p>
          </div>
        </div>
        
        {hasAnyChanges() && (
          <Button onClick={saveAllChanges} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Todas as Alterações
          </Button>
        )}
      </div>

      {/* Tabs por seção */}
      <Tabs defaultValue={sections[0]?.id} className="w-full">
        <TabsList className="bg-muted p-1 rounded-lg border border-border flex-wrap h-auto gap-1">
          {sections.map(section => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(section => (
          <TabsContent key={section.id} value={section.id} className="mt-6">
            <Card className="border-border">
              <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <CardDescription>
                  Configure os textos e informações desta seção
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {section.fields.map(field => renderFieldInput(field))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
