import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  DollarSign,
  Leaf,
  Users,
  TrendingUp,
  Shield,
  Globe,
  Zap,
} from 'lucide-react';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';

type Benefit = {
  icon: typeof BarChart3;
  title: string;
  description: string;
  cardClass: string;
  iconWrapClass: string;
  iconClass: string;
};

const BenefitsSection: React.FC = () => {
  const { isSectionActive, getActiveMetrics, loading } = useViaJARSectionControls();

  const benefits: Benefit[] = [
    {
      icon: BarChart3,
      title: 'Decisões Estratégicas com Dados',
      description:
        'Analytics avançados e machine learning transformam dados turísticos em insights acionáveis para gestores públicos e empresários.',
      cardClass:
        'bg-white/95 border-guata-gold/30 hover:border-guata-gold/50 shadow-sm hover:shadow-md hover:-translate-y-1',
      iconWrapClass: 'bg-guata-gold/15 border-guata-gold/30',
      iconClass: 'text-guata-forest',
    },
    {
      icon: DollarSign,
      title: 'Otimização de Receita Pública',
      description:
        'IA otimiza arrecadação, prevê demanda sazonal e identifica oportunidades para maximizar o retorno econômico do turismo.',
      cardClass:
        'bg-white/95 border-guata-forest/25 hover:border-guata-forest/45 shadow-sm hover:shadow-md hover:-translate-y-1',
      iconWrapClass: 'bg-guata-forest/10 border-guata-forest/25',
      iconClass: 'text-guata-forest',
    },
    {
      icon: Leaf,
      title: 'Gestão Sustentável',
      description:
        'Monitore impacto ambiental, gerencie capacidade de carga e reduza overtourism com indicadores inteligentes em tempo real.',
      cardClass:
        'bg-white/95 border-guata-gold/30 hover:border-guata-gold/50 shadow-sm hover:shadow-md hover:-translate-y-1',
      iconWrapClass: 'bg-guata-gold/15 border-guata-gold/30',
      iconClass: 'text-guata-forest',
    },
    {
      icon: Users,
      title: 'Inteligência de Fluxo Turístico',
      description:
        'Dashboards gerenciais que mapeiam fluxos de visitantes, ocupação hoteleira e comportamento do turista para planejamento estratégico.',
      cardClass:
        'bg-white/95 border-guata-forest/25 hover:border-guata-forest/45 shadow-sm hover:shadow-md hover:-translate-y-1',
      iconWrapClass: 'bg-guata-forest/10 border-guata-forest/25',
      iconClass: 'text-guata-forest',
    },
    {
      icon: TrendingUp,
      title: 'Planejamento Preditivo',
      description:
        'Identifique tendências, antecipe alta temporada e posicione seu destino com previsões baseadas em big data e IA.',
      cardClass:
        'bg-white/95 border-guata-gold/30 hover:border-guata-gold/50 shadow-sm hover:shadow-md hover:-translate-y-1',
      iconWrapClass: 'bg-guata-gold/15 border-guata-gold/30',
      iconClass: 'text-guata-forest',
    },
    {
      icon: Shield,
      title: 'Gestão de Crises e Riscos',
      description:
        'Monitore riscos em tempo real, receba alertas automatizados e coordene respostas rápidas para proteger seu destino.',
      cardClass:
        'bg-white/95 border-guata-forest/25 hover:border-guata-forest/45 shadow-sm hover:shadow-md hover:-translate-y-1',
      iconWrapClass: 'bg-guata-forest/10 border-guata-forest/25',
      iconClass: 'text-guata-forest',
    },
  ];

  const activeStats = getActiveMetrics('benefits_stats');
  const showStats = isSectionActive('benefits_stats') && activeStats.length > 0;

  const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    benefits_efficiency: TrendingUp,
    benefits_cost: DollarSign,
    benefits_ai: Zap,
    benefits_destinations: Globe,
  };

  if (loading) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-guata-paper via-guata-cream to-guata-paper relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-guata mb-4 text-guata-deep">
            Gestão inteligente do turismo
          </h2>
          <p className="text-lg md:text-xl text-guata-bark/85 max-w-3xl mx-auto">
            Ferramentas de IA, big data e analytics para gestores públicos e empresários
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div
                className={`h-full p-8 rounded-2xl border transition-all duration-300 ${benefit.cardClass}`}
              >
                <div
                  className={`inline-flex p-4 rounded-xl border mb-5 transition-transform duration-300 group-hover:scale-105 ${benefit.iconWrapClass}`}
                >
                  <benefit.icon className={`w-8 h-8 ${benefit.iconClass}`} />
                </div>
                <h3 className="text-xl font-bold font-guata text-guata-deep mb-3">{benefit.title}</h3>
                <p className="text-guata-bark/85 leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-guata-gold/30 bg-white p-10 md:p-12 shadow-sm"
          >
            <h3 className="text-2xl md:text-3xl font-extrabold font-guata text-guata-deep mb-10 text-center">
              Resultados que falam por si
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeStats.map((stat, index) => {
                const StatIcon = statIcons[stat.metric_key] || TrendingUp;
                return (
                  <motion.div
                    key={stat.metric_key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    viewport={{ once: true }}
                    className="group text-center"
                  >
                    <div className="inline-flex p-4 rounded-xl bg-guata-gold/12 border border-guata-gold/25 mb-3">
                      <StatIcon className="w-6 h-6 text-guata-forest" />
                    </div>
                    <div className="text-3xl font-bold text-guata-deep mb-1">{stat.display_value}</div>
                    <div className="text-guata-bark/80 text-sm">{stat.label}</div>
                    {stat.is_projected && (
                      <div className="text-xs text-guata-gold mt-1">*Projeção</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default BenefitsSection;
