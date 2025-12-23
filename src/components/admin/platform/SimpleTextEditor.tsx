import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { platformContentService, PlatformContent } from '@/services/admin/platformContentService';
import { Save, Loader2, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextField {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  section: string;
}

interface SimpleTextEditorProps {
  platform: 'viajar' | 'descubra_ms';
}

// Definição dos campos editáveis - SIMPLES, sem JSON
const TEXT_FIELDS: Record<string, TextField[]> = {
  viajar: [
    // Hero
    { key: 'viajar_hero_badge', label: 'Badge (texto pequeno)', type: 'text', placeholder: 'Plataforma #1 de Turismo Inteligente', section: 'Hero Principal' },
    { key: 'viajar_hero_title', label: 'Título Principal', type: 'text', placeholder: 'ViajARTur', section: 'Hero Principal' },
    { key: 'viajar_hero_subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Ecossistema inteligente de turismo', section: 'Hero Principal' },
    { key: 'viajar_hero_description', label: 'Descrição', type: 'textarea', placeholder: 'Transforme dados em decisões estratégicas...', section: 'Hero Principal' },
    { key: 'viajar_hero_cta_primary', label: 'Botão Principal', type: 'text', placeholder: 'Acessar Plataforma', section: 'Hero Principal' },
    { key: 'viajar_hero_cta_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Agendar Demo', section: 'Hero Principal' },
    { key: 'viajar_hero_video_url', label: 'Vídeo (URL YouTube)', type: 'text', placeholder: 'https://youtube.com/...', section: 'Hero Principal' },
    
    // Funcionalidades
    { key: 'viajar_features_title', label: 'Título da Seção', type: 'text', placeholder: 'Soluções Inteligentes', section: 'Funcionalidades' },
    { key: 'viajar_features_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Tecnologia de ponta para transformar...', section: 'Funcionalidades' },
    
    // Funcionalidade 1
    { key: 'viajar_feature_1_title', label: 'Funcionalidade 1 - Título', type: 'text', placeholder: 'Guilherme IA', section: 'Funcionalidades' },
    { key: 'viajar_feature_1_description', label: 'Funcionalidade 1 - Descrição', type: 'textarea', placeholder: 'Assistente inteligente...', section: 'Funcionalidades' },
    
    // Funcionalidade 2
    { key: 'viajar_feature_2_title', label: 'Funcionalidade 2 - Título', type: 'text', placeholder: 'Revenue Optimizer', section: 'Funcionalidades' },
    { key: 'viajar_feature_2_description', label: 'Funcionalidade 2 - Descrição', type: 'textarea', placeholder: 'Precificação dinâmica...', section: 'Funcionalidades' },
    
    // Funcionalidade 3
    { key: 'viajar_feature_3_title', label: 'Funcionalidade 3 - Título', type: 'text', placeholder: 'Market Intelligence', section: 'Funcionalidades' },
    { key: 'viajar_feature_3_description', label: 'Funcionalidade 3 - Descrição', type: 'textarea', placeholder: 'Análise de mercado...', section: 'Funcionalidades' },
    
    // Funcionalidade 4
    { key: 'viajar_feature_4_title', label: 'Funcionalidade 4 - Título', type: 'text', placeholder: 'Inventário Turístico', section: 'Funcionalidades' },
    { key: 'viajar_feature_4_description', label: 'Funcionalidade 4 - Descrição', type: 'textarea', placeholder: 'Gestão de atrativos...', section: 'Funcionalidades' },
    
    // Funcionalidade 5
    { key: 'viajar_feature_5_title', label: 'Funcionalidade 5 - Título', type: 'text', placeholder: 'Gestão de Eventos', section: 'Funcionalidades' },
    { key: 'viajar_feature_5_description', label: 'Funcionalidade 5 - Descrição', type: 'textarea', placeholder: 'Planejamento e análise...', section: 'Funcionalidades' },
    
    // Funcionalidade 6
    { key: 'viajar_feature_6_title', label: 'Funcionalidade 6 - Título', type: 'text', placeholder: 'Gestão de CATs', section: 'Funcionalidades' },
    { key: 'viajar_feature_6_description', label: 'Funcionalidade 6 - Descrição', type: 'textarea', placeholder: 'Controle de Centros...', section: 'Funcionalidades' },
    
    // Relatórios
    { key: 'viajar_reports_badge', label: 'Badge', type: 'text', placeholder: 'Novidade', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_title', label: 'Título', type: 'text', placeholder: 'Relatórios de Dados de Turismo', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_description', label: 'Descrição', type: 'textarea', placeholder: 'Acesse dados agregados...', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_1', label: 'Item 1 da Lista', type: 'text', placeholder: 'Dados agregados e anonimizados (LGPD)', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_2', label: 'Item 2 da Lista', type: 'text', placeholder: 'Perfil demográfico dos visitantes', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_3', label: 'Item 3 da Lista', type: 'text', placeholder: 'Origem e propósito de viagem', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_item_4', label: 'Item 4 da Lista', type: 'text', placeholder: 'Interações na plataforma Descubra MS', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_button_primary', label: 'Botão Principal', type: 'text', placeholder: 'Saiba Mais', section: 'Relatórios de Dados' },
    { key: 'viajar_reports_button_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Solicitar Relatório', section: 'Relatórios de Dados' },
    
    // Descubra MS
    { key: 'viajar_descubra_ms_badge', label: 'Badge', type: 'text', placeholder: 'Case de Sucesso', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_title', label: 'Título', type: 'text', placeholder: 'Descubra Mato Grosso do Sul', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_description', label: 'Descrição', type: 'textarea', placeholder: 'Nossa primeira implementação...', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_1', label: 'Item 1 da Lista', type: 'text', placeholder: 'Guatá - Assistente IA regional', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_2', label: 'Item 2 da Lista', type: 'text', placeholder: 'Passaporte Digital interativo', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_3', label: 'Item 3 da Lista', type: 'text', placeholder: 'Mapas e rotas inteligentes', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_item_4', label: 'Item 4 da Lista', type: 'text', placeholder: 'Analytics em tempo real', section: 'Descubra MS' },
    { key: 'viajar_descubra_ms_button', label: 'Texto do Botão', type: 'text', placeholder: 'Conhecer Descubra MS', section: 'Descubra MS' },
    
    // Vídeo
    { key: 'viajar_video_title', label: 'Título', type: 'text', placeholder: 'Veja a Plataforma em Ação', section: 'Vídeo' },
    { key: 'viajar_video_description', label: 'Descrição', type: 'textarea', placeholder: 'Descubra como a ViajARTur...', section: 'Vídeo' },
    
    // CTA Final
    { key: 'viajar_cta_title', label: 'Título', type: 'text', placeholder: 'Pronto para Transformar seu Turismo?', section: 'Call to Action' },
    { key: 'viajar_cta_description', label: 'Descrição', type: 'textarea', placeholder: 'Junte-se a empresas...', section: 'Call to Action' },
    { key: 'viajar_cta_button_primary', label: 'Botão Principal', type: 'text', placeholder: 'Solicitar Demonstração', section: 'Call to Action' },
    { key: 'viajar_cta_button_secondary', label: 'Botão Secundário', type: 'text', placeholder: 'Ver Planos', section: 'Call to Action' },
  ],
  descubra_ms: [
    // Hero Principal
    { key: 'ms_hero_title', label: 'Título Principal', type: 'text', placeholder: 'Descubra Mato Grosso do Sul', section: 'Hero Principal' },
    { key: 'ms_hero_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Explore destinos incríveis...', section: 'Hero Principal' },
    { key: 'ms_hero_button_1', label: 'Botão 1', type: 'text', placeholder: 'Explorar Destinos', section: 'Hero Principal' },
    { key: 'ms_hero_button_2', label: 'Botão 2', type: 'text', placeholder: 'Ver Galerias', section: 'Hero Principal' },
    { key: 'ms_hero_button_3', label: 'Botão 3', type: 'text', placeholder: 'Eventos', section: 'Hero Principal' },
    
    // Hero Universal
    { key: 'ms_hero_universal_subtitle', label: 'Subtítulo do Hero Universal', type: 'textarea', placeholder: 'Do Pantanal ao Cerrado...', section: 'Hero Universal' },
    { key: 'ms_hero_universal_button_1', label: 'Botão 1', type: 'text', placeholder: 'Descubra Agora', section: 'Hero Universal' },
    { key: 'ms_hero_universal_button_2', label: 'Botão 2', type: 'text', placeholder: 'Passaporte Digital', section: 'Hero Universal' },
    { key: 'ms_hero_universal_button_3', label: 'Botão 3', type: 'text', placeholder: 'Converse com o Guatá', section: 'Hero Universal' },
    
    // Descrição Turística
    { key: 'ms_tourism_title', label: 'Título', type: 'text', placeholder: 'Descubra Mato Grosso do Sul – Viva essa experiência!', section: 'Descrição Turística' },
    { key: 'ms_tourism_paragraph_1', label: 'Parágrafo 1', type: 'textarea', placeholder: 'Prepare-se para descobrir...', section: 'Descrição Turística' },
    { key: 'ms_tourism_paragraph_2', label: 'Parágrafo 2', type: 'textarea', placeholder: 'Crie seu passaporte digital...', section: 'Descrição Turística' },
    { key: 'ms_tourism_button', label: 'Texto do Botão', type: 'text', placeholder: 'Cadastre-se', section: 'Descrição Turística' },
    
    // Destinos em Destaque
    { key: 'ms_destinations_title', label: 'Título', type: 'text', placeholder: 'Destinos em Destaque', section: 'Destinos em Destaque' },
    { key: 'ms_destinations_description', label: 'Descrição', type: 'textarea', placeholder: 'Descubra os principais destinos...', section: 'Destinos em Destaque' },
    { key: 'ms_destinations_button', label: 'Texto do Botão', type: 'text', placeholder: 'Ver Todos os Destinos', section: 'Destinos em Destaque' },
    
    // Página Sobre
    { key: 'ms_about_title', label: 'Título da Página', type: 'text', placeholder: 'Sobre o Descubra MS', section: 'Página Sobre' },
    { key: 'ms_about_subtitle', label: 'Subtítulo', type: 'textarea', placeholder: 'Sua plataforma completa para explorar as maravilhas do estado mais biodiverso do Brasil.', section: 'Página Sobre' },
    { key: 'ms_about_essence_title', label: 'Título "Nossa Essência"', type: 'text', placeholder: 'Nossa Essência', section: 'Página Sobre' },
    { key: 'ms_about_mission_title', label: 'Título Missão', type: 'text', placeholder: 'Nossa Missão', section: 'Página Sobre' },
    { key: 'ms_about_mission_text', label: 'Texto da Missão', type: 'textarea', placeholder: 'Conectar turistas a experiências autênticas...', section: 'Página Sobre' },
    { key: 'ms_about_vision_title', label: 'Título Visão', type: 'text', placeholder: 'Nossa Visão', section: 'Página Sobre' },
    { key: 'ms_about_vision_text', label: 'Texto da Visão', type: 'textarea', placeholder: 'Ser a principal plataforma de turismo...', section: 'Página Sobre' },
    
    // Footer
    { key: 'ms_footer_copyright', label: 'Copyright', type: 'text', placeholder: '© 2025 Descubra Mato Grosso do Sul. Todos os direitos reservados.', section: 'Rodapé' },
    { key: 'ms_footer_privacy_link', label: 'Link Política de Privacidade', type: 'text', placeholder: 'Política de Privacidade', section: 'Rodapé' },
    { key: 'ms_footer_terms_link', label: 'Link Termos de Uso', type: 'text', placeholder: 'Termos de Uso', section: 'Rodapé' },
  ],
};

export default function SimpleTextEditor({ platform }: SimpleTextEditorProps) {
  const { toast } = useToast();
  const [contents, setContents] = useState<Record<string, string>>({});
  const [originalContents, setOriginalContents] = useState<Record<string, string>>({});
  const [contentIds, setContentIds] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fields = TEXT_FIELDS[platform] || [];
  const platformName = platform === 'viajar' ? 'ViajARTur' : 'Descubra MS';
  const prefix = platform === 'viajar' ? 'viajar_' : 'ms_';

  // Agrupar campos por seção
  const fieldsBySection = fields.reduce((acc, field) => {
    if (!acc[field.section]) {
      acc[field.section] = [];
    }
    acc[field.section].push(field);
    return acc;
  }, {} as Record<string, TextField[]>);

  useEffect(() => {
    loadContent();
  }, [platform]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await platformContentService.getContentByPrefix(prefix);
      const contentMap: Record<string, string> = {};
      const idMap: Record<string, string> = {};

      // Filtrar apenas campos que pertencem à plataforma atual
      const platformFieldKeys = new Set(fields.map(f => f.key));

      // Carregar valores do banco - APENAS para campos desta plataforma
      data.forEach(item => {
        // Garantir que apenas campos desta plataforma sejam carregados
        if (platformFieldKeys.has(item.content_key)) {
          contentMap[item.content_key] = item.content_value || '';
          idMap[item.content_key] = item.id;
        }
      });

      // Para campos que não existem no banco, usar placeholder como valor inicial
      // Isso garante que o usuário veja o texto atual (mesmo que seja o padrão)
      fields.forEach(field => {
        if (!contentMap[field.key] && field.placeholder) {
          contentMap[field.key] = field.placeholder;
        }
      });

      setContents(contentMap);
      setOriginalContents({ ...contentMap }); // Salvar cópia dos valores originais
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
    setSaved(prev => ({ ...prev, [key]: false }));
  };

  const hasChanges = (key: string): boolean => {
    const currentValue = contents[key] || '';
    const originalValue = originalContents[key] || '';
    return currentValue !== originalValue;
  };

  const revertField = (key: string) => {
    const originalValue = originalContents[key] || '';
    setContents(prev => ({ ...prev, [key]: originalValue }));
    setSaved(prev => ({ ...prev, [key]: false }));
    toast({
      title: 'Campo revertido',
      description: 'O campo foi restaurado ao valor original.',
    });
  };

  const saveField = async (key: string) => {
    const value = contents[key] || '';
    const id = contentIds[key];

    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      if (id) {
        // Atualizar existente
        await platformContentService.updateContent(id, value);
      } else {
        // Criar novo
        const field = fields.find(f => f.key === key);
        await platformContentService.createContent({
          content_key: key,
          content_value: value,
          content_type: field?.type || 'text',
          description: field?.label || null,
          is_active: true,
        });
        // Recarregar para obter o ID
        await loadContent();
      }

      setSaved(prev => ({ ...prev, [key]: true }));
      
      // Atualizar valor original após salvar
      setOriginalContents(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: 'Salvo!',
        description: `${fields.find(f => f.key === key)?.label} foi salvo com sucesso.`,
      });

      // Remover indicador de salvo após 2 segundos
      setTimeout(() => {
        setSaved(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar.',
        variant: 'destructive',
      });
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
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
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Editar Textos - {platformName}
        </h2>
        <p className="text-muted-foreground">
          Edite os textos que aparecem na página inicial. Clique em "Salvar" em cada campo para salvar as alterações.
        </p>
      </div>

      {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
        <Card key={section}>
          <CardHeader>
            <CardTitle>{section}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectionFields.map(field => {
              // Usar valor do banco, ou placeholder se não existir
              const value = contents[field.key] !== undefined 
                ? contents[field.key] 
                : (field.placeholder || '');
              const isSaving = saving[field.key];
              const isSaved = saved[field.key];

              const hasChanged = hasChanges(field.key);
              const isEmpty = !value || value.trim() === '';

              return (
                <div key={field.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex items-center gap-2">
                      {hasChanged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revertField(field.key)}
                          className="h-8"
                          title="Voltar ao valor original"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Voltar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => saveField(field.key)}
                        disabled={isSaving || !hasChanged}
                        className={cn(
                          "h-8",
                          isSaved && "bg-green-500 hover:bg-green-600",
                          !hasChanged && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isSaving ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : isSaved ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        {isSaved ? 'Salvo!' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={value}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className={cn(
                        hasChanged && "border-amber-300 bg-amber-50/50",
                        isSaved && "border-green-300 bg-green-50/50"
                      )}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      value={value}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={cn(
                        hasChanged && "border-amber-300 bg-amber-50/50",
                        isSaved && "border-green-300 bg-green-50/50"
                      )}
                    />
                  )}
                  {isEmpty && field.placeholder && (
                    <p className="text-xs text-muted-foreground italic">
                      Este campo está vazio. O valor padrão "{field.placeholder}" será usado na página.
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
