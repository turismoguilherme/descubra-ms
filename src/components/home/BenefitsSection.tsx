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
  Zap
} from 'lucide-react';

const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: BarChart3,
      title: "Decisões Baseadas em Dados",
      description: "Analytics avançados e machine learning transformam dados em insights acionáveis para decisões estratégicas inteligentes.",
      color: "travel-tech-turquoise",
      gradient: "from-travel-tech-turquoise/20 to-travel-tech-turquoise/5"
    },
    {
      icon: DollarSign,
      title: "Otimização de Receita",
      description: "IA otimiza preços, prevê demanda e identifica oportunidades para maximizar receita e eficiência operacional.",
      color: "travel-tech-ocean-blue",
      gradient: "from-travel-tech-ocean-blue/20 to-travel-tech-ocean-blue/5"
    },
    {
      icon: Leaf,
      title: "Turismo Sustentável",
      description: "Monitore impacto ambiental, gerencie fluxos para reduzir overtourism e promova práticas sustentáveis.",
      color: "travel-tech-sunset-orange",
      gradient: "from-travel-tech-sunset-orange/20 to-travel-tech-sunset-orange/5"
    },
    {
      icon: Users,
      title: "Personalização em Escala",
      description: "Recomendações personalizadas baseadas em IA para cada visitante, melhorando experiência e satisfação.",
      color: "travel-tech-turquoise",
      gradient: "from-travel-tech-turquoise/20 to-travel-tech-turquoise/5"
    },
    {
      icon: TrendingUp,
      title: "Crescimento Inteligente",
      description: "Identifique tendências, preveja mudanças no mercado e posicione seu destino à frente da concorrência.",
      color: "travel-tech-ocean-blue",
      gradient: "from-travel-tech-ocean-blue/20 to-travel-tech-ocean-blue/5"
    },
    {
      icon: Shield,
      title: "Gestão de Crises",
      description: "Monitore riscos, receba alertas inteligentes e responda rapidamente a situações críticas com suporte de IA.",
      color: "travel-tech-sunset-orange",
      gradient: "from-travel-tech-sunset-orange/20 to-travel-tech-sunset-orange/5"
    }
  ];

  const stats = [
    { value: "300%", label: "Aumento na eficiência", icon: TrendingUp },
    { value: "85%", label: "Redução de custos", icon: DollarSign },
    { value: "24/7", label: "Suporte IA", icon: Zap },
    { value: "50+", label: "Destinos atendidos", icon: Globe }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-travel-tech-dark-secondary via-travel-tech-dark-base to-travel-tech-dark-secondary relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {/* Floating Icons */}
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
              Transforme seu Turismo
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Revolucione a gestão do seu destino com inteligência artificial, 
            big data e analytics avançados
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
                
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-${benefit.color}/10 border border-${benefit.color}/20 group-hover:scale-110 group-hover:bg-${benefit.color}/20 transition-all duration-300 mb-6`}>
                  <benefit.icon className={`w-8 h-8 text-${benefit.color} group-hover:text-white transition-colors duration-300`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {benefit.description}
                </p>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-${benefit.color}/5 to-transparent pointer-events-none`} />
                
                {/* Data Flow Animation on Hover */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <motion.div
                    animate={{ x: [-50, 200] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={`absolute top-1/4 left-0 w-12 h-0.5 bg-gradient-to-r from-transparent via-${benefit.color} to-transparent`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Stats Background */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-travel-tech-turquoise/10 via-travel-tech-ocean-blue/10 to-travel-tech-sunset-orange/10 backdrop-blur-sm border border-travel-tech-turquoise/20" />
          
          <div className="relative p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-12">
              Resultados que Falam por Si
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group text-center"
                >
                  <div className="inline-flex p-4 rounded-xl bg-travel-tech-turquoise/10 border border-travel-tech-turquoise/20 group-hover:bg-travel-tech-turquoise/20 group-hover:scale-110 transition-all duration-300 mb-4">
                    <stat.icon className="w-6 h-6 text-travel-tech-turquoise" />
                  </div>
                  <div className="text-4xl font-bold text-travel-tech-turquoise mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-300 mb-8 text-lg">
            Pronto para revolucionar seu destino turístico?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-travel-tech-turquoise to-travel-tech-ocean-blue text-white font-semibold text-lg hover:from-travel-tech-ocean-blue hover:to-travel-tech-sunset-orange transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-travel-tech-turquoise/30"
          >
            <span>Começar Agora</span>
            <Zap className="ml-2 h-5 w-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;