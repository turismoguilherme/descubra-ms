import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Globe, 
  BarChart3, 
  MessageCircle, 
  Brain,
  Settings,
  TrendingUp,
  Map,
  Zap,
  Eye
} from 'lucide-react';

const TravelTechRobot: React.FC = () => {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  
  // Cycle through different animation states
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation(prev => (prev + 1) % 4);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const robotAnimations = [
    'analyzing', // Analisando dados
    'pointing',  // Apontando para mapa
    'dashboard', // Interagindo com dashboard
    'scanning'   // Escaneando ambiente
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Main Robot Body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        {/* Robot Head */}
        <motion.div
          animate={{ 
            rotateY: currentAnimation === 3 ? [0, 15, -15, 0] : 0,
            rotateX: currentAnimation === 0 ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 mx-auto mb-4"
        >
          {/* Head Shape */}
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-travel-tech-turquoise/20 to-travel-tech-ocean-blue/20 backdrop-blur-sm border border-travel-tech-turquoise/30 flex items-center justify-center">
            
            {/* Eyes */}
            <div className="flex space-x-4">
              <motion.div
                animate={{ 
                  scale: currentAnimation === 3 ? [1, 1.2, 1] : 1,
                  backgroundColor: currentAnimation === 3 ? 
                    ['hsl(var(--travel-tech-turquoise))', 'hsl(var(--travel-tech-sunset-orange))', 'hsl(var(--travel-tech-turquoise))'] : 
                    'hsl(var(--travel-tech-turquoise))'
                }}
                transition={{ duration: 0.5, repeat: currentAnimation === 3 ? Infinity : 0 }}
                className="w-4 h-4 rounded-full bg-travel-tech-turquoise shadow-[0_0_15px_currentColor]"
              />
              <motion.div
                animate={{ 
                  scale: currentAnimation === 3 ? [1, 1.2, 1] : 1,
                  backgroundColor: currentAnimation === 3 ? 
                    ['hsl(var(--travel-tech-turquoise))', 'hsl(var(--travel-tech-sunset-orange))', 'hsl(var(--travel-tech-turquoise))'] : 
                    'hsl(var(--travel-tech-turquoise))'
                }}
                transition={{ duration: 0.5, repeat: currentAnimation === 3 ? Infinity : 0, delay: 0.1 }}
                className="w-4 h-4 rounded-full bg-travel-tech-turquoise shadow-[0_0_15px_currentColor]"
              />
            </div>

            {/* Holographic Scan Effect */}
            {currentAnimation === 3 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-2xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-travel-tech-turquoise/60 animate-holographic-scan" />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Robot Body/Chest with Data Screen */}
        <motion.div
          animate={{ 
            y: currentAnimation === 0 ? [0, -5, 0] : 0 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-48 h-64 mx-auto rounded-3xl bg-gradient-to-br from-travel-tech-dark-secondary/40 to-travel-tech-dark-base/40 backdrop-blur-md border border-travel-tech-turquoise/30 shadow-2xl"
        >
          {/* Chest Screen */}
          <div className="absolute top-8 left-6 right-6 h-32 rounded-xl bg-gradient-to-br from-travel-tech-turquoise/20 to-travel-tech-ocean-blue/20 border border-travel-tech-turquoise/40 p-4 overflow-hidden">
            
            {/* Data Visualization */}
            <motion.div
              animate={{ opacity: currentAnimation === 0 ? [0.3, 1, 0.3] : 0.6 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full"
            >
              {currentAnimation === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-travel-tech-turquoise">
                    <span>Analytics</span>
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['8px', '16px', '8px'] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        className="bg-travel-tech-turquoise/60 rounded-sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {currentAnimation === 1 && (
                <div className="flex items-center justify-center h-full">
                  <Map className="w-8 h-8 text-travel-tech-ocean-blue animate-pulse" />
                </div>
              )}

              {currentAnimation === 2 && (
                <div className="space-y-1">
                  <Monitor className="w-4 h-4 text-travel-tech-turquoise mx-auto" />
                  <div className="space-y-1">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ width: ['20%', '80%', '40%'] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        className="h-1 bg-travel-tech-turquoise/60 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              {currentAnimation === 3 && (
                <div className="flex items-center justify-center h-full">
                  <Eye className="w-8 h-8 text-travel-tech-sunset-orange animate-pulse" />
                </div>
              )}
            </motion.div>

            {/* Data Flow Lines */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ x: [-20, 100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-2 left-0 w-2 h-0.5 bg-travel-tech-turquoise/60 rounded-full"
              />
              <motion.div
                animate={{ x: [100, -20] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1 }}
                className="absolute bottom-2 right-0 w-2 h-0.5 bg-travel-tech-ocean-blue/60 rounded-full"
              />
            </div>
          </div>

          {/* Robot Arms */}
          <div className="absolute top-16 -left-8 w-16 h-8">
            <motion.div
              animate={{ 
                rotate: currentAnimation === 1 ? [0, -30, 0] : 
                        currentAnimation === 2 ? [0, 45, 0] : 0
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full rounded-full bg-gradient-to-r from-travel-tech-turquoise/20 to-travel-tech-ocean-blue/20 border border-travel-tech-turquoise/30"
            />
          </div>

          <div className="absolute top-16 -right-8 w-16 h-8">
            <motion.div
              animate={{ 
                rotate: currentAnimation === 1 ? [0, 30, 0] : 
                        currentAnimation === 2 ? [0, -45, 0] : 0
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full rounded-full bg-gradient-to-r from-travel-tech-ocean-blue/20 to-travel-tech-sunset-orange/20 border border-travel-tech-ocean-blue/30"
            />
          </div>

          {/* Neon Pulse Ring */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-4 rounded-3xl border-2 border-travel-tech-turquoise/20 pointer-events-none"
          />
        </motion.div>

        {/* Robot Base */}
        <motion.div
          animate={{ 
            rotateY: currentAnimation === 0 ? [0, 360] : 0 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-24 h-8 mx-auto mt-4 rounded-full bg-gradient-to-r from-travel-tech-turquoise/20 via-travel-tech-ocean-blue/20 to-travel-tech-sunset-orange/20 border border-travel-tech-turquoise/30"
        />
      </motion.div>

      {/* Floating Interaction Elements */}
      {currentAnimation === 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute top-1/4 right-8 p-3 rounded-full bg-travel-tech-ocean-blue/20 backdrop-blur-sm border border-travel-tech-ocean-blue/30"
        >
          <Globe className="w-6 h-6 text-travel-tech-ocean-blue animate-spin" />
        </motion.div>
      )}

      {currentAnimation === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-1/4 left-8 p-4 rounded-xl bg-travel-tech-dark-secondary/40 backdrop-blur-sm border border-travel-tech-turquoise/30"
        >
          <div className="space-y-2">
            <BarChart3 className="w-6 h-6 text-travel-tech-turquoise" />
            <div className="text-xs text-travel-tech-turquoise">Dashboard</div>
          </div>
        </motion.div>
      )}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TravelTechRobot;