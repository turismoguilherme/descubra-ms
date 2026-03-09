import React from 'react';

interface TechBackgroundProps {
  variant?: 'hero' | 'section';
  className?: string;
}

const TechBackground: React.FC<TechBackgroundProps> = ({ 
  variant = 'section', 
  className = '' 
}) => {
  const isHero = variant === 'hero';
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base dark background */}
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Neural grid pattern */}
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Animated grid pulse */}
      <div 
        className="absolute inset-0 opacity-20 animate-pulse-slow" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      {isHero && (
        <>
          <div className="absolute top-1/2 left-1/2 w-[32rem] h-[32rem] bg-cyan-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="tech-particle tech-particle-1" />
        <div className="tech-particle tech-particle-2" />
        <div className="tech-particle tech-particle-3" />
        <div className="tech-particle tech-particle-4" />
        {isHero && (
          <>
            <div className="tech-particle tech-particle-5" />
            <div className="tech-particle tech-particle-6" />
            <div className="tech-particle tech-particle-7" />
            <div className="tech-particle tech-particle-8" />
          </>
        )}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .tech-particle { animation: none !important; }
        }

        .tech-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(6, 182, 212, 0.6);
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(6, 182, 212, 0.8);
        }

        .tech-particle-1 { top: 10%; left: 15%; animation: techFloat1 8s ease-in-out infinite; }
        .tech-particle-2 { top: 20%; right: 20%; animation: techFloat2 10s ease-in-out infinite 1s; }
        .tech-particle-3 { top: 70%; left: 25%; animation: techFloat3 12s ease-in-out infinite 2s; }
        .tech-particle-4 { bottom: 25%; right: 15%; animation: techFloat4 9s ease-in-out infinite 0.5s; }
        .tech-particle-5 { top: 40%; left: 5%; animation: techFloat5 11s ease-in-out infinite 1.5s; }
        .tech-particle-6 { top: 60%; right: 8%; animation: techFloat6 7s ease-in-out infinite 2.5s; }
        .tech-particle-7 { top: 15%; left: 60%; animation: techFloat7 13s ease-in-out infinite 0.8s; }
        .tech-particle-8 { bottom: 40%; right: 45%; animation: techFloat8 10s ease-in-out infinite 1.8s; }

        @keyframes techFloat1 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.6; } 50% { transform: translate(20px, -30px) scale(1.2); opacity: 1; } }
        @keyframes techFloat2 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.4; } 50% { transform: translate(-25px, 15px) scale(0.8); opacity: 0.9; } }
        @keyframes techFloat3 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.5; } 50% { transform: translate(30px, -20px) scale(1.5); opacity: 1; } }
        @keyframes techFloat4 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.7; } 50% { transform: translate(-15px, -25px) scale(1.1); opacity: 0.8; } }
        @keyframes techFloat5 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.3; } 50% { transform: translate(25px, 10px) scale(0.9); opacity: 0.9; } }
        @keyframes techFloat6 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.6; } 50% { transform: translate(-20px, -35px) scale(1.3); opacity: 1; } }
        @keyframes techFloat7 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.4; } 50% { transform: translate(35px, 20px) scale(0.7); opacity: 0.8; } }
        @keyframes techFloat8 { 0%,100% { transform: translate(0,0) scale(1); opacity: 0.8; } 50% { transform: translate(-30px, -10px) scale(1.4); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default TechBackground;