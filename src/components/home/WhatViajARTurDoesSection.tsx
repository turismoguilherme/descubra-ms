import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';

interface ViajarProduct {
  id: string;
  title: string;
  short_description: string | null;
  image_url: string | null;
  icon_name: string | null;
  gradient_colors: string | null;
  display_order: number;
  is_active: boolean;
  cta_text: string | null;
  cta_link: string | null;
}

const WhatViajARTurDoesSection = () => {
  const [products, setProducts] = useState<ViajarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});
  useEffect(() => {
    loadProducts();
    loadContent();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('viajar_products')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(4); // Apenas 4 produtos principais

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_what_');
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

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return LucideIcons.Package;
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Package;
    return IconComponent;
  };

  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-guata-forest" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-guata-cream to-guata-paper relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--guata-forest) / 0.08) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--guata-forest) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-guata mb-4">
            <span className="bg-gradient-to-r from-guata-forest via-guata-deep to-guata-forest bg-clip-text text-transparent">
              {getContent('viajar_what_title', 'O que a Guatá Labs faz')}
            </span>
          </h2>
          <p className="text-xl text-guata-bark/85 max-w-3xl mx-auto">
            Soluções completas de tecnologia para revolucionar a gestão do turismo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const IconComponent = getIconComponent(product.icon_name);
            const gradient = product.gradient_colors || 'from-guata-gold/25 to-guata-forest/20';
            const ctaLink = product.cta_link || '/solucoes';
            const ctaText = product.cta_text || 'Saiba mais';

            return (
              <Link
                key={product.id}
                to={ctaLink}
                className="group block"
              >
                <div className="relative h-[380px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border border-guata-gold/25 hover:border-guata-gold/45 transition-all duration-500 transform hover:-translate-y-2 bg-white/75 backdrop-blur-sm">
                  
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`} />
                  
                  {/* Imagem de fundo (se disponível) */}
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-guata-deep/88 via-guata-deep/35 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col p-6 text-guata-cream">
                    {/* Icon */}
                    <div className="mb-auto">
                      <div className="w-16 h-16 rounded-xl bg-guata-gold/20 backdrop-blur-sm border border-guata-gold/35 flex items-center justify-center group-hover:scale-110 group-hover:bg-guata-gold/30 transition-all duration-300">
                        <IconComponent className="h-8 w-8 text-guata-gold-light" />
                      </div>
                    </div>

                    {/* Short Description */}
                    {product.short_description && (
                      <p className="text-guata-cream/85 text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        {product.short_description}
                      </p>
                    )}

                    <h3 className="text-2xl font-bold font-guata mb-4 drop-shadow-lg group-hover:translate-x-1 transition-transform duration-300 text-white">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2 text-guata-gold font-semibold text-sm opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 mt-auto">
                      <span>{ctaText}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Neon Glow on Hover */}
                  <div className="absolute inset-0 rounded-2xl border border-guata-gold/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-guata-gold to-transparent animate-data-flow" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatViajARTurDoesSection;

