import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import robotImage from '@/assets/travel-tech-robot.png';
import { useRef, useCallback } from 'react';

/* ─── Sub-components ─── */

const HolographicPedestal = () => (
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-32 pointer-events-none">
    {/* Ground glow */}
    <div className="absolute inset-0 rounded-[50%] bg-emerald-500/20 blur-3xl scale-y-50" />
    {/* Spinning rings */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute left-1/2 bottom-4 -translate-x-1/2 rounded-full border border-emerald-400/30"
        style={{
          width: `${60 + i * 20}%`,
          height: `${20 + i * 6}%`,
          transformStyle: 'preserve-3d',
          perspective: '400px',
          rotateX: '70deg',
        }}
        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
        transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'linear' }}
      />
    ))}
    {/* Grid lines (perspective) */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          'linear-gradient(hsl(var(--ms-pantanal-green)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ms-pantanal-green)) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        transform: 'perspective(200px) rotateX(60deg)',
        transformOrigin: 'bottom center',
        maskImage: 'radial-gradient(ellipse at center bottom, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center bottom, black 30%, transparent 70%)',
      }}
    />
  </div>
);

const HoloPanel = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute backdrop-blur-md bg-emerald-950/30 border border-emerald-400/25 rounded-lg p-2 shadow-[0_0_15px_rgba(0,255,170,0.08)] ${className}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

/* Bar chart panel */
const BarChartPanel = () => (
  <HoloPanel className="top-[8%] right-[-8%] w-28 h-20 md:w-32 md:h-24" delay={0.3}>
    <p className="text-[8px] md:text-[9px] text-emerald-400/80 font-mono mb-1 tracking-wider">ANALYTICS</p>
    <div className="flex items-end gap-1 h-[60%]">
      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/60 to-emerald-300/80"
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
        />
      ))}
    </div>
  </HoloPanel>
);

/* AI Neural panel */
const AIPanel = () => (
  <HoloPanel className="top-[18%] left-[-10%] w-24 h-20 md:w-28 md:h-24" delay={0.5}>
    <div className="flex items-center gap-1 mb-1">
      <motion.div
        className="w-3 h-3 rounded-full bg-emerald-400/80"
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-[10px] md:text-xs font-bold text-emerald-300 font-mono">AI</span>
    </div>
    {/* Neural lines */}
    <svg viewBox="0 0 60 30" className="w-full h-8 opacity-70">
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <motion.circle
            key={`${row}-${col}`}
            cx={8 + col * 16}
            cy={6 + row * 10}
            r="2"
            fill="hsl(160 84% 60% / 0.7)"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: (row + col) * 0.2 }}
          />
        ))
      )}
      {/* connections */}
      <motion.line x1="8" y1="6" x2="24" y2="16" stroke="hsl(160 84% 60% / 0.3)" strokeWidth="0.5" />
      <motion.line x1="24" y1="16" x2="40" y2="6" stroke="hsl(160 84% 60% / 0.3)" strokeWidth="0.5" />
      <motion.line x1="40" y1="6" x2="56" y2="16" stroke="hsl(160 84% 60% / 0.3)" strokeWidth="0.5" />
      <motion.line x1="8" y1="16" x2="24" y2="26" stroke="hsl(160 84% 60% / 0.3)" strokeWidth="0.5" />
      <motion.line x1="24" y1="6" x2="40" y2="16" stroke="hsl(160 84% 60% / 0.3)" strokeWidth="0.5" />
    </svg>
  </HoloPanel>
);

/* Trend line panel */
const TrendPanel = () => (
  <HoloPanel className="bottom-[18%] right-[-6%] w-28 h-16 md:w-32 md:h-20" delay={0.7}>
    <p className="text-[8px] md:text-[9px] text-emerald-400/80 font-mono mb-0.5 tracking-wider">TREND</p>
    <svg viewBox="0 0 80 24" className="w-full">
      <motion.path
        d="M0,20 Q10,18 20,15 T40,10 T60,6 T80,2"
        fill="none"
        stroke="hsl(160 84% 60% / 0.8)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1, ease: 'easeOut' }}
      />
      <motion.path
        d="M0,20 Q10,18 20,15 T40,10 T60,6 T80,2 V24 H0 Z"
        fill="url(#trendGrad)"
        opacity="0.2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ delay: 2 }}
      />
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(160 84% 60%)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  </HoloPanel>
);

/* KPI panel */
const KPIPanel = () => (
  <HoloPanel className="bottom-[30%] left-[-8%] w-24 h-14 md:w-28 md:h-16" delay={0.9}>
    <p className="text-[7px] md:text-[8px] text-emerald-400/60 font-mono">SATISFAÇÃO</p>
    <motion.p
      className="text-lg md:text-xl font-bold text-emerald-300 font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <CountUp target={98.5} />%
    </motion.p>
  </HoloPanel>
);

/* Simple count-up */
const CountUp = ({ target }: { target: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  const startAnimation = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || hasRun.current) return;
      hasRun.current = true;
      ref.current = node;
      let start = 0;
      const duration = 1500;
      const t0 = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = target * eased;
        if (ref.current) ref.current.textContent = start.toFixed(1);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    [target]
  );

  return <span ref={startAnimation}>0</span>;
};

/* Floating particles */
const Particles = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-emerald-400/70"
        style={{
          left: `${10 + Math.random() * 80}%`,
          bottom: '10%',
        }}
        animate={{
          y: [0, -(80 + Math.random() * 120)],
          opacity: [0, 0.8, 0],
          scale: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2.5 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeOut',
        }}
      />
    ))}
  </>
);

/* Energy orbs */
const Orbs = () => (
  <>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full bg-emerald-400/50 blur-sm"
        style={{ top: '45%', left: '50%' }}
        animate={{
          x: [0, Math.cos((i * 2 * Math.PI) / 3) * 100, 0],
          y: [0, Math.sin((i * 2 * Math.PI) / 3) * 60, 0],
          opacity: [0.2, 0.7, 0.2],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          delay: i * 1.3,
          ease: 'easeInOut',
        }}
      />
    ))}
  </>
);

/* ─── Main Component ─── */

const TravelTechRobot = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20 };
  const panelX = useSpring(useTransform(mouseX, [-200, 200], [8, -8]), springConfig);
  const panelY = useSpring(useTransform(mouseY, [-200, 200], [6, -6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto select-none group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/8 blur-[80px] scale-125" />

      {/* Pedestal */}
      <HolographicPedestal />

      {/* Robot image with mask blend */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.img
          src={robotImage}
          alt="Robô IA da ViaJARTur - Travel Tech"
          className="w-full h-auto drop-shadow-[0_20px_60px_rgba(0,255,170,0.15)] transition-all duration-500 group-hover:drop-shadow-[0_20px_80px_rgba(0,255,170,0.25)]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 75%, transparent 98%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 98%)',
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          draggable={false}
        />
      </motion.div>

      {/* Holographic panels with parallax */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ x: panelX, y: panelY }}
      >
        <BarChartPanel />
        <AIPanel />
        <TrendPanel />
        <KPIPanel />
      </motion.div>

      {/* Particles & orbs */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
        <Particles />
        <Orbs />
      </div>

      {/* Eye glow overlays */}
      <motion.div
        className="absolute w-[6%] h-[6%] rounded-full bg-emerald-400/50 blur-md z-20"
        style={{ top: '28%', left: '52%' }}
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[5%] h-[5%] rounded-full bg-emerald-400/40 blur-md z-20"
        style={{ top: '29%', left: '62%' }}
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl" style={{ mixBlendMode: 'overlay' }}>
        <motion.div
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent absolute"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

export default TravelTechRobot;
