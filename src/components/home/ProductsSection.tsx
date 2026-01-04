import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Loader2, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { platformContentService } from '@/services/admin/platformContentService';

interface ViajarProduct {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  video_url: string | null;
  icon_name: string | null;
  gradient_colors: string | null;
  display_order: number;
  is_active: boolean;
  cta_text: string | null;
  cta_link: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const ProductsSection = () => {
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
        .limit(6); // Limitar a 6 produtos

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
      const contents = await platformContentService.getContentByPrefix('viajar_');
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
            <Loader2 className="h-8 w-8 animate-spin text-viajar-cyan" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Não exibir seção se não houver produtos
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {getContent('viajar_features_title', 'Soluções Inteligentes')}
          </h2>
          {getContent('viajar_features_subtitle') && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {getContent('viajar_features_subtitle', 'Tecnologia de ponta para transformar a gestão do turismo')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const IconComponent = getIconComponent(product.icon_name);
            const gradient = product.gradient_colors || 'from-purple-500 to-violet-600';
            const ctaLink = product.cta_link || '/solucoes';
            const ctaText = product.cta_text || 'Saiba mais';

            return (
              <Link
                key={product.id}
                to={ctaLink}
                className="group block"
              >
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  {/* Gradiente de fundo (sempre presente) */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                  
                  {/* Imagem de fundo (se disponível) */}
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        // Esconder imagem se falhar, gradiente já está de fundo
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Overlay escuro para contraste (apenas se tiver imagem) */}
                  {product.image_url && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  )}

                  {/* Conteúdo */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    {/* Ícone (se não tiver imagem ou como overlay) */}
                    {!product.image_url && (
                      <div className="absolute top-6 right-6">
                        <div className={`w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold mb-2 drop-shadow-lg group-hover:translate-x-1 transition-transform duration-300">
                      {product.title}
                    </h3>
                    
                    {product.short_description && (
                      <p className="text-white/90 text-sm leading-relaxed mb-4 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-white font-semibold text-sm opacity-80 group-hover:opacity-100 transition-all duration-300">
                      <span>{ctaText}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
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

export default ProductsSection;

