import { motion } from 'framer-motion';
import robotImage from '@/assets/travel-tech-robot.png';

const TravelTechRobot = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Glow backdrop */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl scale-110 animate-pulse" />
      
      {/* Main robot image */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.img
          src={robotImage}
          alt="Robô IA da ViaJARTur - Travel Tech"
          className="w-full h-auto rounded-2xl drop-shadow-[0_0_40px_rgba(0,255,170,0.15)]"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          draggable={false}
        />

        {/* Eye glow overlay - left eye */}
        <motion.div
          className="absolute w-[6%] h-[6%] rounded-full bg-emerald-400/60 blur-md"
          style={{ top: '28%', left: '52%' }}
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Eye glow overlay - right eye */}
        <motion.div
          className="absolute w-[5%] h-[5%] rounded-full bg-emerald-400/50 blur-md"
          style={{ top: '29%', left: '62%' }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Chest core glow */}
        <motion.div
          className="absolute w-[5%] h-[5%] rounded-full bg-emerald-400/40 blur-lg"
          style={{ top: '52%', left: '55%' }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating data particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/80"
            style={{
              top: `${20 + i * 10}%`,
              left: `${15 + i * 13}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2.5 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
          style={{ mixBlendMode: 'overlay' }}
        >
          <motion.div
            className="w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TravelTechRobot;
