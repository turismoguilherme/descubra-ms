import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import RobotSVG from './RobotSVG';
import { useRef, useCallback, useState, useEffect } from 'react';

/* ─── Sub-components ─── */

const HolographicPedestal = () => (
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-32 pointer-events-none">
    <div className="absolute inset-0 rounded-[50%] bg-emerald-500/20 blur-3xl scale-y-50" />
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
    animate={{
      opacity: [0, 1, 1, 0.88, 1],
      scale: 1,
    }}
    transition={{
      opacity: { duration: 4, delay, repeat: Infinity, repeatType: 'loop', times: [0, 0.15, 0.7, 0.85, 1] },
      scale: { duration: 0.6, delay, ease: 'easeOut' },
    }}
  >
    {children}
  </motion.div>
);

/* Bar chart panel — bars continuously change height */
const BarChartPanel = () => {
  const [bars, setBars] = useState([40, 65, 50, 80, 60, 90, 75]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(h => {
        const delta = (Math.random() - 0.5) * 30;
        return Math.max(20, Math.min(95, h + delta));
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <HoloPanel className="top-[8%] right-[-8%] w-28 h-20 md:w-32 md:h-24" delay={0.3}>
      <p className="text-[8px] md:text-[9px] text-emerald-400/80 font-mono mb-1 tracking-wider">ANALYTICS</p>
      <div className="flex items-end gap-1 h-[60%]">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/60 to-emerald-300/80"
            animate={{ height: `${h}%` }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </HoloPanel>
  );
};

/* AI Neural panel — faster synapses */
const AIPanel = () => (
  <HoloPanel className="top-[18%] left-[-10%] w-24 h-20 md:w-28 md:h-24" delay={0.5}>
    <div className="flex items-center gap-1 mb-1">
      <motion.div
        className="w-3 h-3 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 1, 0.6],
          backgroundColor: ['hsl(160 84% 60%)', 'hsl(180 84% 60%)', 'hsl(160 84% 60%)'],
        }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <span className="text-[10px] md:text-xs font-bold text-emerald-300 font-mono">AI</span>
    </div>
    <svg viewBox="0 0 60 30" className="w-full h-8 opacity-70">
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <motion.circle
            key={`${row}-${col}`}
            cx={8 + col * 16}
            cy={6 + row * 10}
            r="2"
            fill="hsl(160 84% 60% / 0.7)"
            animate={{ opacity: [0.2, 1, 0.2], r: [1.5, 2.5, 1.5] }}
            transition={{ duration: 0.8 + Math.random() * 0.6, repeat: Infinity, delay: (row + col) * 0.15 }}
          />
        ))
      )}
      {/* Synapse connections with pulsing opacity */}
      {[
        [8, 6, 24, 16], [24, 16, 40, 6], [40, 6, 56, 16],
        [8, 16, 24, 26], [24, 6, 40, 16], [40, 16, 56, 26],
        [8, 26, 24, 16], [56, 6, 40, 16],
      ].map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="hsl(160 84% 60%)"
          strokeWidth="0.5"
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 0.6 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </svg>
  </HoloPanel>
);

/* Trend line panel — redraws in loop */
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
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.8, 1] }}
      />
      <motion.path
        d="M0,20 Q10,18 20,15 T40,10 T60,6 T80,2 V24 H0 Z"
        fill="url(#trendGrad)"
        animate={{ opacity: [0, 0.2, 0.2, 0] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.8, 1] }}
      />
      {/* Moving dot on the line */}
      <motion.circle
        r="2"
        fill="hsl(160 84% 60%)"
        animate={{
          cx: [0, 20, 40, 60, 80],
          cy: [20, 15, 10, 6, 2],
          opacity: [0, 1, 1, 1, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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

/* KPI panel — oscillating value */
const KPIPanel = () => {
  const [value, setValue] = useState(98.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(98.2 + Math.random() * 0.6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HoloPanel className="bottom-[30%] left-[-8%] w-24 h-14 md:w-28 md:h-16" delay={0.9}>
      <p className="text-[7px] md:text-[8px] text-emerald-400/60 font-mono">SATISFAÇÃO</p>
      <motion.p
        className="text-lg md:text-xl font-bold text-emerald-300 font-mono"
        key={value.toFixed(1)}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value.toFixed(1)}%
      </motion.p>
    </HoloPanel>
  );
};

/* Floating particles — more density + varied sizes */
const Particles = () => (
  <>
    {Array.from({ length: 16 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-emerald-400/70"
        style={{
          left: `${8 + Math.random() * 84}%`,
          bottom: '10%',
          width: `${2 + Math.random() * 3}px`,
          height: `${2 + Math.random() * 3}px`,
        }}
        animate={{
          y: [0, -(80 + Math.random() * 140)],
          opacity: [0, 0.8, 0],
          scale: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2 + Math.random() * 2.5,
          repeat: Infinity,
          delay: Math.random() * 4,
          ease: 'easeOut',
        }}
      />
    ))}
  </>
);

/* Energy orbs with trail effect */
const Orbs = () => (
  <>
    {[0, 1, 2].map((i) => (
      <div key={i}>
        {/* Main orb */}
        <motion.div
          className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400/50 blur-sm"
          style={{ top: '45%', left: '50%' }}
          animate={{
            x: [0, Math.cos((i * 2 * Math.PI) / 3) * 110, 0],
            y: [0, Math.sin((i * 2 * Math.PI) / 3) * 70, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{ duration: 3.5 + i * 0.8, repeat: Infinity, delay: i * 1.1, ease: 'easeInOut' }}
        />
        {/* Trail */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/25 blur-sm"
          style={{ top: '45%', left: '50%' }}
          animate={{
            x: [0, Math.cos((i * 2 * Math.PI) / 3) * 110, 0],
            y: [0, Math.sin((i * 2 * Math.PI) / 3) * 70, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: 3.5 + i * 0.8, repeat: Infinity, delay: i * 1.1 + 0.15, ease: 'easeInOut' }}
        />
      </div>
    ))}
  </>
);

/* Data streams connecting robot to panels */
const DataStreams = () => (
  <svg className="absolute inset-0 w-full h-full z-15 pointer-events-none" viewBox="0 0 400 400">
    {[
      { path: 'M200,180 Q280,120 350,80', delay: 0 },
      { path: 'M200,180 Q120,140 60,100', delay: 0.6 },
      { path: 'M200,250 Q300,260 360,280', delay: 1.2 },
      { path: 'M200,250 Q120,260 60,240', delay: 1.8 },
    ].map(({ path, delay }, i) => (
      <motion.path
        key={i}
        d={path}
        fill="none"
        stroke="hsl(160 84% 60% / 0.15)"
        strokeWidth="1"
        strokeDasharray="4 8"
        animate={{ strokeDashoffset: [0, -48] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay }}
      />
    ))}
  </svg>
);

/* ─── Main Component ─── */

const TravelTechRobot = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const springConfig = { stiffness: 150, damping: 20 };
  const panelX = useSpring(useTransform(mouseX, [-200, 200], [8, -8]), springConfig);
  const panelY = useSpring(useTransform(mouseY, [-200, 200], [6, -6]), springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
    setMousePos({ x, y });
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto select-none group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
        setMousePos({ x: 0, y: 0 });
      }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/8 blur-[80px] scale-125" />

      {/* Pedestal */}
      <HolographicPedestal />

      {/* Data streams */}
      <DataStreams />

      {/* Robot SVG — articulated with independent animations */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <RobotSVG mouseX={mousePos.x} mouseY={mousePos.y} />
        </motion.div>
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


      {/* Dual scan lines */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl" style={{ mixBlendMode: 'overlay' }}>
        <motion.div
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent absolute"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent absolute"
          animate={{ top: ['100%', '0%', '100%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
};

export default TravelTechRobot;
