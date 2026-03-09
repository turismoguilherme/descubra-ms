import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3, Brain, TrendingUp, Zap } from 'lucide-react';

const PlatformInActionSection: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  const demoData = [
    {
      title: "Dashboard Gerencial em Tempo Real",
      description: "Visualize fluxos de visitantes, ocupação hoteleira e indicadores de desempenho para secretarias e gestores públicos",
      icon: BarChart3,
    },
    {
      title: "IA Consultora para Gestores",
      description: "Consulte a IA sobre tendências de mercado, sazonalidade e estratégias de marketing turístico regional",
      icon: Brain,
    },
    {
      title: "Previsões de Demanda",
      description: "Machine learning prevê fluxo turístico, ocupação e receita para planejamento orçamentário e logístico",
      icon: TrendingUp,
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
      {/* Background Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [0, -100],
            }}
            transition={{ 
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-travel-tech-turquoise rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
            Veja como gestores públicos e empresários usam a ViajARTur para 
            tomar decisões estratégicas baseadas em dados
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative p-8 rounded-2xl bg-travel-tech-dark-secondary/40 backdrop-blur-md border border-travel-tech-turquoise/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-travel-tech-turquoise/20">
                <h3 className="text-xl font-bold text-white">Painel do Gestor</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-travel-tech-turquoise animate-pulse" />
                  <span className="text-sm text-travel-tech-turquoise">Ao Vivo</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Visitor Flow */}
                <div className="p-4 rounded-xl bg-travel-tech-turquoise/10 border border-travel-tech-turquoise/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-travel-tech-turquoise font-semibold">Fluxo Turístico Regional</span>
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
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                        className="aspect-square rounded-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Occupancy */}
                <div className="p-4 rounded-xl bg-travel-tech-ocean-blue/10 border border-travel-tech-ocean-blue/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-travel-tech-ocean-blue font-semibold">Previsão de Ocupação Hoteleira</span>
                    <Brain className="w-4 h-4 text-travel-tech-ocean-blue" />
                  </div>
                  <div className="flex items-end space-x-2 h-16">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['20%', '80%', '40%', '90%', '30%'] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                        className="flex-1 bg-travel-tech-ocean-blue/60 rounded-t-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* AI Chat for Managers */}
                <div className="p-4 rounded-xl bg-travel-tech-sunset-orange/10 border border-travel-tech-sunset-orange/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-travel-tech-sunset-orange font-semibold">Consultor IA para Gestores</span>
                    <Brain className="w-4 h-4 text-travel-tech-sunset-orange" />
                  </div>
                  <div className="space-y-2">
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-travel-tech-sunset-orange/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-travel-tech-sunset-orange" />
                      </div>
                      <div className="text-xs text-gray-300 bg-travel-tech-dark-base/40 rounded-lg px-2 py-1">
                        Qual a previsão de receita turística para o trimestre?
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="flex items-start space-x-2 justify-end"
                    >
                      <div className="text-xs text-travel-tech-sunset-orange bg-travel-tech-sunset-orange/20 rounded-lg px-2 py-1 max-w-40">
                        Baseado nos dados históricos e tendências, projeta-se aumento de 18%...
                      </div>
                      <Zap className="w-6 h-6 text-travel-tech-sunset-orange" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Data Flow */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
                <motion.div
                  animate={{ x: [-100, 400] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/4 left-0 w-20 h-0.5 bg-gradient-to-r from-transparent via-travel-tech-turquoise to-transparent"
                />
              </div>
            </div>

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
                    activeDemo === index ? 'bg-travel-tech-turquoise/20 scale-110' : 'bg-travel-tech-turquoise/10'
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="pt-6"
            >
              <a href="/contato" className="group flex items-center justify-center w-full p-4 rounded-xl border-2 border-travel-tech-turquoise/50 text-travel-tech-turquoise hover:bg-travel-tech-turquoise hover:text-travel-tech-dark-base transition-all duration-300 backdrop-blur-sm">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">Agendar Demonstração</span>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlatformInActionSection;
