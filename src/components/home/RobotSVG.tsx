import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RobotSVGProps {
  mouseX?: number;
  mouseY?: number;
}

const RobotSVG = ({ mouseX = 0, mouseY = 0 }: RobotSVGProps) => {
  const [blink, setBlink] = useState(false);
  const [chestBars, setChestBars] = useState([14, 18, 12, 20, 16]);

  // Blink every ~4s
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3500 + Math.random() * 1500);
    return () => clearInterval(id);
  }, []);

  // Chest display bars
  useEffect(() => {
    const id = setInterval(() => {
      setChestBars(prev => prev.map(h => Math.max(6, Math.min(22, h + (Math.random() - 0.5) * 10))));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Pupil follow mouse (clamped)
  const pupilOffsetX = Math.max(-3, Math.min(3, mouseX * 0.015));
  const pupilOffsetY = Math.max(-2, Math.min(2, mouseY * 0.01));

  return (
    <svg
      viewBox="0 0 260 360"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      style={{ filter: 'drop-shadow(0 20px 60px rgba(0,255,170,0.15))' }}
    >
      <defs>
        {/* Metal gradient */}
        <linearGradient id="metalBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b9daa" />
          <stop offset="30%" stopColor="#b8c6cf" />
          <stop offset="60%" stopColor="#97a8b3" />
          <stop offset="100%" stopColor="#6b7d8a" />
        </linearGradient>
        <linearGradient id="metalDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b7d8a" />
          <stop offset="100%" stopColor="#4a5a66" />
        </linearGradient>
        <linearGradient id="metalHead" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a0b0bb" />
          <stop offset="40%" stopColor="#c8d4dc" />
          <stop offset="70%" stopColor="#a0b0bb" />
          <stop offset="100%" stopColor="#7a8f9c" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a3d2e" />
          <stop offset="100%" stopColor="#062018" />
        </linearGradient>
        <linearGradient id="glowCyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        {/* Eye glow filter */}
        <filter id="eyeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="jointGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === ANTENNA === */}
      <motion.g
        style={{ originX: '130px', originY: '68px' }}
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <line x1="130" y1="68" x2="130" y2="38" stroke="#8b9daa" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="130" cy="34"
          r="5"
          fill="url(#glowCyan)"
          filter="url(#jointGlow)"
          animate={{ opacity: [0.6, 1, 0.6], r: [4, 6, 4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>

      {/* === HEAD === */}
      <motion.g
        style={{ originX: '130px', originY: '100px' }}
        animate={{ rotateY: [-12, 0, 12, 0, -12] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Head shape — rounded rectangle */}
        <rect x="82" y="66" width="96" height="72" rx="28" ry="28"
          fill="url(#metalHead)" stroke="#7a8f9c" strokeWidth="1" />
        
        {/* Head highlight */}
        <ellipse cx="130" cy="78" rx="30" ry="8" fill="white" opacity="0.08" />

        {/* Circuit lines on head */}
        <line x1="92" y1="90" x2="100" y2="90" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
        <line x1="160" y1="90" x2="168" y2="90" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />

        {/* === EYES === */}
        <g>
          {/* Left eye socket */}
          <ellipse cx="112" cy="98" rx="14" ry={blink ? 1 : 11} fill="#0a2a2a"
            stroke="#22d3ee" strokeWidth="1" opacity="0.9">
          </ellipse>
          {/* Left eye glow */}
          <motion.ellipse
            cx="112" cy="98"
            rx="11" ry={blink ? 0.5 : 8}
            fill="url(#glowCyan)"
            filter="url(#eyeGlow)"
            animate={{
              opacity: [0.7, 1, 0.7],
              fill: ['#34d399', '#22d3ee', '#34d399'],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Left pupil */}
          {!blink && (
            <circle
              cx={112 + pupilOffsetX}
              cy={98 + pupilOffsetY}
              r="3"
              fill="white"
              opacity="0.9"
            />
          )}

          {/* Right eye socket */}
          <ellipse cx="148" cy="98" rx="14" ry={blink ? 1 : 11} fill="#0a2a2a"
            stroke="#22d3ee" strokeWidth="1" opacity="0.9">
          </ellipse>
          {/* Right eye glow */}
          <motion.ellipse
            cx="148" cy="98"
            rx="11" ry={blink ? 0.5 : 8}
            fill="url(#glowCyan)"
            filter="url(#eyeGlow)"
            animate={{
              opacity: [0.7, 1, 0.7],
              fill: ['#34d399', '#22d3ee', '#34d399'],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          {/* Right pupil */}
          {!blink && (
            <circle
              cx={148 + pupilOffsetX}
              cy={98 + pupilOffsetY}
              r="3"
              fill="white"
              opacity="0.9"
            />
          )}
        </g>

        {/* Mouth — small line */}
        <rect x="118" y="118" width="24" height="3" rx="1.5" fill="#4a5a66" opacity="0.5" />
      </motion.g>

      {/* === NECK === */}
      <rect x="120" y="138" width="20" height="12" rx="4" fill="url(#metalDark)" />

      {/* === TORSO === */}
      <motion.g
        style={{ originX: '130px', originY: '200px' }}
        animate={{ scaleY: [1, 1.008, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Main torso */}
        <rect x="80" y="150" width="100" height="110" rx="18" ry="18"
          fill="url(#metalBody)" stroke="#7a8f9c" strokeWidth="1" />
        
        {/* Torso highlight */}
        <ellipse cx="130" cy="165" rx="35" ry="10" fill="white" opacity="0.06" />

        {/* Circuit details */}
        <line x1="88" y1="170" x2="98" y2="170" stroke="#22d3ee" strokeWidth="0.5" opacity="0.25" />
        <line x1="88" y1="175" x2="95" y2="175" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />
        <line x1="162" y1="170" x2="172" y2="170" stroke="#22d3ee" strokeWidth="0.5" opacity="0.25" />
        <line x1="165" y1="175" x2="172" y2="175" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />

        {/* === CHEST SCREEN === */}
        <rect x="102" y="182" width="56" height="40" rx="6" fill="url(#screenGrad)"
          stroke="#22d3ee" strokeWidth="0.8" opacity="0.9" />
        
        {/* Screen scan line */}
        <motion.rect
          x="104" y="184" width="52" height="1" rx="0.5"
          fill="#22d3ee" opacity="0.15"
          animate={{ y: [184, 218, 184] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Chest bars */}
        {chestBars.map((h, i) => (
          <motion.rect
            key={i}
            x={108 + i * 10}
            y={218 - h}
            width="6"
            height={h}
            rx="1"
            fill="url(#glowCyan)"
            opacity="0.7"
            animate={{ height: h, y: 218 - h }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        ))}

        {/* Globe hologram on chest — small circle */}
        <motion.circle
          cx="130" cy="192"
          r="4"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.8"
          animate={{ opacity: [0.4, 0.8, 0.4], r: [3.5, 4.5, 3.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.g>

      {/* === LEFT ARM === */}
      <motion.g
        style={{ originX: '80px', originY: '160px' }}
        animate={{ rotate: [3, -8, 3] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Upper arm */}
        <rect x="48" y="158" width="32" height="50" rx="12" fill="url(#metalBody)"
          stroke="#7a8f9c" strokeWidth="0.8" />
        
        {/* Shoulder joint */}
        <motion.circle cx="80" cy="164" r="6" fill="#4a5a66"
          stroke="url(#glowCyan)" strokeWidth="1.5" filter="url(#jointGlow)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Elbow joint */}
        <circle cx="64" cy="210" r="4" fill="#4a5a66"
          stroke="#22d3ee" strokeWidth="0.8" opacity="0.6" />

        {/* Forearm */}
        <rect x="52" y="212" width="24" height="40" rx="10" fill="url(#metalDark)" />

        {/* Left hand */}
        <ellipse cx="64" cy="256" rx="10" ry="8" fill="url(#metalBody)"
          stroke="#7a8f9c" strokeWidth="0.5" />
        {/* Fingers hint */}
        <rect x="56" y="260" width="5" height="8" rx="2.5" fill="url(#metalDark)" opacity="0.7" />
        <rect x="63" y="262" width="5" height="8" rx="2.5" fill="url(#metalDark)" opacity="0.7" />
        <rect x="70" y="260" width="5" height="8" rx="2.5" fill="url(#metalDark)" opacity="0.7" />
      </motion.g>

      {/* === RIGHT ARM === */}
      <motion.g
        style={{ originX: '180px', originY: '160px' }}
        animate={{ rotate: [-5, 15, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Upper arm */}
        <rect x="180" y="158" width="32" height="50" rx="12" fill="url(#metalBody)"
          stroke="#7a8f9c" strokeWidth="0.8" />

        {/* Shoulder joint */}
        <motion.circle cx="180" cy="164" r="6" fill="#4a5a66"
          stroke="url(#glowCyan)" strokeWidth="1.5" filter="url(#jointGlow)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />

        {/* Elbow joint */}
        <circle cx="196" cy="210" r="4" fill="#4a5a66"
          stroke="#22d3ee" strokeWidth="0.8" opacity="0.6" />

        {/* Forearm */}
        <rect x="184" y="212" width="24" height="40" rx="10" fill="url(#metalDark)" />

        {/* Right hand */}
        <ellipse cx="196" cy="256" rx="10" ry="8" fill="url(#metalBody)"
          stroke="#7a8f9c" strokeWidth="0.5" />
        <rect x="188" y="260" width="5" height="8" rx="2.5" fill="url(#metalDark)" opacity="0.7" />
        <rect x="195" y="262" width="5" height="8" rx="2.5" fill="url(#metalDark)" opacity="0.7" />
        <rect x="202" y="260" width="5" height="8" rx="2.5" fill="url(#metalDark)" opacity="0.7" />
      </motion.g>

      {/* === BASE / LEGS === */}
      <motion.g
        style={{ originX: '130px', originY: '280px' }}
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Hip connector */}
        <rect x="105" y="260" width="50" height="14" rx="6" fill="url(#metalDark)" />

        {/* Left leg */}
        <rect x="100" y="274" width="26" height="44" rx="10" fill="url(#metalBody)"
          stroke="#7a8f9c" strokeWidth="0.5" />
        {/* Left knee */}
        <circle cx="113" cy="296" r="3.5" fill="#4a5a66" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" />
        {/* Left foot */}
        <ellipse cx="113" cy="322" rx="14" ry="6" fill="url(#metalDark)"
          stroke="#7a8f9c" strokeWidth="0.5" />

        {/* Right leg */}
        <rect x="134" y="274" width="26" height="44" rx="10" fill="url(#metalBody)"
          stroke="#7a8f9c" strokeWidth="0.5" />
        {/* Right knee */}
        <circle cx="147" cy="296" r="3.5" fill="#4a5a66" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" />
        {/* Right foot */}
        <ellipse cx="147" cy="322" rx="14" ry="6" fill="url(#metalDark)"
          stroke="#7a8f9c" strokeWidth="0.5" />
      </motion.g>
    </svg>
  );
};

export default RobotSVG;
