import React from 'react';
import { motion } from 'framer-motion';

const TravelTechRobot: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
      {/* Bokeh Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute w-32 h-32 rounded-full bg-orange-500/20 blur-3xl top-10 left-10 animate-pulse-slow" />
        <div className="absolute w-24 h-24 rounded-full bg-red-500/15 blur-3xl top-1/3 right-16 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute w-28 h-28 rounded-full bg-green-500/15 blur-3xl bottom-20 left-1/4 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute w-20 h-20 rounded-full bg-travel-tech-turquoise/10 blur-2xl bottom-10 right-10 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Robot Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10"
      >
        <svg
          viewBox="0 0 500 600"
          className="w-[280px] h-[340px] sm:w-[340px] sm:h-[400px] lg:w-[420px] lg:h-[500px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
              <stop offset="60%" stopColor="#22c55e" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#22c55e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="50%" stopColor="#16162a" />
              <stop offset="100%" stopColor="#0f0f23" />
            </linearGradient>
            <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a3e" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* === ROBOT BODY (profile-left facing) === */}
          
          {/* Head - oval shape */}
          <g className="robot-head">
            <ellipse cx="230" cy="130" rx="55" ry="65" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.3" />
            {/* Head highlight */}
            <ellipse cx="220" cy="115" rx="30" ry="35" fill="#1e1e35" fillOpacity="0.5" />
            
            {/* Left Eye (large, glowing green) */}
            <circle cx="210" cy="125" r="16" fill="url(#eyeGlow)" filter="url(#strongGlow)">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="210" cy="125" r="10" fill="#22c55e" fillOpacity="0.9">
              <animate attributeName="r" values="10;11;10" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="210" cy="122" r="4" fill="#ffffff" fillOpacity="0.7" />
            
            {/* Right Eye (slightly behind due to profile) */}
            <circle cx="245" cy="128" r="12" fill="url(#eyeGlow)" filter="url(#strongGlow)">
              <animate attributeName="opacity" values="0.7;0.9;0.7" dur="2s" repeatCount="indefinite" begin="0.3s" />
            </circle>
            <circle cx="245" cy="128" r="7" fill="#22c55e" fillOpacity="0.7" />
            <circle cx="245" cy="126" r="3" fill="#ffffff" fillOpacity="0.5" />
          </g>

          {/* Neck */}
          <rect x="220" y="190" width="25" height="20" rx="5" fill="url(#bodyGrad)" />
          <circle cx="232" cy="200" r="3" fill="#22c55e" fillOpacity="0.5" filter="url(#neonGlow)">
            <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
          </circle>

          {/* Torso - cylindrical */}
          <rect x="190" y="210" width="90" height="140" rx="20" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.2" />
          
          {/* Chest Circle (neon green accent) */}
          <circle cx="235" cy="270" r="28" fill="none" stroke="#22c55e" strokeWidth="2" filter="url(#neonGlow)">
            <animate attributeName="strokeOpacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="235" cy="270" r="20" fill="url(#chestGlow)">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Inner data ring */}
          <circle cx="235" cy="270" r="15" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="4 3" strokeOpacity="0.6">
            <animateTransform attributeName="transform" type="rotate" values="0 235 270;360 235 270" dur="8s" repeatCount="indefinite" />
          </circle>

          {/* Joint accents (shoulders) */}
          <circle cx="190" cy="225" r="8" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="1.5" filter="url(#neonGlow)">
            <animate attributeName="strokeOpacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="280" cy="225" r="8" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="1.5" filter="url(#neonGlow)">
            <animate attributeName="strokeOpacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
          </circle>

          {/* === RIGHT ARM (pointing up) === */}
          <g className="robot-right-arm">
            <animateTransform attributeName="transform" type="rotate" values="-2 280 225;2 280 225;-2 280 225" dur="4s" repeatCount="indefinite" />
            {/* Upper arm */}
            <rect x="282" y="195" width="16" height="50" rx="8" fill="url(#armGrad)" transform="rotate(-30 290 220)" />
            {/* Elbow joint */}
            <circle cx="305" cy="195" r="5" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.5" />
            {/* Forearm pointing up */}
            <rect x="300" y="145" width="14" height="50" rx="7" fill="url(#armGrad)" transform="rotate(-10 307 170)" />
            {/* Hand - pointing finger */}
            <circle cx="305" cy="140" r="4" fill="url(#armGrad)" />
            <rect x="303" y="118" width="4" height="22" rx="2" fill="url(#armGrad)" />
            {/* Fingertip glow */}
            <circle cx="305" cy="116" r="3" fill="#22c55e" fillOpacity="0.6" filter="url(#neonGlow)">
              <animate attributeName="fillOpacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* === LEFT ARM (slightly flexed) === */}
          <g className="robot-left-arm">
            <animateTransform attributeName="transform" type="rotate" values="1 190 225;-1 190 225;1 190 225" dur="5s" repeatCount="indefinite" />
            {/* Upper arm */}
            <rect x="158" y="225" width="16" height="50" rx="8" fill="url(#armGrad)" transform="rotate(15 166 250)" />
            {/* Elbow joint */}
            <circle cx="165" cy="275" r="5" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.5" />
            {/* Forearm */}
            <rect x="155" y="278" width="14" height="40" rx="7" fill="url(#armGrad)" transform="rotate(25 162 298)" />
            {/* Hand */}
            <circle cx="170" cy="318" r="6" fill="url(#armGrad)" />
          </g>

          {/* Lower body / waist */}
          <rect x="205" y="345" width="60" height="15" rx="8" fill="url(#bodyGrad)" />
          <circle cx="235" cy="352" r="3" fill="#22c55e" fillOpacity="0.4" filter="url(#neonGlow)" />
          
          {/* Legs (simplified) */}
          <rect x="210" y="358" width="18" height="55" rx="9" fill="url(#armGrad)" />
          <rect x="242" y="358" width="18" height="55" rx="9" fill="url(#armGrad)" />
          {/* Knee joints */}
          <circle cx="219" cy="388" r="4" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.4" />
          <circle cx="251" cy="388" r="4" fill="url(#bodyGrad)" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.4" />
          {/* Feet */}
          <ellipse cx="219" cy="418" rx="12" ry="5" fill="url(#bodyGrad)" />
          <ellipse cx="251" cy="418" rx="12" ry="5" fill="url(#bodyGrad)" />

          {/* === HOLOGRAPHIC SCREENS === */}

          {/* Screen 1 - Top right (bar chart) */}
          <g opacity="0.85">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="3s" repeatCount="indefinite" />
            <rect x="340" y="90" width="120" height="80" rx="6" fill="url(#screenGrad)" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.4" />
            {/* Bar chart - red/green bars */}
            <rect x="355" y="140" width="10" height="20" rx="1" fill="#22c55e" fillOpacity="0.7">
              <animate attributeName="height" values="20;30;20" dur="2s" repeatCount="indefinite" />
              <animate attributeName="y" values="140;130;140" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="370" y="130" width="10" height="30" rx="1" fill="#ef4444" fillOpacity="0.6">
              <animate attributeName="height" values="30;15;30" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="y" values="130;145;130" dur="2.5s" repeatCount="indefinite" />
            </rect>
            <rect x="385" y="125" width="10" height="35" rx="1" fill="#22c55e" fillOpacity="0.7">
              <animate attributeName="height" values="35;20;35" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="y" values="125;140;125" dur="1.8s" repeatCount="indefinite" />
            </rect>
            <rect x="400" y="135" width="10" height="25" rx="1" fill="#ef4444" fillOpacity="0.6">
              <animate attributeName="height" values="25;35;25" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="y" values="135;125;135" dur="2.2s" repeatCount="indefinite" />
            </rect>
            <rect x="415" y="120" width="10" height="40" rx="1" fill="#22c55e" fillOpacity="0.7" />
            {/* Label */}
            <text x="350" y="105" fill="#22c55e" fillOpacity="0.8" fontSize="8" fontFamily="monospace">ANALYTICS</text>
            {/* Scan line */}
            <line x1="340" y1="90" x2="460" y2="90" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.3">
              <animate attributeName="y1" values="90;170;90" dur="3s" repeatCount="indefinite" />
              <animate attributeName="y2" values="90;170;90" dur="3s" repeatCount="indefinite" />
            </line>
          </g>

          {/* Screen 2 - Middle right (trend line + AI label) */}
          <g opacity="0.8">
            <animateTransform attributeName="transform" type="translate" values="0 0;3 -3;0 0" dur="4s" repeatCount="indefinite" />
            <rect x="350" y="195" width="110" height="70" rx="6" fill="url(#screenGrad)" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.4" />
            {/* Trend line */}
            <polyline
              points="360,245 375,235 390,240 405,220 420,225 435,210 445,215"
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              filter="url(#neonGlow)"
            >
              <animate attributeName="stroke-dashoffset" values="200;0" dur="3s" repeatCount="indefinite" />
            </polyline>
            <text x="360" y="210" fill="#06b6d4" fillOpacity="0.9" fontSize="12" fontWeight="bold" fontFamily="monospace">AI</text>
            <text x="382" y="210" fill="#22c55e" fillOpacity="0.6" fontSize="7" fontFamily="monospace">FORECAST</text>
          </g>

          {/* Screen 3 - Bottom right (data list + gauge) */}
          <g opacity="0.75">
            <animateTransform attributeName="transform" type="translate" values="0 0;-2 4;0 0" dur="3.5s" repeatCount="indefinite" />
            <rect x="330" y="290" width="100" height="65" rx="6" fill="url(#screenGrad)" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.3" />
            {/* Data list lines */}
            <rect x="340" y="302" width="40" height="3" rx="1" fill="#22c55e" fillOpacity="0.5" />
            <rect x="340" y="310" width="55" height="3" rx="1" fill="#06b6d4" fillOpacity="0.4" />
            <rect x="340" y="318" width="35" height="3" rx="1" fill="#22c55e" fillOpacity="0.5" />
            <rect x="340" y="326" width="48" height="3" rx="1" fill="#06b6d4" fillOpacity="0.4" />
            {/* Mini gauge */}
            <circle cx="405" cy="320" r="15" fill="none" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="70 30" />
            <circle cx="405" cy="320" r="15" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="50 50" filter="url(#neonGlow)">
              <animateTransform attributeName="transform" type="rotate" values="0 405 320;360 405 320" dur="4s" repeatCount="indefinite" />
            </circle>
            <text x="399" y="323" fill="#22c55e" fillOpacity="0.8" fontSize="8" fontFamily="monospace">87%</text>
          </g>

          {/* Screen 4 - Top left (network/circular icon) */}
          <g opacity="0.7">
            <animateTransform attributeName="transform" type="translate" values="0 0;2 -4;0 0" dur="3.8s" repeatCount="indefinite" />
            <rect x="60" y="120" width="80" height="60" rx="6" fill="url(#screenGrad)" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.3" />
            {/* Network nodes */}
            <circle cx="85" cy="145" r="4" fill="#22c55e" fillOpacity="0.7" />
            <circle cx="105" cy="135" r="3" fill="#06b6d4" fillOpacity="0.6" />
            <circle cx="120" cy="155" r="3.5" fill="#22c55e" fillOpacity="0.7" />
            <circle cx="95" cy="160" r="3" fill="#06b6d4" fillOpacity="0.6" />
            {/* Connection lines */}
            <line x1="85" y1="145" x2="105" y2="135" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="105" y1="135" x2="120" y2="155" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="120" y1="155" x2="95" y2="160" stroke="#22c55e" strokeWidth="0.8" strokeOpacity="0.4" />
            <line x1="95" y1="160" x2="85" y2="145" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.4" />
            <text x="70" y="130" fill="#06b6d4" fillOpacity="0.7" fontSize="7" fontFamily="monospace">NETWORK</text>
          </g>

          {/* === DATA PARTICLES === */}
          {[...Array(8)].map((_, i) => (
            <circle
              key={i}
              cx={280 + Math.cos(i * 0.8) * 80}
              cy={200 + Math.sin(i * 0.8) * 100}
              r="1.5"
              fill="#22c55e"
              fillOpacity="0.5"
            >
              <animate
                attributeName="cx"
                values={`${280 + Math.cos(i * 0.8) * 80};${300 + Math.cos(i * 0.8 + 1) * 90};${280 + Math.cos(i * 0.8) * 80}`}
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${200 + Math.sin(i * 0.8) * 100};${210 + Math.sin(i * 0.8 + 1) * 110};${200 + Math.sin(i * 0.8) * 100}`}
                dur={`${3 + i * 0.5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="fillOpacity"
                values="0.3;0.8;0.3"
                dur={`${2 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Connection lines from robot to screens */}
          <line x1="305" y1="140" x2="340" y2="120" stroke="#22c55e" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4">
            <animate attributeName="strokeOpacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1="280" y1="250" x2="350" y2="230" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 4">
            <animate attributeName="strokeOpacity" values="0.1;0.4;0.1" dur="2.5s" repeatCount="indefinite" />
          </line>
          <line x1="170" y1="270" x2="140" y2="150" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4">
            <animate attributeName="strokeOpacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
          </line>

        </svg>
      </motion.div>

      {/* Ground Reflection */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-t from-travel-tech-turquoise/10 to-transparent rounded-full blur-xl" />

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          svg * {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TravelTechRobot;
