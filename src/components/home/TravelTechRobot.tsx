import React, { useState } from 'react';
import { Brain, BarChart3, Database, Zap, Clock } from 'lucide-react';

// Try different import paths for the robot image
let robotImg;
try {
  robotImg = require('@/assets/travel-tech-robot.png');
} catch {
  try {
    robotImg = require('../../../assets/travel-tech-robot.png');
  } catch {
    try {
      robotImg = require('/src/assets/travel-tech-robot.png');
    } catch {
      robotImg = null;
    }
  }
}

interface TravelTechRobotProps {
  onMouseMove?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: () => void;
  rotateX?: number;
  rotateY?: number;
}

const TravelTechRobot: React.FC<TravelTechRobotProps> = ({ 
  onMouseMove, 
  onMouseLeave, 
  rotateX = 0, 
  rotateY = 0 
}) => {
  const [imageError, setImageError] = useState(false);
  return (
    <div 
      className="relative w-full max-w-lg lg:max-w-2xl mx-auto aspect-square flex items-center justify-center"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Intense cyan halo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-cyan-500/30 blur-3xl tt-glow-pulse" />
      </div>

      {/* Orbiting rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[28rem] h-[28rem] rounded-full border border-cyan-400/20 tt-orbit-1" />
        <div className="absolute w-80 h-80 rounded-full border border-cyan-400/10 tt-orbit-2" />
      </div>

      {/* Dense data particles */}
      <div className="absolute tt-particle tt-particle-1 w-3 h-3 rounded-full bg-cyan-400/70 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
      <div className="absolute tt-particle tt-particle-2 w-2 h-2 rounded-full bg-cyan-300/60 shadow-[0_0_6px_rgba(103,232,249,0.7)]" />
      <div className="absolute tt-particle tt-particle-3 w-3.5 h-3.5 rounded-full bg-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
      <div className="absolute tt-particle tt-particle-4 w-2 h-2 rounded-full bg-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
      <div className="absolute tt-particle tt-particle-5 w-2.5 h-2.5 rounded-full bg-blue-300/70 shadow-[0_0_7px_rgba(147,197,253,0.8)]" />
      <div className="absolute tt-particle tt-particle-6 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_rgba(6,182,212,0.9)]" />
      <div className="absolute tt-particle tt-particle-7 w-3 h-3 rounded-full bg-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
      <div className="absolute tt-particle tt-particle-8 w-2 h-2 rounded-full bg-cyan-300/65 shadow-[0_0_7px_rgba(103,232,249,0.7)]" />
      <div className="absolute tt-particle tt-particle-9 w-2.5 h-2.5 rounded-full bg-blue-500/55 shadow-[0_0_9px_rgba(59,130,246,0.7)]" />
      <div className="absolute tt-particle tt-particle-10 w-1.5 h-1.5 rounded-full bg-cyan-400/75 shadow-[0_0_6px_rgba(6,182,212,0.9)]" />
      <div className="absolute tt-particle tt-particle-11 w-3 h-3 rounded-full bg-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
      <div className="absolute tt-particle tt-particle-12 w-2 h-2 rounded-full bg-blue-300/70 shadow-[0_0_8px_rgba(147,197,253,0.8)]" />

      {/* Tech badges floating around */}
      <div className="absolute tt-badge tt-badge-1 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full text-cyan-100 text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.4)]">
        <Brain className="w-4 h-4" />
        <span>IA</span>
      </div>
      <div className="absolute tt-badge tt-badge-2 flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-100 text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)]">
        <Database className="w-4 h-4" />
        <span>Big Data</span>
      </div>
      <div className="absolute tt-badge tt-badge-3 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full text-cyan-100 text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.4)]">
        <BarChart3 className="w-4 h-4" />
        <span>ML</span>
      </div>
      <div className="absolute tt-badge tt-badge-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full text-emerald-100 text-sm font-medium shadow-[0_0_15px_rgba(52,211,153,0.4)]">
        <BarChart3 className="w-4 h-4" />
        <span>Analytics</span>
      </div>
      <div className="absolute tt-badge tt-badge-5 flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-100 text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)]">
        <Clock className="w-4 h-4" />
        <span>24/7</span>
      </div>

      {/* Main robot with parallax and hologram effects */}
      <div 
        className="relative tt-float z-10 transition-transform duration-500 ease-out"
        style={{ 
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
        }}
      >
        {/* Holographic scan lines overlay */}
        <div className="absolute inset-0 tt-scan-lines pointer-events-none">
          <div className="scan-line scan-line-1" />
          <div className="scan-line scan-line-2" />
          <div className="scan-line scan-line-3" />
          <div className="scan-line scan-line-4" />
        </div>
        
        {!imageError && robotImg ? (
          <img
            src={robotImg}
            alt="Robô ViajARTur - Travel Tech AI"
            className="w-72 sm:w-96 md:w-[28rem] lg:w-[34rem] h-auto drop-shadow-2xl"
            loading="eager"
            onError={() => {
              console.log('Failed to load robot image, switching to SVG fallback');
              setImageError(true);
            }}
          />
        ) : (
          // SVG Fallback Robot
          <div className="w-72 sm:w-96 md:w-[28rem] lg:w-[34rem] h-auto drop-shadow-2xl">
            <svg 
              viewBox="0 0 400 400" 
              className="w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Robot Body */}
              <rect x="150" y="200" width="100" height="120" rx="15" fill="url(#robotGradient)" stroke="#06b6d4" strokeWidth="2"/>
              
              {/* Robot Head */}
              <circle cx="200" cy="150" r="40" fill="url(#robotGradient)" stroke="#06b6d4" strokeWidth="2"/>
              
              {/* Eyes */}
              <circle cx="185" cy="140" r="8" fill="#06b6d4" className="animate-pulse"/>
              <circle cx="215" cy="140" r="8" fill="#06b6d4" className="animate-pulse"/>
              
              {/* Chest Display */}
              <rect x="170" y="220" width="60" height="40" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="1"/>
              <circle cx="200" cy="240" r="15" fill="none" stroke="#06b6d4" strokeWidth="2" className="animate-spin" style={{animationDuration: '3s'}}/>
              
              {/* Arms */}
              <rect x="120" y="210" width="25" height="60" rx="12" fill="url(#robotGradient)" stroke="#06b6d4" strokeWidth="1"/>
              <rect x="255" y="210" width="25" height="60" rx="12" fill="url(#robotGradient)" stroke="#06b6d4" strokeWidth="1"/>
              
              {/* Legs */}
              <rect x="165" y="325" width="25" height="60" rx="12" fill="url(#robotGradient)" stroke="#06b6d4" strokeWidth="1"/>
              <rect x="210" y="325" width="25" height="60" rx="12" fill="url(#robotGradient)" stroke="#06b6d4" strokeWidth="1"/>
              
              <defs>
                <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#64748b"/>
                  <stop offset="100%" stopColor="#334155"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .tt-float, .tt-glow-pulse, .tt-orbit-1, .tt-orbit-2,
          .tt-particle, .tt-badge, .tt-scan-lines { animation: none !important; }
        }

        .tt-float {
          animation: ttFloat 4s ease-in-out infinite;
        }
        @keyframes ttFloat {
          0%, 100% { transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(0); }
          50% { transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px); }
        }

        .tt-glow-pulse {
          animation: ttGlow 4s ease-in-out infinite;
        }
        @keyframes ttGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .tt-orbit-1 {
          animation: ttOrbit1 20s linear infinite;
        }
        @keyframes ttOrbit1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tt-orbit-2 {
          animation: ttOrbit2 30s linear infinite reverse;
        }
        @keyframes ttOrbit2 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Dense particle animations */
        .tt-particle-1 { top: 8%; left: 15%; animation: ttP1 6s ease-in-out infinite; }
        .tt-particle-2 { top: 20%; right: 12%; animation: ttP2 7s ease-in-out infinite 0.5s; }
        .tt-particle-3 { bottom: 25%; left: 8%; animation: ttP3 8s ease-in-out infinite 1s; }
        .tt-particle-4 { bottom: 15%; right: 18%; animation: ttP4 6.5s ease-in-out infinite 1.5s; }
        .tt-particle-5 { top: 35%; left: 5%; animation: ttP5 7.5s ease-in-out infinite 0.8s; }
        .tt-particle-6 { top: 12%; right: 25%; animation: ttP6 5.5s ease-in-out infinite 0.3s; }
        .tt-particle-7 { top: 60%; left: 20%; animation: ttP7 9s ease-in-out infinite 2s; }
        .tt-particle-8 { bottom: 40%; right: 8%; animation: ttP8 6s ease-in-out infinite 1.2s; }
        .tt-particle-9 { top: 45%; right: 35%; animation: ttP9 8.5s ease-in-out infinite 0.7s; }
        .tt-particle-10 { bottom: 35%; left: 30%; animation: ttP10 7s ease-in-out infinite 1.8s; }
        .tt-particle-11 { top: 25%; left: 40%; animation: ttP11 6.8s ease-in-out infinite 2.3s; }
        .tt-particle-12 { bottom: 50%; right: 40%; animation: ttP12 7.8s ease-in-out infinite 1.1s; }

        @keyframes ttP1 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.7; } 50% { transform: translate(15px,-20px) scale(1.2); opacity:1; } }
        @keyframes ttP2 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.6; } 50% { transform: translate(-18px,12px) scale(0.8); opacity:1; } }
        @keyframes ttP3 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.5; } 50% { transform: translate(20px,10px) scale(1.4); opacity:0.9; } }
        @keyframes ttP4 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.6; } 50% { transform: translate(-12px,-18px) scale(1.1); opacity:1; } }
        @keyframes ttP5 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.7; } 50% { transform: translate(16px,-8px) scale(0.9); opacity:0.8; } }
        @keyframes ttP6 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.8; } 50% { transform: translate(-10px,22px) scale(1.3); opacity:1; } }
        @keyframes ttP7 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.5; } 50% { transform: translate(25px,-15px) scale(1.2); opacity:0.9; } }
        @keyframes ttP8 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.6; } 50% { transform: translate(-20px,8px) scale(1.1); opacity:1; } }
        @keyframes ttP9 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.7; } 50% { transform: translate(12px,18px) scale(0.8); opacity:0.9; } }
        @keyframes ttP10 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.6; } 50% { transform: translate(-15px,-12px) scale(1.5); opacity:1; } }
        @keyframes ttP11 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.8; } 50% { transform: translate(18px,-25px) scale(1.1); opacity:1; } }
        @keyframes ttP12 { 0%,100% { transform: translate(0,0) scale(1); opacity:0.5; } 50% { transform: translate(-22px,14px) scale(1.3); opacity:0.9; } }

        /* Floating tech badges */
        .tt-badge-1 { top: 5%; left: 25%; animation: badgeFloat1 8s ease-in-out infinite; }
        .tt-badge-2 { top: 15%; right: 15%; animation: badgeFloat2 10s ease-in-out infinite 1s; }
        .tt-badge-3 { bottom: 20%; left: 10%; animation: badgeFloat3 9s ease-in-out infinite 2s; }
        .tt-badge-4 { bottom: 8%; right: 25%; animation: badgeFloat4 7s ease-in-out infinite 0.5s; }
        .tt-badge-5 { top: 40%; right: 5%; animation: badgeFloat5 11s ease-in-out infinite 1.5s; }

        @keyframes badgeFloat1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
        @keyframes badgeFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-8px,12px); } }
        @keyframes badgeFloat3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(15px,8px); } }
        @keyframes badgeFloat4 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-12px,-10px); } }
        @keyframes badgeFloat5 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(6px,18px); } }

        /* Holographic scan lines */
        .scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), transparent);
          animation: scanMove 3s ease-in-out infinite;
        }
        .scan-line-1 { top: 20%; animation-delay: 0s; }
        .scan-line-2 { top: 40%; animation-delay: 0.5s; }
        .scan-line-3 { top: 60%; animation-delay: 1s; }
        .scan-line-4 { top: 80%; animation-delay: 1.5s; }

        @keyframes scanMove {
          0%, 100% { opacity: 0; transform: scaleX(0); }
          50% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default TravelTechRobot;