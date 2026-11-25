import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ShieldCheck, TrendingUp, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { platformContentService } from '@/services/admin/platformContentService';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';
import GuataHeroStatusPanel from '@/components/home/guata/GuataHeroStatusPanel';

const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hero_users: Users,
  hero_satisfaction: TrendingUp,
  hero_ai: Zap,
};

export default function TravelTechHero() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { isSectionActive, getActiveMetrics, loading: controlsLoading } = useViaJARSectionControls();
  const { brandName } = useGuataLabsContent();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const contents = await platformContentService.getContentByPrefix('viajar_hero_');
        const contentMap: Record<string, string> = {};
        contents.forEach((item) => { contentMap[item.content_key] = item.content_value || ''; });
        setContent(contentMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdo do hero:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  const getContent = (key: string, fallback = '') => content[key] || fallback;
  const cmsTitle = getContent('viajar_hero_title', 'Guatá Labs');
  const isBrandOnlyTitle = /^guat[áa]\s+labs[.\s]*$/i.test(cmsTitle.trim());
  const activeStats = getActiveMetrics('hero_stats');
  const primaryCmsCta = getContent('viajar_hero_cta_primary');
  const secondaryCmsCta = getContent('viajar_hero_cta_secondary');
  const primaryCta = !primaryCmsCta || /acessar plataforma|começar agora/i.test(primaryCmsCta)
    ? 'Solicitar demonstração'
    : primaryCmsCta;
  const secondaryCta = !secondaryCmsCta || /agendar demo|solicitar demonstração/i.test(secondaryCmsCta)
    ? 'Conheça o método'
    : secondaryCmsCta;

  if (loading || controlsLoading) {
    return (
      <section className="flex min-h-[760px] items-center justify-center bg-guata-deep">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-guata-gold border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-guata-deep text-guata-cream">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 12% 24%, hsl(var(--guata-forest) / 0.75), transparent 42%),
            radial-gradient(circle at 88% 22%, hsl(var(--guata-gold) / 0.16), transparent 34%),
            linear-gradient(hsl(var(--guata-cream) / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--guata-cream) / 0.035) 1px, transparent 1px)`,
          backgroundSize: 'auto, auto, 72px 72px, 72px 72px',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36 lg:px-8 lg:pb-20 lg:pt-40">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-guata-gold/25 bg-guata-gold/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-guata-gold" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-guata-gold-light">{brandName} · Inteligência para turismo</span>
            </div>

            <h1 className="max-w-3xl font-guata text-5xl font-semibold leading-[1.04] tracking-[-0.035em] text-guata-cream sm:text-6xl lg:text-[4.4rem]">
              {isBrandOnlyTitle ? (
                <>Inteligência que transforma <span className="font-playfair font-medium italic text-guata-gold-light">turismo em desenvolvimento.</span></>
              ) : cmsTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-guata-cream/70 sm:text-xl">
              {getContent('viajar_hero_subtitle', 'Dados, inteligência artificial e experiências conectadas para apoiar decisões de gestores públicos e empresas do turismo.')}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/contato" className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-guata-gold px-7 font-semibold text-guata-deep shadow-lg transition-colors hover:bg-guata-gold-light">
                {primaryCta}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#metodo" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-guata-cream/20 bg-guata-cream/[0.04] px-7 font-semibold text-guata-cream transition-colors hover:bg-guata-cream/10">
                {secondaryCta}
                <ArrowDown className="h-4 w-4 text-guata-gold-light" />
              </a>
            </div>

            {isSectionActive('hero_stats') && activeStats.length > 0 && (
              <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
                {activeStats.map((stat) => {
                  const StatIcon = statIcons[stat.metric_key] || TrendingUp;
                  return (
                    <div key={stat.metric_key} className="flex items-center gap-3">
                      <StatIcon className="h-5 w-5 text-guata-gold-light" />
                      <div><p className="font-guata text-xl font-semibold">{stat.display_value}</p><p className="text-xs text-guata-cream/55">{stat.label}{stat.is_projected ? ' · Projeção' : ''}</p></div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
          <GuataHeroStatusPanel />
        </div>

        <div className="mt-16 grid gap-5 border-t border-guata-cream/10 pt-7 text-sm text-guata-cream/60 sm:grid-cols-3">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-guata-gold-light" /> Gestão pública e iniciativa privada</div>
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-guata-gold-light" /> Tecnologia aplicada ao território</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-guata-gold-light" /> Privacidade e controle de dados</div>
        </div>
      </div>
    </section>
  );
}
