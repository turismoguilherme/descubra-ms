
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain,
  Database,
  Users,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Heart
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Inteligência que Surpreende",
      description: "IA que analisa comportamentos turísticos e gera insights valiosos para tomada de decisões estratégicas",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Database,
      title: "Dados Sempre Atualizados",
      description: "Importação automática de eventos, atrativos e informações turísticas de múltiplas fontes",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Users,
      title: "Gestão Colaborativa",
      description: "Plataforma hierárquica para estados, municípios e operadores trabalharem juntos",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      icon: TrendingUp,
      title: "Resultados Mensuráveis",
      description: "Relatórios detalhados que provam o retorno do investimento em turismo",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Globe,
      title: "Alcance Internacional",
      description: "Plataforma preparada para turismo global com suporte a múltiplos idiomas",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Shield,
      title: "Segurança de Classe Mundial",
      description: "Infraestrutura robusta com conformidade LGPD e backup automático",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background mais orgânico */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Zap className="h-6 w-6 text-orange-500" />
            <span className="text-orange-600 font-semibold text-lg">Funcionalidades</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-gray-900 leading-tight">
            Tecnologia que
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              {" "}Transforma{" "}
            </span>
            Destinos
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cada funcionalidade foi pensada para resolver desafios reais da gestão turística, 
            criando experiências únicas para visitantes e resultados concretos para destinos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className={`h-full border-0 shadow-lg hover:shadow-xl transition-all duration-500 group hover:scale-105 ${feature.bgColor}/50 backdrop-blur-sm`}>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Elemento decorativo */}
                  <div className="mt-6 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-500">Testado e aprovado</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
