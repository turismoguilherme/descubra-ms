import { motion } from 'framer-motion';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';

/**
 * Mascote grande ao lado do hero — URL via CMS (`guata_mascot_hero`), fallback para logo Guatá Labs.
 */
export default function GuataHeroMascot() {
  const { heroMascotUrl, loading } = useGuataLabsContent();

  if (loading) {
    return (
      <div className="relative h-[400px] lg:h-[560px] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-guata-gold/40 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
      className="relative flex items-center justify-center h-[400px] lg:h-[560px]"
    >
      <div
        className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-guata-gold/15 to-guata-forest/10 blur-2xl animate-guata-breathe"
        aria-hidden
      />
      <div className="relative z-10 rounded-[2rem] bg-white p-4 shadow-lg ring-1 ring-guata-gold/30">
        <motion.img
          src={heroMascotUrl}
          alt="Guatá, mascote Guatá Labs"
          className="max-h-full w-auto max-w-[min(100%,420px)] object-contain drop-shadow-xl rounded-2xl"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}
