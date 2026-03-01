import React from 'react';
import robotImg from '@/assets/travel-tech-robot.png';

const TravelTechRobot = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Glow de fundo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full bg-cyan-500/10 tt-glow-pulse" />
      </div>

      {/* Órbitas tech */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-80 h-80 rounded-full border border-cyan-400/20 tt-orbit-1" />
        <div className="absolute w-72 h-72 rounded-full border border-cyan-400/10 tt-orbit-2" />
      </div>

      {/* Partículas de dados */}
      <div className="absolute tt-particle tt-particle-1 w-2 h-2 rounded-full bg-cyan-400/60" />
      <div className="absolute tt-particle tt-particle-2 w-1.5 h-1.5 rounded-full bg-cyan-300/50" />
      <div className="absolute tt-particle tt-particle-3 w-2.5 h-2.5 rounded-full bg-blue-400/40" />
      <div className="absolute tt-particle tt-particle-4 w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
      <div className="absolute tt-particle tt-particle-5 w-2 h-2 rounded-full bg-blue-300/60" />
      <div className="absolute tt-particle tt-particle-6 w-1 h-1 rounded-full bg-cyan-400/70" />

      {/* Robô com flutuação */}
      <div className="relative tt-float z-10">
        <img
          src={robotImg}
          alt="Robô ViajARTur - Travel Tech AI"
          className="w-64 sm:w-72 md:w-80 lg:w-96 h-auto drop-shadow-2xl"
          loading="eager"
        />
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .tt-float, .tt-glow-pulse, .tt-orbit-1, .tt-orbit-2,
          .tt-particle { animation: none !important; }
        }

        .tt-float {
          animation: ttFloat 4s ease-in-out infinite;
        }
        @keyframes ttFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .tt-glow-pulse {
          animation: ttGlow 3s ease-in-out infinite;
        }
        @keyframes ttGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        .tt-orbit-1 {
          animation: ttOrbit1 12s linear infinite;
        }
        @keyframes ttOrbit1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tt-orbit-2 {
          animation: ttOrbit2 18s linear infinite reverse;
        }
        @keyframes ttOrbit2 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tt-particle-1 { top: 15%; left: 20%; animation: ttP1 5s ease-in-out infinite; }
        .tt-particle-2 { top: 25%; right: 15%; animation: ttP2 6s ease-in-out infinite 0.5s; }
        .tt-particle-3 { bottom: 30%; left: 10%; animation: ttP3 7s ease-in-out infinite 1s; }
        .tt-particle-4 { bottom: 20%; right: 20%; animation: ttP4 5.5s ease-in-out infinite 1.5s; }
        .tt-particle-5 { top: 40%; left: 8%; animation: ttP5 6.5s ease-in-out infinite 0.8s; }
        .tt-particle-6 { top: 10%; right: 30%; animation: ttP6 4.5s ease-in-out infinite 0.3s; }

        @keyframes ttP1 { 0%,100% { transform: translate(0,0); opacity:0.6; } 50% { transform: translate(10px,-15px); opacity:1; } }
        @keyframes ttP2 { 0%,100% { transform: translate(0,0); opacity:0.5; } 50% { transform: translate(-12px,10px); opacity:1; } }
        @keyframes ttP3 { 0%,100% { transform: translate(0,0); opacity:0.4; } 50% { transform: translate(15px,8px); opacity:0.9; } }
        @keyframes ttP4 { 0%,100% { transform: translate(0,0); opacity:0.5; } 50% { transform: translate(-8px,-12px); opacity:1; } }
        @keyframes ttP5 { 0%,100% { transform: translate(0,0); opacity:0.6; } 50% { transform: translate(12px,-6px); opacity:0.8; } }
        @keyframes ttP6 { 0%,100% { transform: translate(0,0); opacity:0.7; } 50% { transform: translate(-6px,14px); opacity:1; } }
      `}</style>
    </div>
  );
};

export default TravelTechRobot;
