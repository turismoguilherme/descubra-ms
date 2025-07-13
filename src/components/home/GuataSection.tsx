import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Sparkles, Map, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useInstitutionalContent } from "@/hooks/useInstitutionalContent";

const GuataSection = () => {
  const { getContentValue } = useInstitutionalContent();
  
  return (
    <section className="py-20 bg-gradient-to-br from-ms-primary-blue via-ms-pantanal-green to-ms-guavira-purple text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-5">Conheça o Guatá</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Sua <span className="font-semibold text-ms-golden">inteligência artificial</span> especializada em turismo 
              sul-mato-grossense. Guatá usa tecnologia avançada para 
              responder suas perguntas sobre <span className="font-semibold">destinos</span>, <span className="font-semibold">eventos</span>, 
              <span className="font-semibold"> roteiros</span> e muito mais!
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="grid gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-ms-golden rounded-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Conversas Inteligentes</h3>
                    <p className="text-white/80">
                      Pergunte sobre qualquer destino, evento ou atividade em Mato Grosso do Sul
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-ms-golden rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Recomendações Personalizadas</h3>
                    <p className="text-white/80">
                      Receba sugestões baseadas em seus interesses e preferências de viagem
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-ms-golden rounded-lg">
                    <Map className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Informações Precisas</h3>
                    <p className="text-white/80">
                      Dados sempre atualizados sobre localizações, horários e dicas importantes
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-ms-golden hover:bg-ms-golden/90 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link 
                  to="/guata" 
                  className="inline-flex items-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Conversar com o Guatá agora</span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Guatá Character */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative inline-block"
              >
                <div className="w-80 h-80 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 shadow-2xl">
                  <img 
                    src="/lovable-uploads/0a95baed-e289-4cbf-968c-c046719edb73.png"
                    className="w-64 h-64 object-cover rounded-full"
                    alt="Guatá" 
                  />
                </div>
                {/* Floating hearts animation */}
                <div className="absolute -top-4 -right-4">
                  <motion.div
                    animate={{ y: [-10, -20, -10], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-8 h-8 text-ms-golden fill-current" />
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-6"
              >
                <h3 className="text-2xl font-bold text-ms-guavira-purple mt-2">Guatá</h3>
                <p className="text-white/80 mt-2">Seu guia turístico virtual</p>
              </motion.div>
            </div>

            {/* Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-8 grid grid-cols-2 gap-4"
            >
              <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <Link to="/guata">
                  <div className="text-center">
                    <MessageSquare className="w-8 h-8 text-ms-golden mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Chat Direto</p>
                  </div>
                </Link>
              </Card>
              <Card className="p-4 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                <Link to="/destinos">
                  <div className="text-center">
                    <Map className="w-8 h-8 text-ms-golden mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Explorar Destinos</p>
                  </div>
                </Link>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GuataSection;