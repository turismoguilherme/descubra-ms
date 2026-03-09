import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3, Brain, TrendingUp, Zap } from 'lucide-react';
import GlassmorphismCard from './GlassmorphismCard';

const PlatformInActionSection: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const demoData = [
    {
      title: "Analytics em Tempo Real",
      description: "Visualize fluxos de visitantes, ocupação e tendências instantaneamente",
      icon: BarChart3,
      gradient: "from-travel-tech-turquoise/20 to-travel-tech-ocean-blue/20"
    },
    {
      title: "IA Conversacional",
      description: "Chatbot inteligente responde dúvidas sobre destinos e experiências",
      icon: Brain,
      gradient: "from-travel-tech-ocean-blue/20 to-travel-tech-sunset-orange/20"
    },
    {
      title: "Previsões Inteligentes",
      description: "Machine learning prevê demanda e otimiza recursos automaticamente",
      icon: TrendingUp,
      gradient: "from-travel-tech-sunset-orange/20 to-travel-tech-turquoise/20"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % demoData.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-br from-travel-tech-dark-base via-travel-tech-dark-secondary to-travel-tech-dark-base relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Data Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              x: [-50, window.innerWidth + 50],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight]
            }}
            transition={{ 
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-travel-tech-turquoise rounded-full"
          />
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
              Plataforma em Ação
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Veja como nossa inteligência artificial transforma dados em insights acionáveis 
            para revolucionar a gestão do turismo
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Interactive Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Dashboard Container */}
            <div className="relative p-8 rounded-2xl bg-travel-tech-dark-secondary/40 backdrop-blur-md border border-travel-tech-turquoise/20 shadow-2xl">
              
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-travel-tech-turquoise/20">
                <h3 className="text-xl font-bold text-white">Dashboard Travel Analytics</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-travel-tech-turquoise animate-pulse" />
                  <span className="text-sm text-travel-tech-turquoise">Live</span>
                </div>
              </div>

              {/* Real-time Data Visualization */}
              <div className="space-y-6">
                
                {/* Visitor Flow Heatmap */}
                <div className="p-4 rounded-xl bg-travel-tech-turquoise/10 border border-travel-tech-turquoise/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-travel-tech-turquoise font-semibold">Fluxo de Visitantes</span>
                    <TrendingUp className="w-4 h-4 text-travel-tech-turquoise" />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[...Array(35)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          backgroundColor: [
                            'rgba(6, 214, 160, 0.2)',
                            'rgba(17, 138, 178, 0.4)',
                            'rgba(255, 107, 53, 0.3)',
                            'rgba(6, 214, 160, 0.2)'
                          ],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                        className="aspect-square rounded-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Occupancy Predictions */}
                <div className="p-4 rounded-xl bg-travel-tech-ocean-blue/10 border border-travel-tech-ocean-blue/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-travel-tech-ocean-blue font-semibold">Previsão de Ocupação</span>
                    <Brain className="w-4 h-4 text-travel-tech-ocean-blue" />
                  </div>
                  <div className="flex items-end space-x-2 h-16">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: ['20%', '80%', '40%', '90%', '30%']
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                        className="flex-1 bg-travel-tech-ocean-blue/60 rounded-t-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* AI Chat Preview */}
                <div className="p-4 rounded-xl bg-travel-tech-sunset-orange/10 border border-travel-tech-sunset-orange/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-travel-tech-sunset-orange font-semibold">IA Conversacional</span>
                    <Brain className="w-4 h-4 text-travel-tech-sunset-orange" />
                  </div>
                  <div className="space-y-2">
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-travel-tech-sunset-orange/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-travel-tech-sunset-orange" />
                      </div>
                      <div className="text-xs text-gray-300 bg-travel-tech-dark-base/40 rounded-lg px-2 py-1">
                        Qual o melhor horário para visitar?
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="flex items-start space-x-2 justify-end"
                    >
                      <div className="text-xs text-travel-tech-sunset-orange bg-travel-tech-sunset-orange/20 rounded-lg px-2 py-1 max-w-32">
                        Baseado nos dados, recomendo entre 8h-10h...
                      </div>
                      <Zap className="w-6 h-6 text-travel-tech-sunset-orange" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Data Flow Animation */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                <motion.div
                  animate={{ x: [-100, 400] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/4 left-0 w-20 h-0.5 bg-gradient-to-r from-transparent via-travel-tech-turquoise to-transparent"
                />
                <motion.div
                  animate={{ x: [400, -100] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 }}
                  className="absolute bottom-1/4 right-0 w-20 h-0.5 bg-gradient-to-r from-transparent via-travel-tech-ocean-blue to-transparent"
                />
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-4 rounded-xl bg-travel-tech-turquoise/20 backdrop-blur-sm border border-travel-tech-turquoise/30"
            >
              <BarChart3 className="w-6 h-6 text-travel-tech-turquoise" />
            </motion.div>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {demoData.map((demo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  activeDemo === index 
                    ? 'border-travel-tech-turquoise/40 bg-travel-tech-turquoise/10 shadow-lg shadow-travel-tech-turquoise/20' 
                    : 'border-travel-tech-turquoise/20 bg-travel-tech-turquoise/5 hover:border-travel-tech-turquoise/30'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    activeDemo === index 
                      ? 'bg-travel-tech-turquoise/20 scale-110' 
                      : 'bg-travel-tech-turquoise/10'
                  }`}>
                    <demo.icon className={`w-6 h-6 transition-colors duration-300 ${
                      activeDemo === index ? 'text-travel-tech-turquoise' : 'text-travel-tech-turquoise/70'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                      activeDemo === index ? 'text-white' : 'text-gray-200'
                    }`}>
                      {demo.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {demo.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Video/Demo Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <button className="group flex items-center justify-center w-full p-4 rounded-xl border-2 border-travel-tech-turquoise/50 text-travel-tech-turquoise hover:bg-travel-tech-turquoise hover:text-travel-tech-dark-base transition-all duration-300 backdrop-blur-sm">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">Ver Demonstração Completa</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlatformInActionSection;