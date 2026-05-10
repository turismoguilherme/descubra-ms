import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Sparkles, Globe, MessageSquare, Zap } from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';

const KodaMarketingSection = () => {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_koda_');
      const contentMap: Record<string, string> = {};
      contents.forEach(item => {
        contentMap[item.content_key] = item.content_value || '';
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    }
  };

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-guata-cream via-guata-paper to-guata-cream relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-guata-gold/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-guata-forest/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-guata-deep">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-guata-gold/30 mb-6">
              <Sparkles className="h-4 w-4 text-guata-gold" />
              <span className="text-sm font-medium text-guata-deep">
                {getContent('viajar_koda_badge', 'Nova Funcionalidade')}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-guata mb-6 text-guata-deep">
              {getContent('viajar_koda_title', 'Experimente Nossa IA Conversacional')}
            </h2>

            {/* Description */}
            {getContent('viajar_koda_description') && (
              <p className="text-lg text-guata-bark/85 mb-8 leading-relaxed">
                {getContent('viajar_koda_description', 'Koda é seu assistente inteligente especializado em turismo. Converse naturalmente e receba respostas precisas baseadas em informações atualizadas da web.')}
              </p>
            )}

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-guata-gold/15 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-guata-forest" />
                </div>
                <span className="text-guata-deep/95">
                  {getContent('viajar_koda_feature_1', 'Respostas inteligentes em tempo real')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-guata-gold/15 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-guata-forest" />
                </div>
                <span className="text-guata-deep/95">
                  {getContent('viajar_koda_feature_2', 'Informações atualizadas via busca web')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-guata-gold/15 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-guata-forest" />
                </div>
                <span className="text-guata-deep/95">
                  {getContent('viajar_koda_feature_3', 'Suporte multi-idioma (EN, FR, PT, ES)')}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Link to="/koda">
              <Button 
                size="lg" 
                className="bg-guata-forest hover:bg-guata-deep text-guata-cream font-semibold px-8 h-14 text-lg gap-2 shadow-lg shadow-guata-forest/20"
              >
                <Bot className="h-5 w-5" />
                {getContent('viajar_koda_button', 'Conversar com Koda')}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-guata-deep to-guata-forest border border-guata-gold/30 flex items-center justify-center p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-guata-gold to-guata-forest flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Bot className="h-12 w-12 text-guata-cream" />
                </div>
                <h3 className="text-2xl font-bold font-guata text-guata-cream mb-2">Koda</h3>
                <p className="text-guata-cream/75 text-sm">Assistente IA para Turismo</p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-guata-gold/15 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl bg-guata-forest/15 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default KodaMarketingSection;

