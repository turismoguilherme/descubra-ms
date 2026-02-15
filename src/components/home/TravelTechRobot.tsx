import React from 'react';

const TravelTechRobot = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Robot body */}
      <div className="relative travel-tech-float">
        {/* Head */}
        <div className="relative mx-auto w-32 h-28 bg-gradient-to-b from-slate-300 to-slate-400 rounded-2xl border-2 border-slate-400 shadow-xl">
          {/* Eyes - azuis brilhantes */}
          <div className="absolute top-8 left-6 w-6 h-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white travel-tech-blink" />
          </div>
          <div className="absolute top-8 right-6 w-6 h-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white travel-tech-blink" />
          </div>
          
          {/* Mouth - curva sorridente */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-6 border-2 border-blue-500 border-t-0 rounded-b-full" />
          
          {/* Acentos laterais (sensores) */}
          <div className="absolute top-4 left-2 w-4 h-4 rounded-full bg-blue-500/30" />
          <div className="absolute top-4 right-2 w-4 h-4 rounded-full bg-blue-500/30" />
        </div>

        {/* Neck */}
        <div className="mx-auto w-10 h-6 bg-slate-400 rounded-b-sm" />

        {/* Body */}
        <div className="relative mx-auto w-48 h-52 bg-gradient-to-b from-slate-300 to-slate-500 rounded-3xl border-2 border-slate-400 shadow-2xl">
          {/* Chest screen com globo azul */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-28 bg-slate-900 rounded-xl border-2 border-blue-500/30 overflow-hidden shadow-inner">
            {/* Globo azul animado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-24 h-24">
                {/* Círculo base do globo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/50" />
                {/* Linhas de longitude */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                  <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" transform="rotate(60 50 50)"/>
                  <ellipse cx="50" cy="50" rx="45" ry="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" transform="rotate(-60 50 50)"/>
                  <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                </svg>
                {/* Pontos de dados */}
                <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-300 travel-tech-pulse" />
                <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-300 travel-tech-pulse animation-delay-1" />
                <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 rounded-full bg-blue-300 travel-tech-pulse animation-delay-2" />
              </div>
            </div>
            
            {/* Barras de dados ao redor */}
            <div className="absolute bottom-2 left-2 flex items-end gap-1">
              <div className="w-2 bg-blue-500/60 rounded-t travel-tech-bar-1" style={{ height: '8px' }} />
              <div className="w-2 bg-blue-500/60 rounded-t travel-tech-bar-2" style={{ height: '12px' }} />
              <div className="w-2 bg-blue-500/60 rounded-t travel-tech-bar-3" style={{ height: '6px' }} />
            </div>
            <div className="absolute bottom-2 right-2 flex items-end gap-1">
              <div className="w-2 bg-blue-500/60 rounded-t travel-tech-bar-4" style={{ height: '10px' }} />
              <div className="w-2 bg-blue-500/60 rounded-t travel-tech-bar-1" style={{ height: '14px' }} />
            </div>
          </div>

          {/* Arms */}
          <div className="absolute -left-8 top-12 w-6 h-32 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full border border-slate-400 shadow-lg" />
          <div className="absolute -right-8 top-12 w-6 h-32 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full border border-slate-400 shadow-lg" />

          {/* Hands */}
          <div className="absolute -left-10 top-40 w-8 h-8 bg-slate-400 rounded-full border border-slate-500" />
          <div className="absolute -right-10 top-40 w-8 h-8 bg-slate-400 rounded-full border border-slate-500" />

          {/* Legs */}
          <div className="absolute -bottom-2 left-8 w-8 h-16 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full border border-slate-500" />
          <div className="absolute -bottom-2 right-8 w-8 h-16 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full border border-slate-500" />

          {/* Feet */}
          <div className="absolute -bottom-4 left-6 w-12 h-4 bg-slate-500 rounded-full" />
          <div className="absolute -bottom-4 right-6 w-12 h-4 bg-slate-500 rounded-full" />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .travel-tech-float,
          .travel-tech-pulse,
          .travel-tech-blink,
          .travel-tech-bar-1,
          .travel-tech-bar-2,
          .travel-tech-bar-3,
          .travel-tech-bar-4 {
            animation: none !important;
          }
        }

        .travel-tech-float {
          animation: ttFloat 4s ease-in-out infinite;
        }
        @keyframes ttFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        .travel-tech-pulse {
          animation: ttPulse 2s ease-in-out infinite;
        }
        @keyframes ttPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .travel-tech-blink {
          animation: ttBlink 4s ease-in-out infinite;
        }
        @keyframes ttBlink {
          0%, 45%, 55%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }

        .travel-tech-bar-1 { animation: ttBar1 3s ease-in-out infinite; }
        .travel-tech-bar-2 { animation: ttBar2 3s ease-in-out infinite 0.3s; }
        .travel-tech-bar-3 { animation: ttBar3 3s ease-in-out infinite 0.6s; }
        .travel-tech-bar-4 { animation: ttBar4 3s ease-in-out infinite 0.9s; }

        @keyframes ttBar1 { 0%,100% { height: 8px; } 50% { height: 16px; } }
        @keyframes ttBar2 { 0%,100% { height: 12px; } 50% { height: 20px; } }
        @keyframes ttBar3 { 0%,100% { height: 6px; } 50% { height: 14px; } }
        @keyframes ttBar4 { 0%,100% { height: 10px; } 50% { height: 18px; } }

        .animation-delay-1 { animation-delay: 0.5s; }
        .animation-delay-2 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default TravelTechRobot;
