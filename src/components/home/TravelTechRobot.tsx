import React from 'react';
import { Plane, Map, BarChart3, Globe, MessageCircle, Brain, Wifi } from 'lucide-react';

const TravelTechRobot = () => {
  return (
    <div className="relative w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl aspect-square">
      {/* Floating icons */}
      <FloatingIcon icon={<Plane className="w-5 h-5" />} className="top-4 right-8 animation-delay-0" />
      <FloatingIcon icon={<Map className="w-5 h-5" />} className="top-16 left-2 animation-delay-1" />
      <FloatingIcon icon={<BarChart3 className="w-5 h-5" />} className="bottom-24 right-4 animation-delay-2" />
      <FloatingIcon icon={<Globe className="w-5 h-5" />} className="bottom-12 left-8 animation-delay-3" />
      <FloatingIcon icon={<MessageCircle className="w-5 h-5" />} className="top-1/3 right-0 animation-delay-4" />
      <FloatingIcon icon={<Brain className="w-4 h-4" />} className="top-8 left-1/3 animation-delay-2" />
      <FloatingIcon icon={<Wifi className="w-4 h-4" />} className="bottom-32 left-1/4 animation-delay-1" />

      {/* Connection lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
        <line x1="200" y1="120" x2="320" y2="60" stroke="hsl(var(--viajar-cyan))" strokeWidth="1" strokeDasharray="4 4" className="travel-tech-line" />
        <line x1="200" y1="120" x2="60" y2="100" stroke="hsl(var(--viajar-cyan))" strokeWidth="1" strokeDasharray="4 4" className="travel-tech-line" />
        <line x1="200" y1="280" x2="340" y2="240" stroke="hsl(var(--viajar-cyan))" strokeWidth="1" strokeDasharray="4 4" className="travel-tech-line" />
        <line x1="200" y1="280" x2="80" y2="320" stroke="hsl(var(--viajar-cyan))" strokeWidth="1" strokeDasharray="4 4" className="travel-tech-line" />
      </svg>

      {/* Robot body */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative travel-tech-float">
          {/* Head */}
          <div className="relative mx-auto w-28 h-24 bg-gradient-to-b from-viajar-cyan to-viajar-blue rounded-2xl border-2 border-viajar-cyan/30 shadow-lg shadow-viajar-cyan/20">
            {/* Eyes */}
            <div className="absolute top-6 left-5 w-5 h-5 rounded-full bg-white shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-viajar-slate travel-tech-blink" />
            </div>
            <div className="absolute top-6 right-5 w-5 h-5 rounded-full bg-white shadow-inner flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-viajar-slate travel-tech-blink" />
            </div>
            {/* Mouth - LED strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-2 h-1 rounded-full bg-viajar-emerald travel-tech-pulse" />
              <div className="w-2 h-1 rounded-full bg-viajar-emerald travel-tech-pulse animation-delay-1" />
              <div className="w-2 h-1 rounded-full bg-viajar-emerald travel-tech-pulse animation-delay-2" />
            </div>
            {/* Antenna */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-viajar-cyan/60">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-viajar-cyan travel-tech-pulse shadow-md shadow-viajar-cyan/50" />
            </div>
          </div>

          {/* Neck */}
          <div className="mx-auto w-8 h-4 bg-slate-400 rounded-b-sm" />

          {/* Body */}
          <div className="relative mx-auto w-40 h-44 bg-gradient-to-b from-viajar-slate to-slate-700 rounded-3xl border-2 border-viajar-cyan/20 shadow-xl">
            {/* Chest screen */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-20 bg-slate-900 rounded-xl border border-viajar-cyan/30 overflow-hidden">
              {/* Animated chart bars */}
              <div className="absolute bottom-2 left-3 flex items-end gap-1.5">
                <div className="w-3 bg-viajar-cyan/80 rounded-t travel-tech-bar-1" />
                <div className="w-3 bg-viajar-emerald/80 rounded-t travel-tech-bar-2" />
                <div className="w-3 bg-viajar-cyan/80 rounded-t travel-tech-bar-3" />
                <div className="w-3 bg-viajar-emerald/80 rounded-t travel-tech-bar-4" />
                <div className="w-3 bg-viajar-cyan/80 rounded-t travel-tech-bar-1" />
              </div>
              {/* Pulse line */}
              <svg className="absolute top-3 left-2 w-24 h-8 opacity-60" viewBox="0 0 100 30">
                <polyline
                  points="0,15 15,15 20,5 25,25 30,15 45,15 50,8 55,20 60,15 100,15"
                  fill="none"
                  stroke="hsl(var(--viajar-cyan))"
                  strokeWidth="1.5"
                  className="travel-tech-pulse-line"
                />
              </svg>
            </div>

            {/* Arms */}
            <div className="absolute -left-6 top-8 w-5 h-24 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full border border-viajar-cyan/10" />
            <div className="absolute -right-6 top-8 w-5 h-24 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full border border-viajar-cyan/10" />

            {/* Belt accent */}
            <div className="absolute bottom-12 left-0 right-0 h-1 bg-viajar-cyan/40" />

            {/* Power core */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-viajar-cyan/60 travel-tech-pulse shadow-md shadow-viajar-cyan/30" />
          </div>
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
          .travel-tech-bar-4,
          .travel-tech-pulse-line,
          .travel-tech-line,
          .travel-tech-icon-float {
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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
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

        @keyframes ttBar1 { 0%,100% { height: 12px; } 50% { height: 28px; } }
        @keyframes ttBar2 { 0%,100% { height: 20px; } 50% { height: 14px; } }
        @keyframes ttBar3 { 0%,100% { height: 8px; } 50% { height: 32px; } }
        @keyframes ttBar4 { 0%,100% { height: 24px; } 50% { height: 10px; } }

        .travel-tech-pulse-line {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: ttPulseLine 3s linear infinite;
        }
        @keyframes ttPulseLine {
          to { stroke-dashoffset: 0; }
        }

        .travel-tech-line {
          stroke-dashoffset: 0;
          animation: ttLine 4s linear infinite;
        }
        @keyframes ttLine {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -16; }
        }

        .travel-tech-icon-float {
          animation: ttIconFloat 5s ease-in-out infinite;
        }
        @keyframes ttIconFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }

        .animation-delay-0 .travel-tech-icon-float { animation-delay: 0s; }
        .animation-delay-1 .travel-tech-icon-float { animation-delay: 0.8s; }
        .animation-delay-2 .travel-tech-icon-float { animation-delay: 1.6s; }
        .animation-delay-3 .travel-tech-icon-float { animation-delay: 2.4s; }
        .animation-delay-4 .travel-tech-icon-float { animation-delay: 3.2s; }
      `}</style>
    </div>
  );
};

const FloatingIcon = ({ icon, className }: { icon: React.ReactNode; className?: string }) => (
  <div className={`absolute z-10 ${className}`}>
    <div className="travel-tech-icon-float">
      <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-viajar-cyan/20 shadow-lg flex items-center justify-center text-viajar-cyan">
        {icon}
      </div>
    </div>
  </div>
);

export default TravelTechRobot;
