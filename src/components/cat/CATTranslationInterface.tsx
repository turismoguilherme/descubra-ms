/**
 * CAT Translation Interface
 * Interface padronizada de tradução multilíngue para atendentes dos CATs
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SectionWrapper from '@/components/ui/SectionWrapper';
import CardBox from '@/components/ui/CardBox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Languages, 
  ArrowRight, 
  Copy, 
  CheckCircle,
  RefreshCw,
  Globe
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translationService } from '@/services/cat/translationService';
import { Translation } from '@/services/cat/translationService';

interface CATTranslationInterfaceProps {
  catId?: string;
}

const CATTranslationInterface: React.FC<CATTranslationInterfaceProps> = ({ catId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('pt-BR');
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Translation[]>([]);
  const [copied, setCopied] = useState(false);

  const languages = [
    { value: 'pt-BR', label: 'Português (BR)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' },
    { value: 'fr-FR', label: 'Français' },
    { value: 'de-DE', label: 'Deutsch' },
    { value: 'it-IT', label: 'Italiano' },
    { value: 'ja-JP', label: '日本語' },
    { value: 'ko-KR', label: '한국어' },
    { value: 'zh-CN', label: '中文' }
  ];

  useEffect(() => {
    loadTranslationHistory();
  }, [user, catId]);

  const loadTranslationHistory = async () => {
    if (!user?.id) return;

    try {
      const translations = await translationService.getTranslations({
        attendant_id: user.id,
        cat_id: catId
      });
      setTranslationHistory(translations);
    } catch (error) {
      console.error('Erro ao carregar histórico de traduções:', error);
    }
  };

  const handleTranslate = async () => {
    if (!originalText.trim() || !user?.id) return;

    setIsTranslating(true);

    try {
      const result = await translationService.translateText(
        originalText,
        sourceLanguage,
        targetLanguage
      );

      setTranslatedText(result.translated_text);

      // Salvar tradução no Supabase
      try {
        await translationService.saveTranslation({
          attendant_id: user.id,
          cat_id: catId,
          original_text: originalText,
          translated_text: result.translated_text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          confidence_score: result.confidence_score,
          translation_provider: 'mock'
        });

        toast({
          title: 'Sucesso',
          description: 'Tradução realizada e salva'
        });

        await loadTranslationHistory();
      } catch (saveError) {
        console.error('Erro ao salvar tradução:', saveError);
        // Continuar mesmo se falhar ao salvar
      }
    } catch (error) {
      console.error('Erro ao traduzir:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível traduzir o texto',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copiado',
        description: 'Texto traduzido copiado para a área de transferência'
      });
    }
  };

  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    const tempText = originalText;
    setOriginalText(translatedText);
    setTranslatedText(tempText);
  };

  return (
    <div className="space-y-6">
      {/* Interface de Tradução */}
      <SectionWrapper 
        variant="default" 
        title="Tradução Automática Multilíngue"
        subtitle="Traduza textos em tempo real para múltiplos idiomas"
        actions={
          <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
            <Globe className="h-4 w-4 mr-2 inline" />
            {languages.find(l => l.value === sourceLanguage)?.label} → {languages.find(l => l.value === targetLanguage)?.label}
          </Badge>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Idioma de Origem */}
          <div>
            <Label htmlFor="source-language">Idioma de Origem</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="source-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Idioma de Destino */}
          <div>
            <Label htmlFor="target-language">Idioma de Destino</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="target-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Texto Original */}
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="original-text">Texto Original</Label>
              <Badge className="bg-slate-100 text-slate-700 text-xs">
                {languages.find(l => l.value === sourceLanguage)?.label}
              </Badge>
            </div>
            <Textarea
              id="original-text"
              placeholder="Digite o texto a ser traduzido..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {originalText.length} caracteres
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={swapLanguages}
                className="text-xs"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                Trocar
              </Button>
            </div>
          </CardBox>

          {/* Texto Traduzido */}
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="translated-text">Texto Traduzido</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700 text-xs">
                  {languages.find(l => l.value === targetLanguage)?.label}
                </Badge>
                {translatedText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 px-2"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              id="translated-text"
              placeholder="A tradução aparecerá aqui..."
              value={translatedText}
              readOnly
              rows={8}
              className="resize-none bg-slate-50"
            />
            <div className="mt-3">
              <span className="text-xs text-slate-500">
                {translatedText.length} caracteres
              </span>
            </div>
          </CardBox>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !originalText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isTranslating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Traduzindo...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 mr-2" />
                Traduzir
              </>
            )}
          </Button>
        </div>
      </SectionWrapper>

      {/* Histórico de Traduções */}
      {translationHistory.length > 0 && (
        <SectionWrapper 
          variant="default" 
          title="Histórico de Traduções"
          subtitle={`${translationHistory.length} tradução(ões) realizada(s)`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {translationHistory.slice(0, 9).map((translation) => (
              <CardBox key={translation.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {translation.source_language}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {translation.target_language}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-2 line-clamp-2">
                      {translation.original_text}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {translation.translated_text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    {new Date(translation.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  {translation.confidence_score && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {Math.round(translation.confidence_score * 100)}%
                    </Badge>
                  )}
                </div>
              </CardBox>
            ))}
          </div>
        </SectionWrapper>
      )}
    </div>
  );
};

export default CATTranslationInterface;













