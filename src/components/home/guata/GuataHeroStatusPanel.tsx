import { motion } from 'framer-motion';
import { BarChart3, BrainCircuit, MapPinned, Route, Sparkles } from 'lucide-react';
import { useGuataLabsContent } from '@/hooks/useGuataLabsContent';

const layers = [
  { icon: MapPinned, label: 'Inteligência territorial', detail: 'O destino lido em conjunto' },
  { icon: Route, label: 'Jornada do visitante', detail: 'Experiências que geram circulação' },
  { icon: BrainCircuit, label: 'Gestão com inteligência', detail: 'Informação para orientar decisões' },
];

export default function GuataHeroStatusPanel() {
  const { heroMascotUrl } = useGuataLabsContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.2, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-[520px] lg:ml-auto"
    >
      <div className="absolute -inset-8 rounded-full bg-guata-gold/10 blur-3xl" aria-hidden />
      <div className="relative overflow-hidden rounded-[2rem] border border-guata-cream/15 bg-guata-cream/[0.07] p-3 shadow-2xl backdrop-blur-md sm:p-5">
        <div className="flex items-center justify-between border-b border-guata-cream/10 px-2 pb-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-guata-cream p-1.5">
              <img src={heroMascotUrl} alt="" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-guata text-sm font-semibold text-guata-cream">Ecossistema Guatá</p>
              <p className="text-xs text-guata-cream/60">Tecnologia conectada ao território</p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-guata-gold/25 bg-guata-gold/10 px-3 py-1 text-[11px] font-medium text-guata-gold-light sm:flex">
            <Sparkles className="h-3 w-3" /> IA aplicada
          </span>
        </div>

        <div className="my-4 rounded-2xl border border-guata-cream/10 bg-guata-deep/70 p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-guata-gold-light">Visão integrada</p>
              <h2 className="font-guata text-2xl font-semibold text-guata-cream">O destino em perspectiva</h2>
            </div>
            <div className="rounded-xl border border-guata-gold/20 bg-guata-gold/10 p-2.5">
              <BarChart3 className="h-5 w-5 text-guata-gold-light" />
            </div>
          </div>

          <div className="flex h-24 items-end gap-2" aria-hidden>
            {[36, 52, 44, 68, 58, 82, 72, 92, 78, 96, 86, 100].map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: 0.45 + index * 0.035 }}
                className={`flex-1 rounded-t-sm ${index > 8 ? 'bg-guata-gold' : 'bg-guata-gold/25'}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-guata-cream/10 pt-3 text-[11px] text-guata-cream/50">
            <span>Informação organizada</span>
            <span>Leitura para ação</span>
          </div>
        </div>

        <div className="space-y-2">
          {layers.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-guata-cream/10 hover:bg-guata-cream/[0.05]">
              <div className="rounded-lg bg-guata-cream/10 p-2">
                <Icon className="h-4 w-4 text-guata-gold-light" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-guata-cream">{label}</p>
                <p className="truncate text-xs text-guata-cream/55">{detail}</p>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-guata-gold" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
