import React from 'react';
import { 
  Brain, 
  Map, 
  BarChart3, 
  Globe, 
  MessageCircle, 
  Plane,
  MapPin,
  TrendingUp,
  Zap
} from 'lucide-react';

interface FloatingTechElementsProps {
  variant?: 'hero' | 'section';
}

const FloatingTechElements: React.FC<FloatingTechElementsProps> = ({ 
  variant = 'section' 
}) => {
  const isHero = variant === 'hero';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Global Connection Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--travel-tech-turquoise))" />
            <stop offset="50%" stopColor="hsl(var(--travel-tech-ocean-blue))" />
            <stop offset="100%" stopColor="hsl(var(--travel-tech-sunset-orange))" />
          </linearGradient>
        </defs>
        
        {/* Animated Connection Lines */}
        <path 
          d="M 100 200 Q 300 100 500 300 Q 700 200 900 400"
          stroke="url(#connectionGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-data-flow"
        />
        <path 
          d="M 200 150 Q 400 50 600 250 Q 800 150 1000 350"
          stroke="url(#connectionGradient)"
          strokeWidth="1.5"
          fill="none"
          className="animate-data-flow-delayed"
        />
      </svg>

      {/* Floating AI Icons */}
      <div className="absolute top-20 left-1/4 text-travel-tech-turquoise animate-float-tech">
        <div className="relative p-3 bg-travel-tech-turquoise/10 backdrop-blur-sm rounded-full border border-travel-tech-turquoise/20">
          <Brain className="w-6 h-6" />
          <div className="absolute inset-0 rounded-full animate-neon-pulse border border-travel-tech-turquoise/40" />
        </div>
      </div>

      <div className="absolute top-40 right-1/3 text-travel-tech-ocean-blue animate-float-tech-delayed">
        <div className="relative p-3 bg-travel-tech-ocean-blue/10 backdrop-blur-sm rounded-full border border-travel-tech-ocean-blue/20">
          <BarChart3 className="w-6 h-6" />
          <div className="absolute inset-0 rounded-full animate-neon-pulse border border-travel-tech-ocean-blue/40" />
        </div>
      </div>

      <div className="absolute top-1/2 left-1/6 text-travel-tech-sunset-orange animate-float-tech">
        <div className="relative p-3 bg-travel-tech-sunset-orange/10 backdrop-blur-sm rounded-full border border-travel-tech-sunset-orange/20">
          <Globe className="w-6 h-6 animate-rotate-globe" />
          <div className="absolute inset-0 rounded-full animate-neon-pulse border border-travel-tech-sunset-orange/40" />
        </div>
      </div>

      <div className="absolute bottom-1/3 right-1/4 text-travel-tech-turquoise animate-float-tech-delayed">
        <div className="relative p-3 bg-travel-tech-turquoise/10 backdrop-blur-sm rounded-full border border-travel-tech-turquoise/20">
          <MessageCircle className="w-6 h-6" />
          <div className="absolute inset-0 rounded-full animate-neon-pulse border border-travel-tech-turquoise/40" />
        </div>
      </div>

      {/* Travel Icons */}
      <div className="absolute top-1/3 right-20 text-travel-tech-ocean-blue animate-float-tech">
        <div className="relative p-3 bg-travel-tech-ocean-blue/10 backdrop-blur-sm rounded-full border border-travel-tech-ocean-blue/20">
          <Plane className="w-6 h-6" />
          <div className="absolute inset-0 rounded-full animate-neon-pulse border border-travel-tech-ocean-blue/40" />
        </div>
      </div>

      <div className="absolute bottom-1/4 left-1/3 text-travel-tech-sunset-orange animate-float-tech-delayed">
        <div className="relative p-3 bg-travel-tech-sunset-orange/10 backdrop-blur-sm rounded-full border border-travel-tech-sunset-orange/20">
          <MapPin className="w-6 h-6" />
          <div className="absolute inset-0 rounded-full animate-neon-pulse border border-travel-tech-sunset-orange/40" />
        </div>
      </div>

      {isHero && (
        <>
          {/* Additional Hero Elements */}
          <div className="absolute top-1/4 right-1/6 text-travel-tech-turquoise animate-float-tech">
            <div className="relative p-4 bg-travel-tech-turquoise/10 backdrop-blur-sm rounded-xl border border-travel-tech-turquoise/20">
              <Map className="w-8 h-8" />
              <div className="absolute inset-0 rounded-xl animate-neon-pulse border border-travel-tech-turquoise/40" />
            </div>
          </div>

          <div className="absolute bottom-1/5 right-1/3 text-travel-tech-ocean-blue animate-float-tech-delayed">
            <div className="relative p-4 bg-travel-tech-ocean-blue/10 backdrop-blur-sm rounded-xl border border-travel-tech-ocean-blue/20">
              <TrendingUp className="w-8 h-8" />
              <div className="absolute inset-0 rounded-xl animate-neon-pulse border border-travel-tech-ocean-blue/40" />
            </div>
          </div>

          <div className="absolute top-2/3 left-20 text-travel-tech-sunset-orange animate-float-tech">
            <div className="relative p-4 bg-travel-tech-sunset-orange/10 backdrop-blur-sm rounded-xl border border-travel-tech-sunset-orange/20">
              <Zap className="w-8 h-8" />
              <div className="absolute inset-0 rounded-xl animate-neon-pulse border border-travel-tech-sunset-orange/40" />
            </div>
          </div>
        </>
      )}

      {/* Holographic Scan Effect */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-travel-tech-turquoise/30 to-transparent animate-holographic-scan" />
        <div className="absolute right-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-travel-tech-ocean-blue/30 to-transparent animate-holographic-scan" style={{ animationDelay: '1s' }} />
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-float-tech,
          .animate-float-tech-delayed,
          .animate-data-flow,
          .animate-data-flow-delayed,
          .animate-neon-pulse,
          .animate-holographic-scan,
          .animate-rotate-globe {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingTechElements;