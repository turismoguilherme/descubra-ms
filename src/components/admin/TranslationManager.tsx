/**
 * Translation Manager Component
 * Interface para gerenciar traduções de conteúdo
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { translationManager } from '@/services/translation/TranslationManager';
import { autoTranslationGenerator } from '@/services/translation/AutoTranslationGenerator';
import { Loader2, Globe, CheckCircle, XCircle, AlertTriangle, Bug } from 'lucide-react';

interface ContentItem {
  id: string;
  content_key: string;
  content_value: string;
  translations: Record<string, string>;
}

interface TranslationStats {
  total: number;
  translated: number;
  missing: number;
  languages: string[];
}

const TranslationManager: React.FC = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  const targetLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];

  // Carregar conteúdo e estatísticas
  const loadData = async () => {
    setLoading(true);
    try {
      // Buscar conteúdo
      const { data: contentData, error: contentError } = await supabase
        .from('institutional_content')
        .select('id, content_key, content_value')
        .not('content_value', 'is', null)
        .neq('content_value', '')
        .order('content_key');

      if (contentError) throw contentError;

      // Buscar traduções
      const { data: translationData, error: translationError } = await supabase
        .from('content_translations')
        .select('content_key, language_code, content')
        .in('language_code', targetLanguages);

      if (translationError) throw translationError;

      // Organizar dados
      const translationMap: Record<string, Record<string, string>> = {};
      translationData?.forEach(translation => {
        if (!translationMap[translation.content_key]) {
          translationMap[translation.content_key] = {};
        }
        const content = translation.content as any;
        translationMap[translation.content_key][translation.language_code] = content?.content_value || '';
      });

      const contentsWithTranslations: ContentItem[] = contentData?.map(content => ({
        id: content.id,
        content_key: content.content_key,
        content_value: content.content_value,
        translations: translationMap[content.content_key] || {}
      })) || [];

      setContents(contentsWithTranslations);

      // Calcular estatísticas
      const totalItems = contentsWithTranslations.length;
      const totalTranslations = contentsWithTranslations.reduce((acc, content) => {
        return acc + Object.keys(content.translations).length;
      }, 0);
      const maxTranslations = totalItems * targetLanguages.length;

      setStats({
        total: totalItems,
        translated: Math.floor(totalTranslations / targetLanguages.length),
        missing: totalItems - Math.floor(totalTranslations / targetLanguages.length),
        languages: targetLanguages
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados de tradução' });
    } finally {
      setLoading(false);
    }
  };

  // Gerar traduções para conteúdo sem tradução
  const generateMissingTranslations = async () => {
    setGenerating(true);
    setProgress(0);
    setMessage(null);

    try {
      const result = await autoTranslationGenerator.generateAllMissingTranslations();

      setProgress(100);
      setMessage({
        type: 'success',
        text: `Tradução concluída! ${result.translated} itens traduzidos, ${result.errors} erros.`
      });

      // Recarregar dados
      await loadData();

    } catch (error) {
      console.error('Erro na geração de traduções:', error);
      setMessage({ type: 'error', text: 'Erro ao gerar traduções' });
    } finally {
      setGenerating(false);
    }
  };

  // Verificar status das APIs
  const checkAPIStatus = async () => {
    const status = translationManager.getProvidersStatus();
    const workingProviders = status.filter(p => p.configured);

    if (workingProviders.length === 0) {
      setMessage({ type: 'error', text: 'Nenhuma API de tradução configurada!' });
    } else {
      setMessage({
        type: 'info',
        text: `APIs ativas: ${workingProviders.map(p => p.name).join(', ')}`
      });
    }
  };

  useEffect(() => {
    loadData();
    checkAPIStatus();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Gerenciador de Traduções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert className={message.type === 'error' ? 'border-red-200' : message.type === 'success' ? 'border-green-200' : 'border-blue-200'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total de conteúdos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats.translated}</div>
                  <p className="text-xs text-muted-foreground">Com tradução</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">{stats.missing}</div>
                  <p className="text-xs text-muted-foreground">Sem tradução</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.languages.length}</div>
                  <p className="text-xs text-muted-foreground">Idiomas suportados</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Atualizar Dados
            </Button>

            <Button
              onClick={generateMissingTranslations}
              disabled={generating || !stats || stats.missing === 0}
              variant="default"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Gerar Traduções Faltantes ({stats?.missing || 0})
            </Button>

            <Button
              onClick={() => {
                console.log('🐛 DEBUG: Estado atual do componente');
                console.log('Contents:', contents);
                console.log('Stats:', stats);
                console.log('APIs:', translationManager.getProvidersStatus());
                setMessage({
                  type: 'info',
                  text: 'Debug enviado para console. Abra F12 → Console para ver os dados.'
                });
              }}
              variant="outline"
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug Console
            </Button>
          </div>

          {generating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gerando traduções...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo e Traduções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contents.map((content) => (
              <div key={content.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{content.content_key}</h4>
                  <Badge variant="outline">
                    {Object.keys(content.translations).length}/{targetLanguages.length} idiomas
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  PT: {content.content_value.substring(0, 100)}
                  {content.content_value.length > 100 && '...'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {targetLanguages.map((lang) => (
                    <div key={lang} className="flex items-center gap-2 text-xs">
                      {content.translations[lang] ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-medium">{lang}:</span>
                      <span className="truncate">
                        {content.translations[lang]?.substring(0, 50) || 'Não traduzido'}
                        {content.translations[lang]?.length > 50 && '...'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationManager;
