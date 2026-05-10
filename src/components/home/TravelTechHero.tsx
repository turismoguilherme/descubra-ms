import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Users, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { platformContentService } from '@/services/admin/platformContentService';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';
import GuataHeroMascot from '@/components/guata-labs/GuataHeroMascot';

const TravelTechHero = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { isSectionActive, getActiveMetrics, loading: controlsLoading } = useViaJARSectionControls();
  const { brandName, brandTagline } = useGuataLabsContent();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contents = await platformContentService.getContentByPrefix('viajar_hero_');
      const contentMap: Record<string, string> = {};
      contents.forEach((item) => {
        contentMap[item.content_key] = item.content_value || '';
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Erro ao carregar conteúdo do hero:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (key: string, fallback: string = '') => {
    return content[key] || fallback;
  };

  const showStats = isSectionActive('hero_stats');
  const activeStats = getActiveMetrics('hero_stats');

  const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    hero_users: Users,
    hero_satisfaction: TrendingUp,
    hero_ai: Zap,
  };

  if (loading || controlsLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-guata-paper">
        <div className="animate-pulse text-guata-forest">
          <div className="w-8 h-8 border-2 border-guata-forest border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-guata-cream via-guata-paper to-guata-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, hsl(var(--guata-gold) / 0.15), transparent 45%),
            radial-gradient(circle at 80% 10%, hsl(var(--guata-forest) / 0.08), transparent 40%)`,
        }}
      />

      <div className="relative z-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="space-y-6 lg:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="inline-flex items-center px-5 py-2.5 rounded-full border border-guata-gold/40 bg-white shadow-sm"
              >
                <span className="text-guata-forest font-semibold text-sm tracking-wide font-guata">
                  {brandName} · {brandTagline}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-guata leading-tight text-guata-deep"
              >
                <span className="bg-gradient-to-r from-guata-forest via-guata-deep to-guata-forest bg-clip-text text-transparent">
                  {getContent('viajar_hero_title', 'Guatá Labs — IA que transforma a gestão do turismo')}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
                className="text-lg md:text-xl text-guata-bark/90 leading-relaxed max-w-2xl"
              >
                {getContent(
                  'viajar_hero_subtitle',
                  'Plataforma de inteligência artificial para secretarias de turismo, empresários e gestores públicos.'
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/viajar/login"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-guata-forest text-guata-cream font-semibold text-lg hover:bg-guata-deep transition-all duration-300 shadow-lg shadow-guata-forest/20"
                >
                  <span>{getContent('viajar_hero_cta_primary', 'Acessar Plataforma')}</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>

                <Link
                  to="/contato"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-guata-gold/60 text-guata-deep font-semibold text-lg hover:bg-guata-gold/15 transition-all duration-300 bg-white/60 backdrop-blur-sm"
                >
                  <Play className="mr-2 h-5 w-5 text-guata-forest" />
                  <span>{getContent('viajar_hero_cta_secondary', 'Solicitar Demonstração')}</span>
                </Link>
              </motion.div>

              {showStats && activeStats.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.45 }}
                  className="grid grid-cols-3 gap-5 pt-6"
                >
                  {activeStats.map((stat) => {
                    const StatIcon = statIcons[stat.metric_key] || TrendingUp;
                    return (
                      <div key={stat.metric_key} className="text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-guata-gold/15 border border-guata-gold/30">
                          <StatIcon className="w-6 h-6 text-guata-forest" />
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-guata-deep mb-1">{stat.display_value}</div>
                        <div className="text-xs md:text-sm text-guata-bark/80">{stat.label}</div>
                        {stat.is_projected && (
                          <div className="text-[10px] text-guata-gold mt-1">*Projeção</div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>

            <GuataHeroMascot />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelTechHero;
