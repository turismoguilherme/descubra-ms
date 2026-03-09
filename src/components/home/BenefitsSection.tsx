import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  Leaf, 
  Users, 
  TrendingUp, 
  Shield,
  Globe,
  Zap
} from 'lucide-react';
import { useViaJARSectionControls } from '@/hooks/useViaJARSectionControls';

const BenefitsSection: React.FC = () => {
  const { isSectionActive, getActiveMetrics, loading } = useViaJARSectionControls();

  const benefits = [
    {
      icon: BarChart3,
      title: "Decisões Estratégicas com Dados",
      description: "Analytics avançados e machine learning transformam dados turísticos em insights acionáveis para gestores públicos e empresários.",
      color: "travel-tech-turquoise",
      gradient: "from-travel-tech-turquoise/20 to-travel-tech-turquoise/5"
    },
    {
      icon: DollarSign,
      title: "Otimização de Receita Pública",
      description: "IA otimiza arrecadação, prevê demanda sazonal e identifica oportunidades para maximizar o retorno econômico do turismo.",
      color: "travel-tech-ocean-blue",
      gradient: "from-travel-tech-ocean-blue/20 to-travel-tech-ocean-blue/5"
    },
    {
      icon: Leaf,
      title: "Gestão Sustentável",
      description: "Monitore impacto ambiental, gerencie capacidade de carga e reduza overtourism com indicadores inteligentes em tempo real.",
      color: "travel-tech-sunset-orange",
      gradient: "from-travel-tech-sunset-orange/20 to-travel-tech-sunset-orange/5"
    },
    {
      icon: Users,
      title: "Inteligência de Fluxo Turístico",
      description: "Dashboards gerenciais que mapeiam fluxos de visitantes, ocupação hoteleira e comportamento do turista para planejamento estratégico.",
      color: "travel-tech-turquoise",
      gradient: "from-travel-tech-turquoise/20 to-travel-tech-turquoise/5"
    },
    {
      icon: TrendingUp,
      title: "Planejamento Preditivo",
      description: "Identifique tendências, antecipe alta temporada e posicione seu destino com previsões baseadas em big data e IA.",
      color: "travel-tech-ocean-blue",
      gradient: "from-travel-tech-ocean-blue/20 to-travel-tech-ocean-blue/5"
    },
    {
      icon: Shield,
      title: "Gestão de Crises e Riscos",
      description: "Monitore riscos em tempo real, receba alertas automatizados e coordene respostas rápidas para proteger seu destino.",
      color: "travel-tech-sunset-orange",
      gradient: "from-travel-tech-sunset-orange/20 to-travel-tech-sunset-orange/5"
    }
  ];

  const activeStats = getActiveMetrics('benefits_stats');
  const showStats = isSectionActive('benefits_stats') && activeStats.length > 0;

  const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    benefits_efficiency: TrendingUp,
    benefits_cost: DollarSign,
    benefits_ai: Zap,
    benefits_destinations: Globe
  };

  if (loading) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-travel-tech-dark-secondary via-travel-tech-dark-base to-travel-tech-dark-secondary relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 10 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 1.5
            }}
            className={`absolute text-${benefit.color}/20`}
            style={{
              left: `${10 + index * 15}%`,
              top: `${20 + (index % 3) * 25}%`
            }}
          >
            <benefit.icon className="w-12 h-12" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-travel-tech-turquoise via-travel-tech-ocean-blue to-travel-tech-sunset-orange bg-clip-text text-transparent">
              Gestão Inteligente do Turismo
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ferramentas de IA, big data e analytics para gestores públicos e 
            empresários que tomam decisões estratégicas
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className={`h-full p-8 rounded-2xl bg-gradient-to-br ${benefit.gradient} backdrop-blur-sm border border-${benefit.color}/20 hover:border-${benefit.color}/40 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-${benefit.color}/20`}>
                <div className={`inline-flex p-4 rounded-xl bg-${benefit.color}/10 border border-${benefit.color}/20 group-hover:scale-110 group-hover:bg-${benefit.color}/20 transition-all duration-300 mb-6`}>
                  <benefit.icon className={`w-8 h-8 text-${benefit.color} group-hover:text-white transition-colors duration-300`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-300 leading-relaxed">{benefit.description}</p>
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-${benefit.color}/5 to-transparent pointer-events-none`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section - Controlável via admin */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-travel-tech-turquoise/10 via-travel-tech-ocean-blue/10 to-travel-tech-sunset-orange/10 backdrop-blur-sm border border-travel-tech-turquoise/20" />
            
            <div className="relative p-12 text-center">
              <h3 className="text-3xl font-bold text-white mb-12">
                Resultados que Falam por Si
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {activeStats.map((stat, index) => {
                  const StatIcon = statIcons[stat.metric_key] || TrendingUp;
                  return (
                    <motion.div
                      key={stat.metric_key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="group text-center"
                    >
                      <div className="inline-flex p-4 rounded-xl bg-travel-tech-turquoise/10 border border-travel-tech-turquoise/20 group-hover:bg-travel-tech-turquoise/20 group-hover:scale-110 transition-all duration-300 mb-4">
                        <StatIcon className="w-6 h-6 text-travel-tech-turquoise" />
                      </div>
                      <div className="text-4xl font-bold text-travel-tech-turquoise mb-2">
                        {stat.display_value}
                      </div>
                      <div className="text-gray-300">
                        {stat.label}
                      </div>
                      {stat.is_projected && (
                        <div className="text-xs text-amber-400/70 mt-1">*Projeção</div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-300 mb-8 text-lg">
            Pronto para transformar a gestão turística da sua região?
          </p>
          <motion.a
            href="/contato"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue text-white font-semibold text-lg hover:from-travel-tech-ocean-blue hover:to-travel-tech-sunset-orange transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-travel-tech-turquoise/30"
          >
            <span>Solicitar Demonstração</span>
            <Zap className="ml-2 h-5 w-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
