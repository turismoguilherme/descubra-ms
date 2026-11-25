import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2, Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { platformContentService } from '@/services/admin/platformContentService';

interface ViajarProduct {
  id: string;
  title: string;
  short_description: string | null;
  image_url: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  cta_text: string | null;
  cta_link: string | null;
}

const platformSolutions: ViajarProduct[] = [
  { id: 'ia-conversacional', title: 'IA Conversacional', short_description: 'Atendimento inteligente para apoiar visitantes, equipes e negócios do turismo.', image_url: null, icon_name: 'Brain', display_order: 1, is_active: true, cta_text: 'Conhecer solução', cta_link: '/solucoes#ia-conversacional' },
  { id: 'market-intelligence', title: 'Market Intelligence', short_description: 'Informações de mercado organizadas para apoiar estratégia e posicionamento.', image_url: null, icon_name: 'BarChart3', display_order: 2, is_active: true, cta_text: 'Conhecer solução', cta_link: '/solucoes#market-intelligence' },
  { id: 'inventario-turistico', title: 'Inventário Turístico', short_description: 'Cadastro e gestão dos atrativos que formam a identidade do destino.', image_url: null, icon_name: 'Map', display_order: 3, is_active: true, cta_text: 'Conhecer solução', cta_link: '/solucoes#inventario-turistico' },
  { id: 'gestao-cats', title: 'Gestão de CATs', short_description: 'Rotinas e informações dos Centros de Atendimento ao Turista em um só lugar.', image_url: null, icon_name: 'Building2', display_order: 4, is_active: true, cta_text: 'Conhecer solução', cta_link: '/solucoes#gestao-cats' },
];

export default function WhatGuataLabsDoesSection() {
  const [products, setProducts] = useState<ViajarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSection = async () => {
      try {
        const [{ data, error }, contents] = await Promise.all([
          supabase.from('viajar_products').select('*').eq('is_active', true).order('display_order', { ascending: true }).limit(4),
          platformContentService.getContentByPrefix('viajar_what_'),
        ]);
        if (error) throw error;
        setProducts(data?.length ? data : platformSolutions);
        const contentMap: Record<string, string> = {};
        contents.forEach((item) => { contentMap[item.content_key] = item.content_value || ''; });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar soluções Guatá Labs:', error);
        setProducts(platformSolutions);
      } finally {
        setLoading(false);
      }
    };
    loadSection();
  }, []);

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Package;
    return (LucideIcons as unknown as Record<string, typeof Package>)[iconName] || Package;
  };

  if (loading) {
    return (
      <section className="bg-guata-paper py-24">
        <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-guata-forest" /></div>
      </section>
    );
  }

  return (
    <section className="bg-guata-paper py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end"
        >
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-guata-forest">Soluções conectadas</p>
            <h2 className="font-guata text-4xl font-bold leading-tight text-guata-deep sm:text-5xl">
              {content.viajar_what_title || 'Tecnologia para cada frente do turismo'}
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-guata-bark/75 lg:justify-self-end">
            Uma plataforma modular para apoiar a gestão do destino, a operação dos negócios e a experiência de quem visita.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product, index) => {
            const IconComponent = getIconComponent(product.icon_name);
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
              >
                <Link
                  to={product.cta_link || '/solucoes'}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-guata-forest/10 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-guata-gold/40 hover:shadow-xl"
                >
                  {product.image_url && (
                    <div className="h-48 overflow-hidden bg-guata-paper">
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-7 sm:p-8">
                    <div className="mb-6 flex items-start justify-between gap-5">
                      <div className="rounded-xl border border-guata-gold/25 bg-guata-gold/10 p-3">
                        <IconComponent className="h-6 w-6 text-guata-forest" />
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-guata-gold transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </div>
                    <h3 className="mb-3 font-guata text-2xl font-semibold text-guata-deep">{product.title}</h3>
                    {product.short_description && (
                      <p className="mb-7 leading-relaxed text-guata-bark/75">{product.short_description}</p>
                    )}
                    <span className="mt-auto text-sm font-semibold text-guata-forest">
                      {product.cta_text || 'Conhecer solução'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
